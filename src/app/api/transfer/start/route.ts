import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { processTransferJob } from '@/lib/services/transfer'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Ensure user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { sourcePlatform, targetPlatform, sourcePlaylistId, sourcePlaylistName, tracksCount } = body

    if (!sourcePlatform || !targetPlatform || !sourcePlaylistId || !sourcePlaylistName) {
      return NextResponse.json({ error: 'Missing required transfer parameters' }, { status: 400 })
    }

    if (sourcePlatform !== 'spotify' || targetPlatform !== 'youtube') {
      return NextResponse.json({ error: 'Currently, only Spotify -> YouTube transfers are supported.' }, { status: 400 })
    }

    const playlistTrackCount = tracksCount || 0

    // --- PAYWALL LOGIC ---
    // 1. Check if the user has an active Pro subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, plan')
      .eq('user_id', session.user.id)
      .single()

    const isPro = subscription?.status === 'active' && subscription?.plan === 'pro'

    if (!isPro) {
      // 2. Calculate total historical cloned tracks across all past successful jobs
      const { data: pastJobs, error: pastJobsError } = await supabase
        .from('transfer_jobs')
        .select('total_tracks')
        .eq('user_id', session.user.id)
        .in('status', ['completed', 'processing', 'pending'])

      if (pastJobsError) {
        throw new Error('Could not verify historical transfer limits')
      }

      const totalHistoricalTracks = pastJobs.reduce((sum, job) => sum + (job.total_tracks || 0), 0)
      
      const FREE_TIER_LIMIT = 100

      // 3. Block if they have hit the 100 song clone limit
      if (totalHistoricalTracks >= FREE_TIER_LIMIT) {
        return NextResponse.json({ 
           error: `Free tier limit reached! You have transferred ${totalHistoricalTracks} tracks. Please upgrade to Pro for unlimited transfers.`,
           code: 'UPGRADE_REQUIRED'
        }, { status: 402 }) // 402 Payment Required
      }
    }
    // --- END PAYWALL LOGIC ---

    // 1. Initialize the Pending Job inside Supabase
    const { data: job, error: dbError } = await supabase
      .from('transfer_jobs')
      .insert({
        user_id: session.user.id,
        source_platform: sourcePlatform,
        target_platform: targetPlatform,
        source_playlist_id: sourcePlaylistId,
        source_playlist_name: sourcePlaylistName,
        status: 'pending'
      })
      .select()
      .single()

    if (dbError || !job) {
      console.error('Job Creation Error:', dbError)
      return NextResponse.json({ error: 'Failed to create transfer job in the database.' }, { status: 500 })
    }

    // 2. Unblock the client immediately & Spawn Background Execution Node
    // (Note: In strict Vercel Edge Serverless, this promise might be terminated instantly without waitUntil. 
    // In local dev Node runtime, it executes fine in parallel).
    processTransferJob(job.id).catch(err => {
      console.error('Background execution crash:', err)
    })

    return NextResponse.json({ 
       success: true, 
       jobId: job.id,
       message: 'Transfer process started successfully'
    })

  } catch (error: any) {
    console.error('Transfer API Error:', error)
    return NextResponse.json({ error: 'Internal server exception' }, { status: 500 })
  }
}
