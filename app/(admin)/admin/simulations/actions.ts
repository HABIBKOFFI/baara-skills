'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleSimulationActif(simulationId: string, actifActuel: boolean) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Accès refusé')

  const { error } = await supabase
    .from('simulations')
    .update({ actif: !actifActuel })
    .eq('id', simulationId)

  if (error) throw error

  revalidatePath('/admin/simulations')
}
