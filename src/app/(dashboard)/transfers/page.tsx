import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Music, PlayCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function TransfersHistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all transfer jobs ordered by most recent
  const { data: jobs, error } = await supabase
    .from('transfer_jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed fetching history:', error)
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Completed</Badge>
      case 'failed': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Failed</Badge>
      case 'processing': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none animate-pulse">Processing</Badge>
      default: return <Badge variant="secondary">Pending</Badge>
    }
  }

  const PlatformIcon = ({ platform }: { platform: string }) => {
    return platform === 'spotify' 
      ? <Music className="inline w-4 h-4 mr-1 text-[#1DB954]" />
      : <PlayCircle className="inline w-4 h-4 mr-1 text-[#FF0000]" />
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">
                Play<span className="text-primary">Sync</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transfer History</h1>
            <p className="mt-1 text-sm text-gray-500">View your past and active playlist transfers.</p>
          </div>
          <Link href="/dashboard">
             <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <Card className="card-professional border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100">
            <CardTitle>All Transfers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {jobs && jobs.length > 0 ? (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead>Playlist</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tracks</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-900">
                        {job.source_playlist_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                           <PlatformIcon platform={job.source_platform} /> 
                           <span className="capitalize text-gray-600 ml-1 mr-2">{job.source_platform}</span>
                           → 
                           <PlatformIcon platform={job.target_platform} /> 
                           <span className="capitalize text-gray-600 ml-1">{job.target_platform}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(job.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {job.status === 'completed' || job.status === 'failed' 
                          ? `${job.transferred_tracks} / ${job.total_tracks} Success` 
                          : `${job.total_tracks} Total`}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/transfers/${job.id}`}>
                           <Button variant="ghost" size="sm" className="h-8 shadow-none">
                             <Eye className="w-4 h-4 mr-2" /> View
                           </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 px-4">
                <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No transfers yet</h3>
                <p className="text-gray-500 mb-4">You haven&apos;t started any playlist transfers.</p>
                <Link href="/dashboard">
                   <Button>Start your first transfer</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
