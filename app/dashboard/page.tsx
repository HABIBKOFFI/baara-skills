import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Page de dispatch — redirige vers le bon espace selon le rôle.
 * Utilisée par le middleware quand un utilisateur authentifié
 * tente d'accéder à /auth, et après la confirmation d'email.
 */
export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, prenom')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') redirect('/admin/metriques')
  if (profile?.role === 'recruteur') redirect('/recruteur/dashboard')
  if (!profile?.prenom) redirect('/onboarding')
  redirect('/catalogue')
}
