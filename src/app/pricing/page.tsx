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
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10 translate-x-1/4 -translate-y-1/4 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl -z-10 -translate-x-1/4 translate-y-1/4 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <header className="px-6 lg:px-10 h-20 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/fav-icon.png" alt="PlaySync" className="w-10 h-10 object-contain transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Play<span className="text-primary group-hover:text-blue-600 transition-colors">Sync</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="shadow-none font-semibold text-gray-500 hover:text-primary transition-colors">Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-24 px-4 md:px-6 container mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-primary mb-6 shadow-sm">
            Pricing Plans
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6 leading-tight">
            Simple, transparent <span className="text-primary italic">pricing</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your library. No hidden fees, just pure music migration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          
          {/* Free Tier */}
          <Card className="flex flex-col border-gray-100 shadow-sm bg-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="p-10">
              <CardTitle className="text-2xl font-bold tracking-tight">Free</CardTitle>
              <CardDescription className="text-gray-500 mt-2">Perfect for testing the waters and small migrations.</CardDescription>
              <div className="mt-8 flex items-baseline">
                <span className="text-5xl font-extrabold text-gray-900 tracking-tight">$0</span>
                <span className="text-gray-500 font-medium ml-1">/month</span>
              </div>
            </CardHeader>
            <CardContent className="px-10 pb-10 flex-1">
              <ul className="space-y-5">
                <li className="flex items-start">
                  <div className="bg-green-50 rounded-full p-1 mr-3 shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Up to 200 tracks per transfer</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-50 rounded-full p-1 mr-3 shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Standard matching algorithm</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-50 rounded-full p-1 mr-3 shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Spotify & YouTube support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="px-10 pb-10">
              <Link href="/register" className="w-full">
                <Button variant="outline" className="w-full h-12 border-gray-200 font-semibold hover:bg-gray-50">Get Started Free</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Tier */}
          <Card className="flex flex-col border-primary shadow-2xl relative bg-white overflow-hidden scale-105 ring-1 ring-primary/20">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary to-blue-600"></div>
            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
              Most Popular
            </div>
            <CardHeader className="p-10">
              <CardTitle className="text-2xl font-bold flex items-center tracking-tight">
                Pro <Zap className="w-6 h-6 ml-2 text-amber-500 fill-amber-500 animate-bounce" />
              </CardTitle>
              <CardDescription className="text-gray-500 mt-2">For audiophiles with massive music libraries.</CardDescription>
              <div className="mt-8 flex items-baseline">
                <span className="text-5xl font-extrabold text-gray-900 tracking-tight">$4.99</span>
                <span className="text-gray-500 font-medium ml-1">/month</span>
              </div>
            </CardHeader>
            <CardContent className="px-10 pb-10 flex-1">
              <ul className="space-y-5">
                <li className="flex items-start">
                  <div className="bg-blue-50 rounded-full p-1 mr-3 shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-gray-900 font-semibold">Unlimited tracks per transfer</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-50 rounded-full p-1 mr-3 shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-gray-600 font-medium">Advanced Levenshtein AI matching</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-50 rounded-full p-1 mr-3 shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-gray-600">Priority auto-syncing (soon)</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-50 rounded-full p-1 mr-3 shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-gray-600 text-sm">Export migration logs to CSV</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="px-10 pb-10">
              <Button onClick={handleSubscribe} disabled={loading} className="w-full h-14 text-lg font-bold shadow-xl bg-primary hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
                {loading && <Loader2 className="mr-2 w-6 h-6 animate-spin" />}
                {loading ? 'Processing...' : 'Upgrade to Pro'}
              </Button>
            </CardFooter>
          </Card>

        </div>
      </main>
    </div>
  )
}
