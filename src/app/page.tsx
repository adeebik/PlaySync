import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Music, PlayCircle, ArrowRight, ShieldCheck, Zap, RefreshCw, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation Layer */}
      <header className="px-6 lg:px-8 h-20 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary text-white rounded-md flex items-center justify-center font-bold">
            P
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Play<span className="text-primary">Sync</span>
          </span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden sm:block">
            Log in
          </Link>
          <Link href="/register">
            <Button className="shadow-sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-40 bg-gray-50 border-b border-gray-100">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 mb-8 shadow-sm">
              <span className="flex w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Now supporting YouTube Music & Spotify
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 max-w-4xl mx-auto mb-6 leading-tight">
              Transfer your playlists <span className="text-primary">flawlessly</span> across platforms.
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              The professional standard for migrating your music library. Secure, instantaneous, and highly accurate matching algorithms ensure you never lose a track.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-base shadow-md w-full sm:w-auto">
                  Start Free Transfer <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-white w-full sm:w-auto">
                  See how it works
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 pt-8 border-t border-gray-200 max-w-3xl mx-auto">
              <p className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wider">Trusted Integration Partners</p>
              <div className="flex flex-wrap justify-center items-center gap-10 opacity-70 grayscale">
                <div className="flex items-center text-xl font-bold font-sans text-gray-800">
                  <Music className="w-6 h-6 mr-2" /> Spotify
                </div>
                <div className="flex items-center text-xl font-bold font-sans text-gray-800">
                  <PlayCircle className="w-6 h-6 mr-2" /> YouTube Music
                </div>
                <div className="flex items-center text-xl font-bold font-sans text-gray-800">
                  <Music className="w-6 h-6 mr-2" /> Apple Music
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

        {/* CTA Section */}
        <section className="w-full py-24 bg-white">
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
      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gray-700 text-white rounded flex items-center justify-center font-bold text-xs">P</div>
            <span className="font-semibold text-gray-200">PlaySync Inc.</span>
          </div>
          <div className="flex gap-6">
             <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
             <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
             <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
