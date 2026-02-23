'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Users, BarChart3, UserCircle, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const adminLinks = [
  {
    href: '/admin/metriques',
    label: 'Métriques',
    icon: <BarChart3 size={20} aria-hidden="true" />,
  },
  {
    href: '/admin/simulations',
    label: 'Simulations',
    icon: <BookOpen size={20} aria-hidden="true" />,
  },
  {
    href: '/admin/utilisateurs',
    label: 'Utilisateurs',
    icon: <Users size={20} aria-hidden="true" />,
  },
  {
    href: '/admin/profil',
    label: 'Profil',
    icon: <UserCircle size={20} aria-hidden="true" />,
  },
]

export default function NavAdmin() {
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
        aria-label="Navigation administration"
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#1A2742] text-white h-16 items-center px-6 shadow-md"
      >
        <Link
          href="/admin/metriques"
          aria-label="BAARA Administration — Accueil"
          className="flex items-center gap-2 mr-8"
        >
          <span className="text-[#E9A23B] font-bold text-xl" aria-hidden="true">BAARA</span>
          <span className="text-white/80 text-sm font-medium" aria-hidden="true">Admin</span>
        </Link>
        <div className="flex items-center gap-1 flex-1">
          {adminLinks.map((link) => {
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
        aria-label="Navigation mobile administration"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1A2742] border-t border-white/10 flex items-center justify-around px-1 pb-safe"
      >
        {adminLinks.map((link) => {
          const isActive = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-1 py-3 px-3 min-h-[60px] justify-center transition-colors',
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
          className="flex flex-col items-center gap-1 py-3 px-3 min-h-[60px] justify-center text-white/60"
        >
          <LogOut size={20} aria-hidden="true" />
          <span className="text-xs font-medium">Déconnexion</span>
        </button>
      </nav>
    </>
  )
}
