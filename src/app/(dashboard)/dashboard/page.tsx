import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Music, PlayCircle, LogOut, Settings } from 'lucide-react'
import { PlatformConnect } from '@/components/dashboard/platform-connect'

// Render Server-Side!
export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch their profile and connected accounts in parallel
  const [profileResponse, connectionsResponse] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', user.id).single(),
    supabase.from('connected_accounts').select('platform, updated_at').eq('user_id', user.id)
  ])

  const profile = profileResponse.data
  const connections = connectionsResponse.data || []

  const isSpotifyConnected = connections.some(c => c.platform === 'spotify')
  const isYouTubeConnected = connections.some(c => c.platform === 'youtube')

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">
                Play<span className="text-primary">Sync</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Hi, {profile?.full_name || user.email}
              </span>
              <form action="/auth/signout" method="post">
                 <Button variant="ghost" size="icon" type="submit" title="Sign out">
                   <LogOut className="h-5 w-5 text-gray-500" />
                 </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8 flex justify-between items-center align-middle">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your music platform connections and transfers.</p>
          </div>
          <Link href="/transfers">
            <Button variant="outline">Transfer History</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
          
          {/* Spotify Connection Card */}
          <Card className="card-professional border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                 <span className="w-8 h-8 rounded-full bg-[#1DB954]/10 flex items-center justify-center">
                   <Music className="w-4 h-4 text-[#1DB954]" />
                 </span>
                 Spotify
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {isSpotifyConnected 
                  ? "Your Spotify account is connected and ready for transfers." 
                  : "Connect your Spotify account to import or export playlists."}
              </CardDescription>
              {isSpotifyConnected ? (
                 <Button variant="outline" className="w-full text-green-600 border-green-200 bg-green-50 hover:bg-green-100" disabled>
                   Connected
                 </Button>
              ) : (
                <Link href="/api/spotify/auth">
                   <Button className="w-full bg-[#1DB954] text-white hover:bg-[#1ed760]">
                     Connect Spotify
                   </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* YouTube Music Connection Card */}
          <Card className="card-professional border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                 <span className="w-8 h-8 rounded-full bg-[#FF0000]/10 flex items-center justify-center">
                   <PlayCircle className="w-4 h-4 text-[#FF0000]" />
                 </span>
                 YouTube Music
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {isYouTubeConnected 
                  ? "Your YouTube account is connected and ready for transfers." 
                  : "Connect your YouTube account to import or export playlists."}
              </CardDescription>
              {isYouTubeConnected ? (
                 <Button variant="outline" className="w-full text-green-600 border-green-200 bg-green-50 hover:bg-green-100" disabled>
                   Connected
                 </Button>
              ) : (
                <Link href="/api/youtube/auth">
                   <Button className="w-full bg-[#FF0000] text-white hover:bg-[#ff4d4d]">
                     Connect YouTube
                   </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Transfer Action Card */}
          <Card className={`card-professional border-none shadow-sm ${(!isSpotifyConnected || !isYouTubeConnected) ? 'opacity-50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                 <Settings className="w-5 h-5 text-primary" />
                 Ready to Transfer?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {(!isSpotifyConnected || !isYouTubeConnected)
                  ? "You must connect both platforms before initiating a transfer."
                  : "Select a source playlist and begin the cloning process."}
              </CardDescription>
              
              <Button className="w-full" disabled={!isSpotifyConnected || !isYouTubeConnected}>
                 Select Destination
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Dynamic Client Playlist Grid Viewer */}
        {(isSpotifyConnected || isYouTubeConnected) && (
           <PlatformConnect 
             isSpotifyConnected={isSpotifyConnected} 
             isYouTubeConnected={isYouTubeConnected} 
           />
        )}
      </main>
    </div>
  )
}
