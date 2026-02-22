import { createClient } from '@/lib/supabase/server'
import { Plus, Eye, EyeOff, Clock, Building2 } from 'lucide-react'
import type { Simulation } from '@/types/simulation'

const niveauColors: Record<string, string> = {
  Débutant: 'bg-green-50 text-green-700',
  Intermédiaire: 'bg-orange-50 text-orange-700',
  Avancé: 'bg-red-50 text-red-700',
}

export default async function AdminSimulationsPage() {
  const supabase = await createClient()

  const { data: simulations } = await supabase
    .from('simulations')
    .select('*, modules(count)')
    .order('ordre')

  const sims = (simulations || []) as (Simulation & { modules: { count: number }[] })[]

  // Stats par simulation
  const simIds = sims.map((s) => s.id)
  const { data: enrollStats } = await supabase
    .from('enrollments')
    .select('simulation_id, statut')
    .in('simulation_id', simIds)

  const statsBySim = new Map<string, { total: number; complete: number }>()
  enrollStats?.forEach((e: { simulation_id: string; statut: string }) => {
    const current = statsBySim.get(e.simulation_id) || { total: 0, complete: 0 }
    statsBySim.set(e.simulation_id, {
      total: current.total + 1,
      complete: current.complete + (e.statut === 'complete' ? 1 : 0),
    })
  })

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1A2742]">Simulations</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            {sims.length} simulation{sims.length !== 1 ? 's' : ''} configurée{sims.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#E9A23B] text-white px-4 py-2.5 rounded-lg text-sm font-semibold min-h-[44px] hover:bg-[#E9A23B]/90 transition-colors">
          <Plus size={18} />
          Nouvelle simulation
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {sims.map((sim) => {
          const stats = statsBySim.get(sim.id) || { total: 0, complete: 0 }
          const taux = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0
          const nbModules = sim.modules?.[0]?.count || 0

          return (
            <div
              key={sim.id}
              className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-[#1A1A1A]">{sim.titre}</h3>
                    {sim.actif ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <Eye size={10} />
                        Actif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        <EyeOff size={10} />
                        Inactif
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${niveauColors[sim.niveau] || ''}`}
                    >
                      {sim.niveau}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B7280] line-clamp-1">{sim.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-[#1A2742]">{taux}%</p>
                  <p className="text-xs text-[#6B7280]">complétion</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-[#6B7280] mb-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 size={14} />
                  {sim.entreprise_partenaire}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {sim.duree_heures}h
                </span>
                <span>{nbModules} module{nbModules !== 1 ? 's' : ''}</span>
                <span className="font-mono text-xs">{sim.slug}</span>
              </div>

              {/* Barre progression */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-[#6B7280] mb-1">
                  <span>{stats.complete} complété{stats.complete !== 1 ? 's' : ''}</span>
                  <span>{stats.total} inscrit{stats.total !== 1 ? 's' : ''}</span>
                </div>
                <div className="h-1.5 bg-[#F8F9FA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E9A23B] rounded-full transition-all"
                    style={{ width: `${taux}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-[#E5E7EB]">
                <button className="text-xs text-[#1A2742] font-medium px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F8F9FA] transition-colors min-h-[36px]">
                  Modifier
                </button>
                <button className="text-xs text-[#1A2742] font-medium px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F8F9FA] transition-colors min-h-[36px]">
                  Voir les modules
                </button>
                <button
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors min-h-[36px] ${
                    sim.actif
                      ? 'text-red-600 border-red-200 hover:bg-red-50'
                      : 'text-green-700 border-green-200 hover:bg-green-50'
                  }`}
                >
                  {sim.actif ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
