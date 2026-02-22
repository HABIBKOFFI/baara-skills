import Link from 'next/link'
import { BookOpen, Users, BarChart3 } from 'lucide-react'

const adminLinks = [
  { href: '/admin/metriques', label: 'Métriques', icon: <BarChart3 size={18} /> },
  { href: '/admin/simulations', label: 'Simulations', icon: <BookOpen size={18} /> },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: <Users size={18} /> },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A2742] text-white h-16 flex items-center px-6 shadow-md">
        <Link href="/admin/metriques" className="flex items-center gap-2 mr-8">
          <span className="text-[#E9A23B] font-bold text-xl">BAARA</span>
          <span className="text-white/60 text-sm font-medium">Admin</span>
        </Link>
        <div className="flex items-center gap-1 flex-1">
          {adminLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors min-h-[44px]"
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
        </div>
        <span className="text-xs text-white/40 font-mono">Back-office</span>
      </nav>
      <div className="pt-16">{children}</div>
    </div>
  )
}
