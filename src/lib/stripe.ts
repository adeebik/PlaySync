import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing. Please set it in your environment variables.')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover' as any, // Best practice is locking API version
  typescript: true,
  appInfo: {
    name: 'PlaySync',
    version: '0.1.0',
    url: 'https://playsync.app',
  },
})
