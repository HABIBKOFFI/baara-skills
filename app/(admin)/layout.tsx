import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavAdmin from '@/components/shared/NavAdmin'

export default async function AdminLayout({
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

  if (profile?.role !== 'admin') redirect('/catalogue')

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <NavAdmin />
      <main id="contenu-principal" className="pt-16 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
