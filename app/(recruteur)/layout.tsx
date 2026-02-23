import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavRecruteur from '@/components/shared/NavRecruteur'

export default async function RecruteurLayout({
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

  if (profile?.role !== 'recruteur') redirect('/catalogue')

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <NavRecruteur />
      <main id="contenu-principal" className="pt-16 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
