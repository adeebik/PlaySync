import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Next.js Edge Serverless bypass for reading raw node buffers (legacy workaround sometimes needed for Stripe)
// However, in App Router we can just use req.text()
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = (await headers()).get('stripe-signature') as string

    let event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed.`, err.message)
      return NextResponse.json({ error: err.message }, { status: 400 })
    }

    // Handle the Event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription
          const customerId = session.customer
          const userId = session.metadata?.supabase_user_id

          if (userId) {
             // Fetch the subscription to get the period end
             const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any
             
             await supabase.from('subscriptions').upsert({
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                stripe_price_id: subscription.items.data[0].price.id,
                stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                plan: 'pro',
                status: 'active',
                cancel_at_period_end: subscription.cancel_at_period_end
             }, { onConflict: 'user_id' })
          }
        }
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        
        await supabase.from('subscriptions').update({
          stripe_price_id: subscription.items.data[0].price.id,
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end
        }).eq('stripe_subscription_id', subscription.id)
        
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        
        await supabase.from('subscriptions').update({
          status: 'canceled',
          plan: 'free',
          cancel_at_period_end: false
        }).eq('stripe_subscription_id', subscription.id)
        
        break
      }
      
      default:
        console.log(`Unhandled Stripe event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook Error:', err.message)
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
  }
}
