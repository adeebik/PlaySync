import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { User, Settings, Shield } from 'lucide-react'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch their profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Server Action to update the profile
  async function updateProfile(formData: FormData) {
    'use server'
    const fullName = formData.get('fullName') as string
    
    const sb = await createClient()
    const { data: { user } } = await sb.auth.getUser()
    
    if (user && fullName) {
      await sb.from('user_profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', user.id)
      revalidatePath('/settings')
    }
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your profile and security preferences.</p>
          </div>
          <Link href="/dashboard">
             <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="space-y-6">
          
          <Card className="card-professional border-none shadow-sm">
            <CardHeader className="bg-white border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center text-xl">
                 <User className="w-5 h-5 mr-2 text-primary" /> Profile Information
              </CardTitle>
              <CardDescription>Update your personal details below.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form action={updateProfile} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user.email} disabled className="bg-gray-50 text-gray-500" />
                  <p className="text-xs text-gray-500">Your email is managed by your authentication provider.</p>
                </div>
                
                <div className="space-y-2 pt-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    defaultValue={profile?.full_name || ''} 
                    placeholder="Enter your full name" 
                    required 
                  />
                </div>
                
                <Button type="submit" className="mt-4">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="card-professional border-none shadow-sm border border-red-100">
            <CardHeader className="bg-white border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center text-xl text-red-600">
                 <Shield className="w-5 h-5 mr-2 text-red-500" /> Danger Zone
              </CardTitle>
              <CardDescription>Irreversible account actions.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-red-100 rounded-lg p-4 bg-red-50/50">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Delete Account</h4>
                    <p className="text-sm text-gray-500 max-w-md">Permanently remove your account, transfer history, and all connected OAuth credentials.</p>
                  </div>
                  <Button variant="destructive" className="whitespace-nowrap">Delete Account</Button>
               </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  )
}
