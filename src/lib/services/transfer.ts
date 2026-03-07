import { createClient } from '@supabase/supabase-js'
import { decrypt } from '@/lib/utils/encryption'
import { getSpotifyPlaylistTracks } from './spotify'
import { createYouTubePlaylist, searchYouTubeVideo, addVideoToYouTubePlaylist } from './youtube'
import { sendTransferCompleteEmail } from '@/lib/resend'

// Note: In Serverless functions on standard Vercel plans, this background process may timeout after 15 seconds.
// For true production use-cases, wrap this inside an Inngest / Vercel In-Background context, or deploy the API on Edge/Custom Servers.

// We must manually initialize the Supabase Admin client here because the SSR server client requires cookies context
// Since this is a background worker, there is no HTTP Request/Response cycle to parse cookies.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function processTransferJob(jobId: string) {
  try {
    // 1. Fetch Job and lock it into processing
    const { data: job, error: jobError } = await supabase
      .from('transfer_jobs')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', jobId)
      .select('*')
      .single()

    if (jobError || !job) {
      console.error(`[Transfer] Could not fetch/lock job ${jobId}`)
      return
    }

    const userId = job.user_id

    // 2. Fetch Credentials for Spotify and YouTube
    const { data: accounts, error: accountError } = await supabase
      .from('connected_accounts')
      .select('platform, access_token')
      .eq('user_id', userId)
      .in('platform', ['spotify', 'youtube'])

    if (accountError || !accounts || accounts.length !== 2) {
      await failJob(jobId, 'Missing platform credentials. Ensure both Spotify and YouTube are connected.')
      return
    }

    const spotifyTokenRaw = accounts.find(a => a.platform === 'spotify')?.access_token
    const youtubeTokenRaw = accounts.find(a => a.platform === 'youtube')?.access_token

    if (!spotifyTokenRaw || !youtubeTokenRaw) {
      await failJob(jobId, 'Invalid Credentials context.')
      return
    }

    const spotifyToken = decrypt(spotifyTokenRaw)
    const youtubeToken = decrypt(youtubeTokenRaw)

    // 3. Fetch Spotify Context
    let tracks = []
    try {
      tracks = await getSpotifyPlaylistTracks(spotifyToken, job.source_playlist_id)
    } catch (e: any) {
      await failJob(jobId, `Could not extract Spotify tracks: ${e.message}`)
      return
    }

    // Update job tracking size
    await supabase.from('transfer_jobs').update({ total_tracks: tracks.length }).eq('id', jobId)

    // 4. Initialize the Destination YouTube Playlist
    let targetPlaylistId = job.target_playlist_id
    if (!targetPlaylistId) {
      try {
        targetPlaylistId = await createYouTubePlaylist(youtubeToken, `${job.source_playlist_name} (PlaySync Clone)`, 'Imported dynamically via PlaySync.')
        await supabase.from('transfer_jobs').update({ target_playlist_id: targetPlaylistId, target_playlist_name: `${job.source_playlist_name} (PlaySync Clone)` }).eq('id', jobId)
      } catch (e: any) {
        await failJob(jobId, `Failed creating YouTube Playlist: ${e.message}`)
        return
      }
    }

    // 5. Run the Transfer Loop
    let transferred = 0
    let failed = 0

    // To avoid hitting API rate limits immediately, we process sequentially.
    for (const track of tracks) {
      try {
        const title = track.name
        const artist = track.artists[0]?.name || 'Unknown'
        const isrc = track.external_ids?.isrc

        // Search YouTube canonical video
        const videoId = await searchYouTubeVideo(youtubeToken, title, artist, isrc)

        if (!videoId) {
           failed++
           await logResult(jobId, title, artist, 'failed', 'No canonical video match found')
        } else {
           // Insert into Playlist
           await addVideoToYouTubePlaylist(youtubeToken, targetPlaylistId, videoId)
           transferred++
           await logResult(jobId, title, artist, 'success', null, videoId, 95.0)
        }

      } catch (e: any) {
        failed++
        await logResult(jobId, track.name, track.artists[0]?.name || 'Unknown', 'failed', e.message)
      }

      // Periodically ping Supabase so Real-Time UI updates!
      if ((transferred + failed) % 3 === 0) {
        await supabase.from('transfer_jobs').update({
          transferred_tracks: transferred,
          failed_tracks: failed,
          updated_at: new Date().toISOString()
        }).eq('id', jobId)
      }
    }

    // 6. Complete Job
    await supabase.from('transfer_jobs').update({
      status: 'completed',
      transferred_tracks: transferred,
      failed_tracks: failed,
      completed_at: new Date().toISOString()
    }).eq('id', jobId)

    // 7. Fire Transactional Email!
    const { data: profile } = await supabase.from('user_profiles').select('email, full_name').eq('id', userId).single()
    
    if (profile?.email) {
      await sendTransferCompleteEmail({
         toEmail: profile.email,
         userName: profile.full_name || 'Music Lover',
         sourcePlaylist: job.source_playlist_name,
         targetPlatform: job.target_platform,
         totalTracks: tracks.length,
         failedTracks: failed
      })
    }

  } catch (globalError: any) {
    console.error(`[Transfer] Global crash on job ${jobId}: ${globalError}`)
    await failJob(jobId, `Fatal internal error: ${globalError.message}`)
  }
}

async function failJob(jobId: string, errorMsg: string) {
  await supabase.from('transfer_jobs').update({
    status: 'failed',
    error_message: errorMsg,
    completed_at: new Date().toISOString(),
  }).eq('id', jobId)
}

async function logResult(jobId: string, trackName: string, artistName: string, status: string, errorMsg: string | null = null, targetVideoId: string | null = null, confidence: number | null = null) {
  await supabase.from('transfer_logs').insert({
    transfer_job_id: jobId,
    track_name: trackName,
    artist_name: artistName,
    status: status,
    error_message: errorMsg,
    target_video_id: targetVideoId,
    confidence_score: confidence
  })
}
