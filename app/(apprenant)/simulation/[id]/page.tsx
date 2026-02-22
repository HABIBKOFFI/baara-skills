'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/shared/SkeletonCard'
import ErrorState from '@/components/shared/ErrorState'
import {
  Clock,
  Building2,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'
import type { SimulationWithModules, Enrollment } from '@/types/simulation'

const typeLabels = {
  decouverte: 'Découverte',
  analyse: 'Analyse',
  production: 'Production',
  presentation: 'Présentation',
}

const typeColors = {
  decouverte: 'bg-blue-50 text-blue-700',
  analyse: 'bg-purple-50 text-purple-700',
  production: 'bg-orange-50 text-orange-700',
  presentation: 'bg-green-50 text-green-700',
}

export default function SimulationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [simulation, setSimulation] = useState<SimulationWithModules | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function charger() {
    setLoading(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: sim, error: simError } = await supabase
        .from('simulations')
        .select('*, modules(*)')
        .eq('id', id)
        .single()

      if (simError) throw simError

      // Trier les modules par ordre
      sim.modules = (sim.modules || []).sort(
        (a: { ordre: number }, b: { ordre: number }) => a.ordre - b.ordre
      )
      setSimulation(sim)

      if (user) {
        const { data: enr } = await supabase
          .from('enrollments')
          .select('*')
          .eq('apprenant_id', user.id)
          .eq('simulation_id', id)
          .single()
        setEnrollment(enr)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Simulation introuvable.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function commencerSimulation() {
    setEnrolling(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const premierModule = simulation?.modules[0]

      const { data: enr, error } = await supabase
        .from('enrollments')
        .insert({
          apprenant_id: user.id,
          simulation_id: id,
          statut: 'en_cours',
          module_actuel_id: premierModule?.id || null,
        })
        .select()
        .single()

      if (error) throw error
      setEnrollment(enr)

      if (premierModule) {
        router.push(`/simulation/${id}/module/${premierModule.id}`)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de démarrer la simulation.')
    } finally {
      setEnrolling(false)
    }
  }

  function continuerSimulation() {
    if (!enrollment?.module_actuel_id) return
    router.push(`/simulation/${id}/module/${enrollment.module_actuel_id}`)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2 mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !simulation) {
    return <ErrorState message={error || 'Simulation introuvable.'} onRetry={charger} />
  }

  const estComplete = enrollment?.statut === 'complete'
  const enCours = enrollment?.statut === 'en_cours'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Retour */}
      <Link
        href="/catalogue"
        className="inline-flex items-center gap-1 text-[#6B7280] text-sm mb-5 hover:text-[#1A2742] transition-colors min-h-[44px]"
      >
        <ArrowLeft size={16} />
        Catalogue
      </Link>

      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-[#6B7280]">
            {simulation.domaine}
          </span>
          {estComplete && (
            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">
              <CheckCircle size={12} />
              Terminé
            </span>
          )}
        </div>
        <h1 className="text-[28px] font-bold text-[#1A2742] mb-2">
          {simulation.titre}
        </h1>
        <div className="flex items-center gap-4 text-sm text-[#6B7280] mb-4">
          <span className="flex items-center gap-1">
            <Building2 size={14} />
            {simulation.entreprise_partenaire}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {simulation.duree_heures}h de travail
          </span>
          <span className="font-medium text-[#1A1A1A]">{simulation.niveau}</span>
        </div>
        <p className="text-[#1A1A1A] leading-relaxed">{simulation.description}</p>
      </div>

      {/* Modules */}
      <div className="mb-6">
        <h2 className="text-[22px] font-bold text-[#1A2742] mb-3 flex items-center gap-2">
          <BookOpen size={20} />
          Programme ({simulation.modules.length} modules)
        </h2>
        <div className="flex flex-col gap-3">
          {simulation.modules.map((module, index) => (
            <div
              key={module.id}
              className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center text-xs font-semibold text-[#6B7280] shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[module.type]}`}
                    >
                      {typeLabels[module.type]}
                    </span>
                  </div>
                  <p className="font-semibold text-[#1A1A1A] text-sm">
                    {module.titre}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{module.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {!enrollment && (
        <button
          onClick={commencerSimulation}
          disabled={enrolling}
          className="w-full flex items-center justify-center gap-2 bg-[#E9A23B] text-white py-4 rounded-xl font-bold text-base min-h-[56px] hover:bg-[#E9A23B]/90 transition-colors disabled:opacity-60"
        >
          {enrolling ? 'Démarrage…' : 'Commencer la simulation'}
          <ChevronRight size={20} />
        </button>
      )}

      {enCours && (
        <button
          onClick={continuerSimulation}
          className="w-full flex items-center justify-center gap-2 bg-[#1A2742] text-white py-4 rounded-xl font-bold text-base min-h-[56px] hover:bg-[#1A2742]/90 transition-colors"
        >
          Continuer la simulation
          <ChevronRight size={20} />
        </button>
      )}

      {estComplete && (
        <Link
          href={`/simulation/${id}/certificat`}
          className="w-full flex items-center justify-center gap-2 bg-[#10B981] text-white py-4 rounded-xl font-bold text-base min-h-[56px] hover:bg-[#10B981]/90 transition-colors"
        >
          <CheckCircle size={20} />
          Voir mon certificat
        </Link>
      )}
    </div>
  )
}
