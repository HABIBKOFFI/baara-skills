import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'

export default async function ApprenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'recruteur') redirect('/recruteur/dashboard')
  if (profile?.role === 'admin') redirect('/admin/metriques')

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      {/* Espace pour nav desktop */}
      <div className="md:pt-16 pb-20 md:pb-0">
        {children}
      </div>
    </div>
  )
}
