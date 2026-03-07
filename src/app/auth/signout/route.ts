import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Sign out cleanly by revoking the SSR cookies
  await supabase.auth.signOut()

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login`, {
    status: 302,
  })
}
