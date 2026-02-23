'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, LayoutDashboard, UserCircle, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const recruteurLinks = [
  {
    href: '/recruteur/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} aria-hidden="true" />,
  },
  {
    href: '/recruteur/candidats',
    label: 'Candidats',
    icon: <Users size={20} aria-hidden="true" />,
  },
  {
    href: '/recruteur/profil',
    label: 'Mon profil',
    icon: <UserCircle size={20} aria-hidden="true" />,
  },
]

export default function NavRecruteur() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <>
      {/* Desktop nav */}
      <nav
        aria-label="Navigation recruteur"
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#1A2742] text-white h-16 items-center px-6 shadow-md"
      >
        <Link
          href="/recruteur/dashboard"
          aria-label="BAARA Recruteur — Accueil"
          className="flex items-center gap-2 mr-8"
        >
          <span className="text-[#E9A23B] font-bold text-xl" aria-hidden="true">BAARA</span>
          <span className="text-white/80 text-sm font-medium" aria-hidden="true">Recruteur</span>
        </Link>
        <div className="flex items-center gap-1 flex-1">
          {recruteurLinks.map((link) => {
            const isActive = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            )
          })}
        </div>
        <button
          onClick={handleLogout}
          aria-label="Se déconnecter de BAARA"
          className="flex items-center gap-2 text-white/70 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px]"
        >
          <LogOut size={18} aria-hidden="true" />
          <span>Déconnexion</span>
        </button>
      </nav>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Navigation mobile recruteur"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1A2742] border-t border-white/10 flex items-center justify-around px-2 pb-safe"
      >
        {recruteurLinks.map((link) => {
          const isActive = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-1 py-3 px-4 min-h-[60px] justify-center transition-colors',
                isActive ? 'text-[#E9A23B]' : 'text-white/60'
              )}
            >
              {link.icon}
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          aria-label="Se déconnecter de BAARA"
          className="flex flex-col items-center gap-1 py-3 px-4 min-h-[60px] justify-center text-white/60"
        >
          <LogOut size={20} aria-hidden="true" />
          <span className="text-xs font-medium">Déconnexion</span>
        </button>
      </nav>
    </>
  )
}
