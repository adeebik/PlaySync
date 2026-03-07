import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL}/api/spotify/callback`
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative'
].join(' ')

export async function GET() {
  const supabase = await createClient()

  // Ensure user is authenticated before allowing them to tie their Spotify account
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'You must be logged in to connect Spotify.' }, { status: 401 })
  }

  // Generate a random state string for CSRF protection
  const state = crypto.randomBytes(16).toString('hex')
  
  // Store the state in a secure cookie to verify it in the callback
  const response = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID!,
      scope: SCOPES,
      redirect_uri: REDIRECT_URI,
      state: state,
    }).toString()}`
  )

  // Attach state to cookie to prevent CSRF exploits
  response.cookies.set('spotify_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  return response
}
