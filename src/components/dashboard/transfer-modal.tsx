'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Playlist } from './playlist-grid'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Music, PlayCircle, ArrowRight } from 'lucide-react'

interface TransferModalProps {
  playlist: Playlist | null
  isOpen: boolean
  onClose: () => void
  isSpotifyConnected: boolean
  isYouTubeConnected: boolean
}

export function TransferModal({ playlist, isOpen, onClose, isSpotifyConnected, isYouTubeConnected }: TransferModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (!playlist) return null

  const targetPlatform = playlist.platform === 'spotify' ? 'youtube' : 'spotify'
  const canTransfer = targetPlatform === 'youtube' ? isYouTubeConnected : isSpotifyConnected

  const handleTransfer = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/transfer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePlatform: playlist.platform,
          targetPlatform: targetPlatform,
          sourcePlaylistId: playlist.id,
          sourcePlaylistName: playlist.name
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start transfer')
      }

      // Route user to the Transfer Progress UI 
      router.push(`/transfers/${data.jobId}`)

    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const SourceIcon = playlist.platform === 'spotify' ? Music : PlayCircle
  const TargetIcon = targetPlatform === 'spotify' ? Music : PlayCircle

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Confirm Transfer</DialogTitle>
          <DialogDescription>
            You are about to transfer <span className="font-semibold text-gray-900">{playlist.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-6 px-4 bg-gray-50 rounded-lg border border-gray-100 mt-2 mb-4">
           {/* Source */}
           <div className="flex flex-col items-center">
             <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                <SourceIcon className={`w-6 h-6 ${playlist.platform === 'spotify' ? 'text-[#1DB954]' : 'text-[#FF0000]'}`} />
             </div>
             <span className="text-xs font-semibold uppercase">{playlist.platform}</span>
           </div>

           {/* Arrow */}
           <div className="flex flex-col items-center justify-center text-gray-400">
             <span className="text-xs font-medium mb-1">{playlist.tracksCount} Tracks</span>
             <ArrowRight className="w-6 h-6 text-primary animate-pulse" />
           </div>

           {/* Target */}
           <div className="flex flex-col items-center">
             <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                <TargetIcon className={`w-6 h-6 ${targetPlatform === 'spotify' ? 'text-[#1DB954]' : 'text-[#FF0000]'}`} />
             </div>
             <span className="text-xs font-semibold uppercase">{targetPlatform}</span>
           </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!canTransfer && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-800">
            <AlertDescription>
              You must connect your {targetPlatform === 'spotify' ? 'Spotify' : 'YouTube'} account before you can transfer this playlist.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="sm:justify-between flex sm:flex-row flex-col gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={loading || !canTransfer} className="w-full sm:w-auto">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Starting Transfer...' : 'Start Transfer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
