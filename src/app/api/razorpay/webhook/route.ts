import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Signature missing' }, { status: 400 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    // Handle events (order.paid, subscription.charged, etc.)
    switch (event.event) {
      case 'order.paid': {
        const payload = event.payload.order.entity
        const userId = payload.notes.supabase_user_id

        if (userId) {
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            status: 'active',
            plan: 'pro',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
        }
        break
      }
      
      case 'subscription.charged': {
         // Handle subscription recurring payments if needed
         break
      }

      default:
        console.log(`Unhandled Razorpay event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Razorpay Webhook Error:', err.message)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
