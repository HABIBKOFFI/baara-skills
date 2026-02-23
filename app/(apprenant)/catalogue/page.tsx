'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import SimulationCard from '@/components/simulation/SimulationCard'
import { SkeletonList } from '@/components/shared/SkeletonCard'
import ErrorState from '@/components/shared/ErrorState'
import { Search } from 'lucide-react'
import type { Simulation, Enrollment } from '@/types/simulation'

type Filtre = 'tous' | 'Débutant' | 'Intermédiaire' | 'Avancé'

export default function CataloguePage() {
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [enrollments, setEnrollments] = useState<Map<string, Enrollment>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState<Filtre>('tous')
  const supabase = createClient()

  async function charger() {
    setLoading(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: sims, error: simsError } = await supabase
        .from('simulations')
        .select('*')
        .eq('actif', true)
        .order('ordre')

      if (simsError) throw simsError
      setSimulations(sims || [])

      if (user) {
        const { data: enrs } = await supabase
          .from('enrollments')
          .select('*')
          .eq('apprenant_id', user.id)

        const map = new Map<string, Enrollment>()
        enrs?.forEach((e) => map.set(e.simulation_id, e))
        setEnrollments(map)
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        const e = err as { message: string; code?: string }
        const msg = e.message + (e.code ? ` (code: ${e.code})` : '')
        setError(msg || 'Impossible de charger les simulations.')
      } else {
        setError(String(err) || 'Impossible de charger les simulations.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtrees = simulations.filter((s) => {
    const matchRecherche =
      s.titre.toLowerCase().includes(recherche.toLowerCase()) ||
      s.entreprise_partenaire.toLowerCase().includes(recherche.toLowerCase()) ||
      s.domaine.toLowerCase().includes(recherche.toLowerCase())
    const matchFiltre = filtre === 'tous' || s.niveau === filtre
    return matchRecherche && matchFiltre
  })

  const filtres: Filtre[] = ['tous', 'Débutant', 'Intermédiaire', 'Avancé']
  const filtreLabels: Record<Filtre, string> = {
    tous: 'Tous les niveaux',
    Débutant: 'Débutant',
    Intermédiaire: 'Intermédiaire',
    Avancé: 'Avancé',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A2742] mb-1">
          Simulations
        </h1>
        {/* aria-live annonce les changements de résultats aux lecteurs d'écran */}
        <p
          className="text-[#6B7280] text-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          {loading
            ? 'Chargement…'
            : `${filtrees.length} simulation${filtrees.length !== 1 ? 's' : ''} disponible${filtrees.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden="true" />
        <label htmlFor="recherche-simulation" className="sr-only">
          Rechercher une simulation
        </label>
        <input
          id="recherche-simulation"
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher une simulation…"
          aria-label="Rechercher par titre, entreprise ou domaine"
          className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-[#1A1A1A] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1A2742] min-h-[44px] text-base bg-white"
        />
      </div>

      {/* Filtres niveau */}
      <div
        role="group"
        aria-label="Filtrer par niveau"
        className="flex gap-2 mb-6 overflow-x-auto pb-1"
      >
        {filtres.map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            aria-pressed={filtre === f}
            aria-label={filtreLabels[f]}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium min-h-[44px] transition-colors ${
              filtre === f
                ? 'bg-[#1A2742] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#1A2742]/40'
            }`}
          >
            {f === 'tous' ? 'Tous' : f}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {loading ? (
        <div role="status" aria-label="Chargement des simulations">
          <SkeletonList count={4} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={charger} />
      ) : filtrees.length === 0 ? (
        <p role="status" className="text-center py-16 text-[#6B7280] text-sm">
          {recherche
            ? `Aucun résultat pour « ${recherche} »`
            : 'Aucune simulation disponible pour le moment.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-4 list-none p-0">
          {filtrees.map((sim) => (
            <li key={sim.id}>
              <SimulationCard
                simulation={sim}
                enrollment={enrollments.get(sim.id) || null}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
