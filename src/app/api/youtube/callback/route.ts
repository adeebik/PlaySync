import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { encrypt } from '@/lib/utils/encryption'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = `http://127.0.0.1:3000/api/youtube/callback`

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=${encodeURIComponent(error)}`)
  }

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
    // 1. Exchange the Authorization Code for an Access Token & Refresh Token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('Google API Error:', tokenData.error_description)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=GoogleOAuthFailed`)
    }

    // 2. We must obtain the YouTube Channel ID to map the `platform_user_id`
    const channelResponse = await fetch('https://youtube.googleapis.com/youtube/v3/channels?part=id&mine=true', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })
    
    const channelData = await channelResponse.json()
    // It's possible the user doesn't have an active YouTube channel created; fallback to 'default_channel'
    let youtubeUserId = 'default_channel'
    if (channelData.items && channelData.items.length > 0) {
       youtubeUserId = channelData.items[0].id
    }

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
        platform: 'youtube',
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expiry: tokenExpiry.toISOString(),
        platform_user_id: youtubeUserId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform'
      })

    if (dbError) {
      console.error('Supabase Upsert Error:', dbError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=DatabaseLinkFailed`)
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=YouTubeConnected`)

  } catch (err) {
    console.error('YouTube Callback Crash:', err)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=InternalCallbackError`)
  }
}
