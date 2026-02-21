'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/shared/SkeletonCard'
import ErrorState from '@/components/shared/ErrorState'
import { cn, getMentionColor } from '@/lib/utils'
import { Award, Download, Share2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import type { Certificat } from '@/types/submission'
import type { Simulation } from '@/types/simulation'
import type { Profile } from '@/types/profile'

interface CertificatData {
  certificat: Certificat
  simulation: Simulation
  profile: Profile
}

export default function CertificatPage() {
  const { id: simulationId } = useParams<{ id: string }>()
  const supabase = createClient()

  const [data, setData] = useState<CertificatData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function charger() {
      setLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: cert, error: certError } = await supabase
          .from('certificats')
          .select('*')
          .eq('apprenant_id', user.id)
          .eq('simulation_id', simulationId)
          .single()

        if (certError) throw certError

        const { data: sim } = await supabase
          .from('simulations')
          .select('*')
          .eq('id', simulationId)
          .single()

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setData({ certificat: cert, simulation: sim, profile })
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Certificat introuvable.')
      } finally {
        setLoading(false)
      }
    }
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationId])

  async function partager() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: 'Mon certificat BAARA',
        text: `J'ai obtenu le certificat BAARA pour la simulation "${data?.simulation.titre}" !`,
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <Skeleton className="h-64 w-full rounded-2xl mb-6" />
        <Skeleton className="h-12 w-full rounded-xl mb-3" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <ErrorState message={error || 'Certificat introuvable.'} />
        <div className="text-center mt-4">
          <Link href="/catalogue" className="text-[#1A2742] text-sm hover:underline">
            Retour au catalogue
          </Link>
        </div>
      </div>
    )
  }

  const { certificat, simulation, profile } = data
  const dateEmission = new Date(certificat.issued_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-[28px] font-bold text-[#1A2742]">
          Félicitations !
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Tu as complété la simulation avec succès.
        </p>
      </div>

      {/* Certificat visuel */}
      <div className="bg-white rounded-2xl border-2 border-[#E9A23B] shadow-md p-6 mb-6 relative overflow-hidden">
        {/* Décoration */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1A2742] via-[#E9A23B] to-[#1A2742]" />

        {/* Logo */}
        <div className="flex items-center justify-center mb-5 mt-2">
          <div className="text-center">
            <span className="text-[#1A2742] font-bold text-2xl">BAARA</span>
            <span className="text-[#E9A23B] font-bold text-2xl"> Skills</span>
          </div>
        </div>

        {/* Icône award */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#E9A23B]/10 flex items-center justify-center">
            <Award size={36} className="text-[#E9A23B]" />
          </div>
        </div>

        {/* Contenu */}
        <div className="text-center">
          <p className="text-sm text-[#6B7280] mb-1">Certifice que</p>
          <p className="text-[22px] font-bold text-[#1A2742] mb-3">
            {profile.prenom} {profile.nom}
          </p>
          <p className="text-sm text-[#6B7280] mb-1">a complété avec succès</p>
          <p className="text-lg font-semibold text-[#1A1A1A] mb-1">
            {simulation.titre}
          </p>
          <p className="text-sm text-[#6B7280] mb-4">
            en partenariat avec {simulation.entreprise_partenaire}
          </p>

          {/* Score et mention */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#1A2742]">
                {certificat.score_final}
              </p>
              <p className="text-xs text-[#6B7280]">Score /100</p>
            </div>
            <div className="w-px h-10 bg-[#E5E7EB]" />
            <div className="text-center">
              <span
                className={cn(
                  'inline-block text-sm font-bold px-3 py-1 rounded-full',
                  getMentionColor(certificat.mention)
                )}
              >
                {certificat.mention}
              </span>
            </div>
          </div>

          {/* Checkmark */}
          <div className="flex items-center justify-center gap-1.5 text-[#10B981] text-sm font-medium">
            <CheckCircle size={16} />
            Compétences certifiées BAARA
          </div>
        </div>

        {/* Bas du certificat */}
        <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
          <span>Émis le {dateEmission}</span>
          <span className="font-mono">{certificat.numero_certificat}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={partager}
          className="w-full flex items-center justify-center gap-2 bg-[#1A2742] text-white py-3.5 rounded-xl font-semibold min-h-[56px] hover:bg-[#1A2742]/90 transition-colors"
        >
          <Share2 size={18} />
          {copied ? 'Lien copié !' : 'Partager mon certificat'}
        </button>

        <button
          onClick={() => window.print()}
          className="w-full flex items-center justify-center gap-2 border border-[#E5E7EB] text-[#1A1A1A] py-3 rounded-xl font-medium text-sm min-h-[44px] hover:bg-gray-50 transition-colors"
        >
          <Download size={16} />
          Télécharger (PDF)
        </button>

        <Link
          href="/catalogue"
          className="w-full flex items-center justify-center text-[#6B7280] py-3 text-sm hover:text-[#1A2742] transition-colors min-h-[44px]"
        >
          Explorer d&apos;autres simulations
        </Link>
      </div>
    </div>
  )
}
