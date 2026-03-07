import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/utils/encryption'

export async function GET() {
  const supabase = await createClient()

  // Ensure user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch their YouTube tokens securely defined inside the connected accounts
  const { data: account, error: accountError } = await supabase
    .from('connected_accounts')
    .select('access_token')
    .eq('user_id', session.user.id)
    .eq('platform', 'youtube')
    .single()

  if (accountError || !account) {
    return NextResponse.json({ error: 'YouTube account not connected.' }, { status: 404 })
  }

  // Decrypt the Access Token!
  const accessToken = decrypt(account.access_token)

  try {
    const response = await fetch('https://youtube.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // TODO: Handle refresh token logic
        return NextResponse.json({ error: 'YouTube token expired. Please reconnect.' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Failed to fetch YouTube playlists.' }, { status: response.status })
    }

    const data = await response.json()

    // Map the shape to a unified `Playlist` abstraction
    const playlists = data.items.map((item: any) => ({
      id: item.id,
      name: item.snippet.title,
      description: item.snippet.description,
      image: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || null,
      tracksCount: item.contentDetails.itemCount,
      platform: 'youtube',
      url: `https://music.youtube.com/playlist?list=${item.id}`
    }))

    return NextResponse.json({ playlists })

  } catch (error) {
    console.error('YouTube Fetch Error:', error)
    return NextResponse.json({ error: 'Internal server error while fetching playlists.' }, { status: 500 })
  }
}
