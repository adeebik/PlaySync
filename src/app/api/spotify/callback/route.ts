import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { encrypt } from '@/lib/utils/encryption'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL}/api/spotify/callback`

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=${encodeURIComponent(error)}`)
  }

  // Next.js handles reading the cookies attached to the incoming request natively
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Failsafe: session must exist.
  if (!user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=SessionExpired`)
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=MissingCode`)
  }

  try {
    // Exchange the Authorization Code for an Access Token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
      },
      body: new URLSearchParams({
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('Spotify API Error:', tokenData.error_description)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=SpotifyOAuthFailed`)
    }

    // Retrieve Spotify User ID natively with the access token
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })
    
    const userData = await userResponse.json()

    const accessToken = encrypt(tokenData.access_token)
    const refreshToken = tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null
    const tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000)

    // Ensure the user_profiles row exists to satisfy the foreign key constraint
    // We must use the Service Role key to bypass Row Level Security (RLS) policies 
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    await adminClient.from('user_profiles').upsert({
      id: user.id,
      email: user.email,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    // UPSERT directly into the public.connected_accounts table!
    const { error: dbError } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: user.id,
        platform: 'spotify',
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expiry: tokenExpiry.toISOString(),
        platform_user_id: userData.id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform'
      })

    if (dbError) {
      console.error('Supabase Upsert Error:', dbError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=DatabaseLinkFailed`)
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=SpotifyConnected`)

  } catch (err) {
    console.error('Spotify Callback Crash:', err)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=InternalCallbackError`)
  }
}
