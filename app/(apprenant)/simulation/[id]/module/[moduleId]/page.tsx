'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/shared/SkeletonCard'
import ErrorState from '@/components/shared/ErrorState'
import ModuleNav from '@/components/simulation/ModuleNav'
import {
  ArrowLeft,
  FileText,
  Send,
  Loader2,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react'
import Link from 'next/link'
import type { Module } from '@/types/simulation'

interface ModuleData extends Module {
  simulation: {
    id: string
    titre: string
    modules: Module[]
  }
}

export default function ModulePage() {
  const { id: simulationId, moduleId } = useParams<{ id: string; moduleId: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [moduleData, setModuleData] = useState<ModuleData | null>(null)
  const [modulesCompletes, setModulesCompletes] = useState<string[]>([])
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
  const [livrable, setLivrable] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNav, setShowNav] = useState(false)

  async function charger() {
    setLoading(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      // Charger le module avec sa simulation et tous les modules de la simulation
      const { data: mod, error: modError } = await supabase
        .from('modules')
        .select('*, simulation:simulations(id, titre, modules(*))')
        .eq('id', moduleId)
        .single()

      if (modError) throw modError

      // Trier les modules
      if (mod.simulation?.modules) {
        mod.simulation.modules.sort(
          (a: { ordre: number }, b: { ordre: number }) => a.ordre - b.ordre
        )
      }
      setModuleData(mod)

      // Charger l'enrollment et les submissions
      const { data: enr } = await supabase
        .from('enrollments')
        .select('id')
        .eq('apprenant_id', user.id)
        .eq('simulation_id', simulationId)
        .single()

      if (enr) {
        setEnrollmentId(enr.id)

        const { data: subs } = await supabase
          .from('submissions')
          .select('module_id, statut')
          .eq('enrollment_id', enr.id)
          .eq('statut', 'evalue')

        setModulesCompletes(subs?.map((s: { module_id: string }) => s.module_id) || [])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger ce module.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId])

  async function soumettrelivrable() {
    if (!livrable.trim()) {
      setError('Rédige ton livrable avant de soumettre.')
      return
    }
    if (livrable.trim().length < 50) {
      setError('Ton livrable est trop court. Développe davantage ta réponse.')
      return
    }
    if (!enrollmentId) {
      setError('Inscription introuvable. Recharge la page.')
      return
    }
    setError(null)
    setSubmitting(true)

    try {
      // Étape 1 — créer la soumission via /api/submit
      const submitRes = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          enrollmentId,
          contenuTexte: livrable,
        }),
      })

      const submitData = await submitRes.json()
      if (!submitRes.ok) {
        throw new Error(submitData.error || 'Erreur lors de la soumission.')
      }

      const submissionId = submitData.submissionId

      // Étape 2 — générer le feedback IA via /api/feedback
      const feedbackRes = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          briefing: moduleData?.briefing_contenu,
          livrable,
          titreModule: moduleData?.titre,
          titreSimulation: moduleData?.simulation?.titre,
        }),
      })

      if (!feedbackRes.ok) {
        const data = await feedbackRes.json()
        throw new Error(data.error || 'Erreur lors de l\'évaluation.')
      }

      router.push(`/simulation/${simulationId}/feedback/${submissionId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la soumission.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-8 w-3/4 mb-6" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-36 w-full" />
      </div>
    )
  }

  if (error && !moduleData) {
    return <ErrorState message={error} onRetry={charger} />
  }

  if (!moduleData) return null

  const modules = moduleData.simulation?.modules || []

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <Link
          href={`/simulation/${simulationId}`}
          className="flex items-center gap-1 text-[#6B7280] text-sm hover:text-[#1A2742] transition-colors min-h-[44px]"
        >
          <ArrowLeft size={16} />
          Retour
        </Link>
        <button
          onClick={() => setShowNav(!showNav)}
          className="flex items-center gap-1 text-sm text-[#6B7280] min-h-[44px] px-2"
        >
          {showNav ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation modules (mobile drawer) */}
      {showNav && modules.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4 mb-5">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
            Modules
          </p>
          <ModuleNav
            modules={modules}
            moduleActuelId={moduleId}
            modulesCompletes={modulesCompletes}
            onSelectModule={(mId) => {
              setShowNav(false)
              router.push(`/simulation/${simulationId}/module/${mId}`)
            }}
          />
        </div>
      )}

      {/* Titre module */}
      <div className="mb-5">
        <p className="text-xs font-medium text-[#E9A23B] uppercase tracking-wide mb-1">
          {moduleData.simulation?.titre}
        </p>
        <h1 className="text-[22px] font-bold text-[#1A2742]">{moduleData.titre}</h1>
        <p className="text-[#6B7280] text-sm mt-1">{moduleData.description}</p>
      </div>

      {/* Briefing */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-[#1A2742]" />
          <h2 className="font-semibold text-[18px] text-[#1A2742]">Briefing</h2>
        </div>
        <div className="text-[#1A1A1A] text-sm leading-relaxed whitespace-pre-wrap">
          {moduleData.briefing_contenu}
        </div>

        {/* Ressources */}
        {moduleData.ressources && moduleData.ressources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
              Ressources
            </p>
            <div className="flex flex-col gap-1.5">
              {moduleData.ressources.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#1A2742] hover:underline"
                >
                  <ExternalLink size={14} />
                  {r.titre}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Critères d'évaluation */}
      {moduleData.criteres_evaluation && moduleData.criteres_evaluation.length > 0 && (
        <div className="bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] p-4 mb-5">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
            Critères d&apos;évaluation
          </p>
          <ul className="flex flex-col gap-2">
            {moduleData.criteres_evaluation.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-[#E9A23B] font-bold shrink-0">{c.poids}%</span>
                <span className="text-[#1A1A1A]">
                  <strong>{c.nom}</strong> — {c.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Zone de rédaction */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 mb-4">
        <h2 className="font-semibold text-[18px] text-[#1A2742] mb-1">
          Ton livrable
        </h2>
        <p className="text-[#6B7280] text-xs mb-3">
          Rédige ta réponse complète ci-dessous. Minimum 50 caractères.
        </p>
        <textarea
          value={livrable}
          onChange={(e) => setLivrable(e.target.value)}
          placeholder="Commence à rédiger ton travail ici…"
          rows={10}
          className="w-full p-3 border border-[#E5E7EB] rounded-lg text-[#1A1A1A] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1A2742] text-sm leading-relaxed resize-y"
        />
        <p className="text-xs text-[#6B7280] mt-1.5 text-right">
          {livrable.length} caractères
        </p>
      </div>

      {/* Erreur */}
      {error && (
        <p className="text-sm text-[#EF4444] bg-red-50 px-3 py-2 rounded-lg mb-4">
          {error}
        </p>
      )}

      {/* Bouton soumettre */}
      <button
        onClick={soumettrelivrable}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-[#E9A23B] text-white py-4 rounded-xl font-bold text-base min-h-[56px] hover:bg-[#E9A23B]/90 transition-colors disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Évaluation en cours…
          </>
        ) : (
          <>
            <Send size={20} />
            Soumettre et obtenir le feedback IA
          </>
        )}
      </button>
      <p className="text-xs text-[#6B7280] text-center mt-2">
        L&apos;IA BAARA analysera ton travail en quelques secondes.
      </p>
    </div>
  )
}
