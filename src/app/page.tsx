import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Music, PlayCircle, ArrowRight, ShieldCheck, Zap, RefreshCw, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation Layer */}
      <header className="px-6 lg:px-10 h-20 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/fav-icon.png" alt="PlaySync" className="w-10 h-10 object-contain transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Play<span className="text-primary group-hover:text-blue-600 transition-colors">Sync</span>
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex gap-10 text-sm font-semibold text-gray-500">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-gray-900 hidden sm:block">
            Log in
          </Link>
          <Link href="/register">
            <Button className="shadow-sm font-semibold px-6 hover:shadow-md transition-all">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden">
          {/* Advanced Background Layer */}
          <div className="absolute inset-0 bg-mesh -z-20"></div>
          <div className="absolute inset-0 -z-10" style={{ 
            backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
          
          {/* Floating Music Notes - Increased Visibility */}
          <div className="absolute top-20 left-[10%] text-blue-400 animate-float opacity-60 select-none">
            <Music size={56} />
          </div>
          <div className="absolute top-40 right-[15%] text-indigo-400 animate-float opacity-50 select-none" style={{ animationDelay: '1s' }}>
            <PlayCircle size={72} />
          </div>
          <div className="absolute bottom-40 left-[15%] text-blue-300 animate-float opacity-60 select-none" style={{ animationDelay: '2.5s' }}>
            <Music size={40} />
          </div>
          <div className="absolute bottom-20 right-[10%] text-indigo-300 animate-float opacity-50 select-none" style={{ animationDelay: '1.5s' }}>
            <Music size={48} />
          </div>

          <div className="container px-4 md:px-6 mx-auto text-center relative">
            <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50/50 px-4 py-1.5 text-sm font-semibold text-primary mb-8 shadow-sm group cursor-default">
              <span className="flex w-2 h-2 rounded-full bg-primary mr-2 animate-pulse group-hover:scale-125 transition-transform"></span>
              Now supporting YouTube Music & Spotify
            </div>
            
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-gray-900 max-w-5xl mx-auto mb-8 leading-[1.1] drop-shadow-sm">
              Transfer your playlists <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">flawlessly</span> across platforms.
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              The professional standard for migrating your music library. Secure, instantaneous, and highly accurate matching algorithms ensure you never lose a track.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-base shadow-lg w-full sm:w-auto hover:scale-105 transition-all bg-primary hover:bg-blue-600">
                  Start Free Transfer <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-white w-full sm:w-auto hover:bg-gray-50 border-gray-200">
                  See how it works
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-20 pt-10 border-t border-gray-100 max-w-3xl mx-auto">
              <p className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-[0.2em]">Trusted Integration Partners</p>
              <div className="flex flex-wrap justify-center items-center gap-12">
                <div className="flex items-center text-xl font-bold font-sans text-gray-400 hover:text-[#1DB954] transition-all duration-300 cursor-default group">
                  <Music className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" /> Spotify
                </div>
                <div className="flex items-center text-xl font-bold font-sans text-gray-400 hover:text-[#FF0000] transition-all duration-300 cursor-default group">
                  <PlayCircle className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" /> YouTube Music
                </div>
                <div className="flex items-center text-xl font-bold font-sans text-gray-400 hover:text-[#FA243C] transition-all duration-300 cursor-default group">
                  <Music className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" /> Apple Music
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Step Process Section */}
        <section id="how-it-works" className="w-full py-24 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">Migrate in three simple steps</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our automated system handles the heavy lifting so you can focus on listening.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
               {/* Connecting Line */}
               <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gray-100 z-0"></div>

               {/* Step 1 */}
               <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-24 h-24 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mb-6 shadow-sm border border-blue-100">
                   <ShieldCheck className="w-10 h-10" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-3">1. Connect Securely</h3>
                 <p className="text-gray-600">Authenticate your source and destination accounts using secure, industry-standard OAuth.</p>
               </div>

               {/* Step 2 */}
               <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-24 h-24 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mb-6 shadow-sm border border-blue-100">
                   <Music className="w-10 h-10" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-3">2. Select Playlists</h3>
                 <p className="text-gray-600">Choose exactly which tracks, albums, or curated playlists you want to move across platforms.</p>
               </div>

               {/* Step 3 */}
               <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-24 h-24 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mb-6 shadow-sm border border-blue-100">
                   <Zap className="w-10 h-10" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-3">3. Sync Instantly</h3>
                 <p className="text-gray-600">Our high-speed matching engine queries the destination catalog and clones your tracks in seconds.</p>
               </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-24 bg-gray-50 border-y border-gray-100">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">Enterprise-grade reliability</h2>
              <p className="text-lg text-gray-600 max-w-2xl">Built for audiophiles with vast libraries who cannot afford to lose a single track.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-8">
                  <RefreshCw className="w-10 h-10 text-primary mb-5" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Mathematical Accuracy</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We utilize advanced Levenshtein distance algorithms to filter out live covers, karaoke versions, and unofficial uploads—ensuring you always get the canonical studio track on the destination platform.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-8">
                  <CheckCircle2 className="w-10 h-10 text-primary mb-5" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Continuous Status Tracking</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Monitor enormous transfers containing thousands of songs in real-time. Our WebSocket architecture ensures you see the exact progress bar fill without ever needing to refresh your browser.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-24 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">Simple, transparent pricing</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Choose the plan that fits your library. Upgrade at any time.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Tier */}
              <Card className="flex flex-col border-gray-200 shadow-sm bg-white">
                <div className="p-8 pb-0">
                  <h3 className="text-2xl font-bold">Free</h3>
                  <p className="text-gray-500 text-sm mt-1">Perfect for testing the waters.</p>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-gray-900">$0</span>
                    <span className="text-gray-500 font-medium">/month</span>
                  </div>
                </div>
                <CardContent className="p-8 flex-1">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span className="text-gray-600">Up to 100 tracks total</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span className="text-gray-600">Standard matching algorithm</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span className="text-gray-600">Spotify & YouTube support</span>
                    </li>
                  </ul>
                  <Link href="/register" className="mt-8 block">
                    <Button variant="outline" className="w-full border-gray-300">Get Started Free</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Pro Tier */}
              <Card className="flex flex-col border-primary shadow-lg relative bg-white overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-primary"></div>
                <div className="p-8 pb-0">
                  <div className="inline-block bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2">Popular</div>
                  <h3 className="text-2xl font-bold flex items-center">
                    Pro <Zap className="w-5 h-5 ml-2 text-amber-500 fill-amber-500" />
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">For audiophiles with massive music libraries.</p>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-gray-900">₹4.99</span>
                    <span className="text-gray-500 font-medium">/month</span>
                  </div>
                </div>
                <CardContent className="p-8 flex-1">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" />
                      <span className="text-gray-900 font-medium">Unlimited tracks</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" />
                      <span className="text-gray-600">Levenshtein AI matching</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" />
                      <span className="text-gray-600">Priority support</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-primary mr-2 shrink-0 mt-0.5" />
                      <span className="text-gray-600">Real-time status tracking</span>
                    </li>
                  </ul>
                  <Link href="/register" className="mt-8 block">
                    <Button className="w-full shadow-md">Upgrade to Pro</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 bg-gray-50 border-t border-gray-100">
          <div className="container px-4 md:px-6 mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">Ready to unify your audio?</h2>
            <p className="text-xl text-gray-600 mb-10">Join thousands of users who have successfully migrated their extensive music libraries using PlaySync.</p>
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 text-lg shadow-lg">
                Create your free account today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-16 border-t border-gray-800">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm gap-8">
            <div className="flex items-center gap-3">
              <img src="/fav-icon.png" alt="PlaySync" className="w-8 h-8 object-contain brightness-0 invert opacity-80" />
              <span className="font-bold text-xl text-white tracking-tight">PlaySync<span className="text-primary text-xs ml-1 font-normal opacity-60">Inc.</span></span>
            </div>
            <div className="flex gap-8 font-medium">
               <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
               <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
               <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800/50 text-center text-gray-500 text-xs">
            © {new Date().getFullYear()} PlaySync. All rights reserved. Professional playlist migration services.
          </div>
        </div>
      </footer>
    </div>
  )
}
