'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, User, LogOut, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NavLink {
  href: string
  label: string
  icon: React.ReactNode
}

const apprenantLinks: NavLink[] = [
  { href: '/catalogue', label: 'Simulations', icon: <BookOpen size={20} /> },
  { href: '/profil', label: 'Mon profil', icon: <User size={20} /> },
]

export default function Navbar() {
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
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#1A2742] text-white h-16 items-center px-6 shadow-md">
        <Link href="/catalogue" className="flex items-center gap-2 mr-8">
          <span className="text-[#E9A23B] font-bold text-xl">BAARA</span>
          <span className="text-white/60 text-sm font-medium">Skills</span>
        </Link>
        <div className="flex items-center gap-1 flex-1">
          {apprenantLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                pathname.startsWith(link.href)
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/70 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px]"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1A2742] border-t border-white/10 flex items-center justify-around px-4 pb-safe">
        {apprenantLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex flex-col items-center gap-1 py-3 px-6 min-h-[60px] justify-center transition-colors',
              pathname.startsWith(link.href)
                ? 'text-[#E9A23B]'
                : 'text-white/60'
            )}
          >
            {link.icon}
            <span className="text-xs font-medium">{link.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-3 px-6 min-h-[60px] justify-center text-white/60"
        >
          <LogOut size={20} />
          <span className="text-xs font-medium">Sortir</span>
        </button>
      </nav>
    </>
  )
}
