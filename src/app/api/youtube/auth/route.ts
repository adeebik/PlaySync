import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL}/api/youtube/callback`

// For YouTube Data API v3 scope requirements
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtubepartner',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
].join(' ')

export async function GET() {
  const supabase = await createClient()

  // Ensure user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'You must be logged in to connect YouTube Music.' }, { status: 401 })
  }

  // Generate CSRF protection string
  const state = crypto.randomBytes(16).toString('hex')
  
  // Construct Google's OAuth 2 URL parameters 
  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES,
      state: state,
      access_type: 'offline', // Critical for fetching a refresh token
      prompt: 'consent' // Forces consent screen to ensure refresh token is always returned
    }).toString()}`
  )

  // Tie state securely
  response.cookies.set('youtube_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  return response
}
