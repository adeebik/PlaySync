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
    const { sourcePlatform, targetPlatform, sourcePlaylistId, sourcePlaylistName } = await request.json()

    if (!sourcePlatform || !targetPlatform || !sourcePlaylistId || !sourcePlaylistName) {
      return NextResponse.json({ error: 'Missing required transfer parameters' }, { status: 400 })
    }

    if (sourcePlatform !== 'spotify' || targetPlatform !== 'youtube') {
      return NextResponse.json({ error: 'Currently, only Spotify -> YouTube transfers are supported.' }, { status: 400 })
    }

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
