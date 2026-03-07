'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Zap, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  // Replace with your Razorpay Key ID
  const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      // 1. Create Order on Backend
      const response = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const order = await response.json()
      
      if (order.error === 'Unauthorized') {
        router.push('/login?next=/pricing')
        return
      }

      if (!order.orderId) {
        throw new Error('Failed to create order')
      }

      // 2. Load Razorpay Script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      
      script.onload = () => {
        const options = {
          key: RAZORPAY_KEY_ID || order.key,
          amount: order.amount,
          currency: order.currency,
          name: 'PlaySync',
          description: 'Pro Upgrade',
          order_id: order.orderId,
          handler: function (response: any) {
            // Payment success! Redirect or show status
            router.push('/dashboard?success=subscription_created')
          },
          prefill: {
            name: '',
            email: '',
          },
          theme: {
            color: '#3B82F6', // primary blue
          },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
        setLoading(false)
      }

      script.onerror = () => {
        console.error('Failed to load Razorpay script')
        setLoading(false)
      }

      document.body.appendChild(script)

    } catch (error) {
      console.error('Failed to initiate checkout', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="px-6 lg:px-8 h-20 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-white rounded-md flex items-center justify-center font-bold">
              P
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Play<span className="text-primary">Sync</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="shadow-none">Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-20 px-4 md:px-6 container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your library. Upgrade at any time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Free Tier */}
          <Card className="flex flex-col border-gray-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Free</CardTitle>
              <CardDescription>Perfect for testing the waters and small migrations.</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-gray-500 font-medium">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Up to 200 tracks per transfer</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Standard matching algorithm</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Spotify & YouTube support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/register" className="w-full">
                <Button variant="outline" className="w-full border-gray-300">Get Started Free</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Tier */}
          <Card className="flex flex-col border-primary shadow-lg relative bg-white overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-primary"></div>
            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Popular
            </div>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                Pro <Zap className="w-5 h-5 ml-2 text-amber-500 fill-amber-500" />
              </CardTitle>
              <CardDescription>For audiophiles with massive music libraries.</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-gray-900">$4.99</span>
                <span className="text-gray-500 font-medium">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-900 font-medium">Unlimited tracks per transfer</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Advanced Levenshtein AI matching</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Priority auto-syncing (coming soon)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Export logs to CSV</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubscribe} disabled={loading} className="w-full h-12 text-base font-semibold shadow-md">
                {loading && <Loader2 className="mr-2 w-5 h-5 animate-spin" />}
                {loading ? 'Processing...' : 'Upgrade to Pro'}
              </Button>
            </CardFooter>
          </Card>

        </div>
      </main>
    </div>
  )
}
