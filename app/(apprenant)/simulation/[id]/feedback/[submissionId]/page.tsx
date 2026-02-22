'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/shared/SkeletonCard'
import ErrorState from '@/components/shared/ErrorState'
import FeedbackDisplay from '@/components/simulation/FeedbackDisplay'
import { ArrowLeft, ChevronRight, Award } from 'lucide-react'
import Link from 'next/link'
import type { Feedback } from '@/types/submission'

export default function FeedbackPage() {
  const { id: simulationId, submissionId } = useParams<{
    id: string
    submissionId: string
  }>()
  const router = useRouter()
  const supabase = createClient()

  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [prochainModuleId, setProchainModuleId] = useState<string | null>(null)
  const [simulationComplete, setSimulationComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function charger() {
      setLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) { router.push('/auth'); return }

        // Charger le feedback
        const { data: fb, error: fbError } = await supabase
          .from('feedbacks')
          .select('*')
          .eq('submission_id', submissionId)
          .single()

        if (fbError) throw fbError
        setFeedback(fb)

        // Vérifier si la simulation est complète
        const { data: enr } = await supabase
          .from('enrollments')
          .select('statut, module_actuel_id')
          .eq('apprenant_id', user.id)
          .eq('simulation_id', simulationId)
          .single()

        if (enr?.statut === 'complete') {
          setSimulationComplete(true)
        } else if (enr?.module_actuel_id) {
          setProchainModuleId(enr.module_actuel_id)
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Feedback introuvable.')
      } finally {
        setLoading(false)
      }
    }
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-32 w-full rounded-xl mb-4" />
        <Skeleton className="h-48 w-full rounded-xl mb-4" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !feedback) {
    return <ErrorState message={error || 'Feedback introuvable.'} />
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Retour */}
      <Link
        href={`/simulation/${simulationId}`}
        className="inline-flex items-center gap-1 text-[#6B7280] text-sm mb-5 hover:text-[#1A2742] transition-colors min-h-[44px]"
      >
        <ArrowLeft size={16} />
        Simulation
      </Link>

      {/* Titre */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A2742]">
          Ton évaluation
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Voici le retour détaillé de l&apos;IA BAARA sur ton travail.
        </p>
      </div>

      {/* Feedback */}
      <FeedbackDisplay feedback={feedback} />

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3">
        {simulationComplete ? (
          <Link
            href={`/simulation/${simulationId}/certificat`}
            className="w-full flex items-center justify-center gap-2 bg-[#10B981] text-white py-4 rounded-xl font-bold text-base min-h-[56px] hover:bg-[#10B981]/90 transition-colors"
          >
            <Award size={20} />
            Obtenir mon certificat !
          </Link>
        ) : prochainModuleId ? (
          <Link
            href={`/simulation/${simulationId}/module/${prochainModuleId}`}
            className="w-full flex items-center justify-center gap-2 bg-[#E9A23B] text-white py-4 rounded-xl font-bold text-base min-h-[56px] hover:bg-[#E9A23B]/90 transition-colors"
          >
            Module suivant
            <ChevronRight size={20} />
          </Link>
        ) : null}

        <Link
          href="/catalogue"
          className="w-full flex items-center justify-center gap-2 border border-[#E5E7EB] text-[#6B7280] py-3 rounded-xl font-medium text-sm min-h-[44px] hover:bg-gray-50 transition-colors"
        >
          Retour au catalogue
        </Link>
      </div>
    </div>
  )
}
