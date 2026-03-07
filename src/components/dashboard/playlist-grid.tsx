'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Music, PlayCircle, ExternalLink, ArrowRight } from 'lucide-react'

export interface Playlist {
  id: string
  name: string
  description: string | null
  image: string | null
  tracksCount: number
  platform: 'spotify' | 'youtube' | 'apple_music'
  url?: string
}

interface PlaylistGridProps {
  platform: 'spotify' | 'youtube'
  onSelect: (playlist: Playlist) => void
}

export function PlaylistGrid({ platform, onSelect }: PlaylistGridProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const response = await fetch(`/api/${platform}/playlists`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch playlists')
        }

        setPlaylists(data.playlists || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylists()
  }, [platform])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden">
            <Skeleton className="h-40 w-full rounded-none" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    const handleReconnect = () => {
      window.location.href = `/api/${platform}/auth`
    }

    return (
      <div className="text-center p-8 mt-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex flex-col items-center">
        <p className="font-medium text-lg">Error loading playlists</p>
        <p className="text-sm mt-1 mb-4 opacity-80">{error}</p>
        <Button 
          variant="outline" 
          className="bg-white border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
          onClick={handleReconnect}
        >
          Reconnect {platform.charAt(0).toUpperCase() + platform.slice(1)}
        </Button>
      </div>
    )
  }

  if (playlists.length === 0) {
    return (
      <div className="text-center p-8 mt-4 bg-gray-50 text-gray-500 rounded-lg border border-dashed border-gray-200">
        <p>No playlists found on your {platform === 'spotify' ? 'Spotify' : 'YouTube'} account.</p>
      </div>
    )
  }

  const getPlatformColor = () => {
    switch (platform) {
      case 'spotify': return 'text-[#1DB954]'
      case 'youtube': return 'text-[#FF0000]'
      default: return 'text-primary'
    }
  }

  const PlatformIcon = platform === 'spotify' ? Music : PlayCircle

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-6">
      {playlists.map((playlist) => (
        <Card 
          key={playlist.id} 
          className="group relative border-none shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col h-full bg-white"
          onClick={() => onSelect(playlist)}
        >
          {/* Cover Art Wrapper */}
          <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
            {playlist.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={playlist.image} 
                alt={playlist.name}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-50 text-gray-300">
                <PlatformIcon className={`w-12 h-12 opacity-50 ${getPlatformColor()}`} />
              </div>
            )}
            
            {/* Hover overlay with button */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="sm" className="rounded-full gap-2 shadow-lg" onClick={(e) => {
                 e.stopPropagation()
                 onSelect(playlist)
              }}>
                 Transfer <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <CardContent className="p-4 flex flex-col flex-grow justify-between">
             <div>
                <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1" title={playlist.name}>
                  {playlist.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">
                  {playlist.description || 'No description provided.'}
                </p>
             </div>
             
             <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  {playlist.tracksCount} Tracks
                </span>
                {playlist.url && (
                  <a 
                    href={playlist.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={(e) => e.stopPropagation()}
                    className={`${getPlatformColor()} hover:opacity-80 transition-opacity`}
                    title="Open in platform"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
             </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
