'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft, ArrowRight, Music, PlayCircle } from 'lucide-react'
import Link from 'next/link'

interface TransferJob {
  id: string
  source_platform: string
  target_platform: string
  source_playlist_name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_tracks: number
  transferred_tracks: number
  failed_tracks: number
  error_message: string | null
}

export function TransferProgressClient({ initialJob }: { initialJob: TransferJob }) {
  const [job, setJob] = useState<TransferJob>(initialJob)
  const supabase = createClient()

  useEffect(() => {
    // If the job is already definitively done, no need to establish a WebSocket channel
    if (job.status === 'completed' || job.status === 'failed') return

    // 1. Establish the Real-Time Subscription loop via Supabase Channels
    const channel = supabase
      .channel(`job_${job.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'transfer_jobs', filter: `id=eq.${job.id}` },
        (payload) => {
          setJob(payload.new as TransferJob)
        }
      )
      .subscribe()

    // 2. Teardown
    return () => {
      supabase.removeChannel(channel)
    }
  }, [job.id, job.status, supabase])

  // Calculation parameters
  const isComplete = job.status === 'completed'
  const isFailed = job.status === 'failed'
  const isProcessing = job.status === 'processing' || job.status === 'pending'
  const processedTracks = job.transferred_tracks + job.failed_tracks
  const progressPercent = job.total_tracks === 0 
    ? (isProcessing ? 5 : 0) // Artificial bounce indicating starting
    : Math.round((processedTracks / job.total_tracks) * 100)

  const SourceIcon = job.source_platform === 'spotify' ? Music : PlayCircle
  const TargetIcon = job.target_platform === 'youtube' ? PlayCircle : Music

  return (
    <Card className="card-professional border-none shadow-lg overflow-hidden">
      
      <CardHeader className="text-center pb-2 bg-gray-50/50 border-b border-gray-100">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          {isComplete && <CheckCircle2 className="w-8 h-8 text-green-500" />}
          {isFailed && <AlertCircle className="w-8 h-8 text-red-500" />}
          {isProcessing && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
        </div>
        <CardTitle className="text-2xl">
          {isComplete && "Transfer Complete"}
          {isFailed && "Transfer Failed"}
          {isProcessing && "Transferring Playlist"}
        </CardTitle>
        <CardDescription className="text-base text-gray-500 max-w-sm mx-auto">
          Moving your tracks from <strong className="capitalize">{job.source_platform}</strong> to <strong className="capitalize">{job.target_platform}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-8 px-8 space-y-6">
        
        {/* Visual Bridge */}
        <div className="flex items-center justify-between px-6 py-6 bg-gray-50 rounded-xl border border-gray-200">
           <div className="flex flex-col items-center">
             <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                <SourceIcon className={`w-6 h-6 ${job.source_platform === 'spotify' ? 'text-[#1DB954]' : 'text-[#FF0000]'}`} />
             </div>
             <span className="text-sm font-semibold truncate max-w-[120px]" title={job.source_playlist_name}>
               {job.source_playlist_name}
             </span>
           </div>

           <div className="flex relative items-center justify-center text-gray-400 px-4 w-full">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2">
                <div 
                   className="h-full bg-primary transition-all duration-500" 
                   style={{ width: `${progressPercent}%` }} 
                />
              </div>
              <ArrowRight className={`w-6 h-6 bg-gray-50 border-8 border-gray-50 ${isProcessing ? 'text-primary animate-pulse' : 'text-gray-300'}`} />
           </div>

           <div className="flex flex-col items-center">
             <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
               <TargetIcon className={`w-6 h-6 ${job.target_platform === 'youtube' ? 'text-[#FF0000]' : 'text-[#1DB954]'}`} />
             </div>
             <span className="text-sm font-semibold text-gray-400 capitalize">
               {job.target_platform}
             </span>
           </div>
        </div>

        {/* Progress Metrics */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-medium">
             <span className="text-gray-600">Progress</span>
             <span className="text-gray-900">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3 shadow-inner" />
          
          <div className="grid grid-cols-3 gap-4 text-center text-sm pt-4 border-t border-gray-100">
             <div>
                <span className="block text-2xl font-bold text-gray-900">{job.total_tracks}</span>
                <span className="text-gray-500 font-medium">Total Tracks</span>
             </div>
             <div>
                <span className="block text-2xl font-bold text-green-500">{job.transferred_tracks}</span>
                <span className="text-gray-500 font-medium">Success</span>
             </div>
             <div>
                <span className="block text-2xl font-bold text-red-500">{job.failed_tracks}</span>
                <span className="text-gray-500 font-medium">Failed</span>
             </div>
          </div>
        </div>

        {isFailed && job.error_message && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
            <strong>Error:</strong> {job.error_message}
          </div>
        )}

      </CardContent>

      <CardFooter className="bg-gray-50/50 border-t border-gray-100 p-6 flex justify-between">
         <Link href="/dashboard" className="w-full">
           <Button variant={isProcessing ? "outline" : "default"} className="w-full py-6 text-base font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isProcessing ? "Return to Dashboard" : "Start Another Transfer"}
           </Button>
         </Link>
      </CardFooter>
    </Card>
  )
}
