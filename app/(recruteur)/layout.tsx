import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, LayoutDashboard } from 'lucide-react'
import LogoutButton from '@/components/shared/LogoutButton'

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
      {/* Nav recruteur */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A2742] text-white h-16 flex items-center px-6 shadow-md">
        <Link href="/recruteur/dashboard" className="flex items-center gap-2 mr-8">
          <span className="text-[#E9A23B] font-bold text-xl">BAARA</span>
          <span className="text-white/60 text-sm font-medium">Recruteur</span>
        </Link>
        <div className="flex items-center gap-1 flex-1">
          <Link
            href="/recruteur/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors min-h-[44px]"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link
            href="/recruteur/candidats"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors min-h-[44px]"
          >
            <Users size={18} />
            Candidats
          </Link>
        </div>
        <LogoutButton />
      </nav>
      <div className="pt-16">{children}</div>
    </div>
  )
}
