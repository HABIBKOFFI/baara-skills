'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-white/70 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px]"
    >
      <LogOut size={18} />
      Déconnexion
    </button>
  )
}
