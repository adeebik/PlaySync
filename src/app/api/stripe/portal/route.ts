import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()

  // 1. Authenticate Request
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Fetch Customer ID
    const { data: customerData } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single()

    const customerId = customerData?.stripe_customer_id

    if (!customerId) {
       return NextResponse.json({ error: 'No active billing record found.' }, { status: 404 })
    }

    // 3. Construct Portals
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url })

  } catch (error: any) {
     console.error('Stripe Portal Creation Error:', error)
     return NextResponse.json({ error: 'Internal portal proxy failed' }, { status: 500 })
  }
}
