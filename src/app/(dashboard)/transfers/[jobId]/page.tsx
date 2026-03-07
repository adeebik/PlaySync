import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TransferProgressClient } from './progress-client'

export default async function TransferJobPage({ params }: { params: { jobId: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Await params object for Next.js 15+ compat
  const { jobId } = await params

  // Fetch the initial state of the transfer job
  const { data: job, error } = await supabase
    .from('transfer_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error || !job) {
    // Failsafe: Job doesn't exist or doesn't belong to them (handled by RLS automatically)
    redirect('/dashboard?error=JobNotFound')
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
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TransferProgressClient initialJob={job} />
      </main>
    </div>
  )
}
