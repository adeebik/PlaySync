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
    const { priceId } = await request.json()

    if (!priceId) {
       return NextResponse.json({ error: 'Missing priceId payload' }, { status: 400 })
    }

    // 2. See if User already has a Stripe Customer mapped
    const { data: customerData } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single()

    let customerId = customerData?.stripe_customer_id

    // Create a new Customer object if one doesn't exist
    if (!customerId) {
       const customer = await stripe.customers.create({
         email: session.user.email,
         metadata: {
           supabase_user_id: session.user.id
         }
       })
       customerId = customer.id
       
       // Note: We don't necessarily need to UPSERT this here if the Webhook catches it,
       // but it's safe to link it actively.
       await supabase.from('subscriptions').upsert({
         user_id: session.user.id,
         stripe_customer_id: customerId
       })
    }

    // 3. Construct the Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=subscription_created`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
      metadata: {
        supabase_user_id: session.user.id
      }
    })

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url })

  } catch (error: any) {
     console.error('Stripe Checkout Creation Error:', error)
     return NextResponse.json({ error: 'Internal server proxy failed' }, { status: 500 })
  }
}
