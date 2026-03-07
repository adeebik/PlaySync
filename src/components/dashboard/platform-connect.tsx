'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlaylistGrid, Playlist } from './playlist-grid'
import { TransferModal } from './transfer-modal'
import { Music, PlayCircle } from 'lucide-react'

interface PlatformConnectProps {
  isSpotifyConnected: boolean
  isYouTubeConnected: boolean
  onPlaylistSelect?: (playlist: Playlist) => void
}

export function PlatformConnect({ isSpotifyConnected, isYouTubeConnected, onPlaylistSelect }: PlatformConnectProps) {
  const [activeTab, setActiveTab] = useState<'spotify' | 'youtube'>(isSpotifyConnected ? 'spotify' : (isYouTubeConnected ? 'youtube' : 'spotify'))
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  
  const handlePlaylistClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist)
    if (onPlaylistSelect) onPlaylistSelect(playlist)
  }

  return (
    <>
    <Card className="card-professional border-none shadow-sm mb-10 overflow-hidden">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
        <CardTitle className="text-xl">Your Playlists</CardTitle>
        <CardDescription>Select a playlist below to begin the transfer process.</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="w-full flex justify-start rounded-none border-b border-gray-100 h-12 bg-transparent p-0">
            <TabsTrigger 
              value="spotify" 
              disabled={!isSpotifyConnected}
              className={`flex-1 max-w-[200px] h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1DB954] data-[state=active]:text-[#1DB954] data-[state=active]:shadow-none bg-transparent`}
            >
              <Music className="w-4 h-4 mr-2" /> Spotify
            </TabsTrigger>
            <TabsTrigger 
              value="youtube" 
              disabled={!isYouTubeConnected}
              className={`flex-1 max-w-[200px] h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF0000] data-[state=active]:text-[#FF0000] data-[state=active]:shadow-none bg-transparent`}
            >
              <PlayCircle className="w-4 h-4 mr-2" /> YouTube Music
            </TabsTrigger>
          </TabsList>
          
          <div className="p-6">
            <TabsContent value="spotify" className="mt-0">
              <PlaylistGrid platform="spotify" onSelect={handlePlaylistClick} />
            </TabsContent>
            
            <TabsContent value="youtube" className="mt-0">
               <PlaylistGrid platform="youtube" onSelect={handlePlaylistClick} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
    
    <TransferModal 
       playlist={selectedPlaylist} 
       isOpen={!!selectedPlaylist} 
       onClose={() => setSelectedPlaylist(null)} 
       isSpotifyConnected={isSpotifyConnected}
       isYouTubeConnected={isYouTubeConnected}
    />
    </>
  )
}
