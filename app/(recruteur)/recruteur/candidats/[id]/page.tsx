import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, GraduationCap, Award, ExternalLink, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn, getMentionColor } from '@/lib/utils'
import type { Profile } from '@/types/profile'
import type { Certificat } from '@/types/submission'
import type { Simulation } from '@/types/simulation'

interface CertificatAvecSim extends Certificat {
  simulation: Simulation
}

interface FeedbackStats {
  score_global: number
  score_pertinence: number
  score_analyse: number
  score_clarte: number
  score_creativite: number
}

export default async function FicheCandidatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Vérifier que le profil est visible
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('visible_recruteurs', true)
    .eq('role', 'apprenant')
    .single()

  if (error || !profile) notFound()

  const p = profile as Profile

  // Certificats
  const { data: certificats } = await supabase
    .from('certificats')
    .select('*, simulation:simulations(*)')
    .eq('apprenant_id', id)
    .order('issued_at', { ascending: false })

  const certs = (certificats || []) as CertificatAvecSim[]

  // Moyenne des feedbacks
  const enrollmentIds = (await supabase
    .from('enrollments')
    .select('id')
    .eq('apprenant_id', id)
    .eq('statut', 'complete')).data?.map((e: { id: string }) => e.id) || []

  let stats: FeedbackStats | null = null
  if (enrollmentIds.length > 0) {
    const { data: submissions } = await supabase
      .from('submissions')
      .select('id')
      .in('enrollment_id', enrollmentIds)

    const subIds = submissions?.map((s: { id: string }) => s.id) || []

    if (subIds.length > 0) {
      const { data: feedbacks } = await supabase
        .from('feedbacks')
        .select('score_global, score_pertinence, score_analyse, score_clarte, score_creativite')
        .in('submission_id', subIds)

      if (feedbacks && feedbacks.length > 0) {
        const avg = (key: keyof FeedbackStats) =>
          Math.round(
            feedbacks.reduce((acc: number, f: FeedbackStats) => acc + f[key], 0) /
              feedbacks.length
          )
        stats = {
          score_global: avg('score_global'),
          score_pertinence: avg('score_pertinence'),
          score_analyse: avg('score_analyse'),
          score_clarte: avg('score_clarte'),
          score_creativite: avg('score_creativite'),
        }
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      {/* Retour */}
      <Link
        href="/recruteur/candidats"
        className="inline-flex items-center gap-1.5 text-[#6B7280] text-sm mb-6 hover:text-[#1A2742] transition-colors"
      >
        <ArrowLeft size={16} />
        Candidats
      </Link>

      {/* En-tête profil */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 mb-5">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-[#1A2742] flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {p.prenom?.[0]?.toUpperCase()}
            {p.nom?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-bold text-[#1A1A1A]">
              {p.prenom} {p.nom}
            </h1>
            <p className="text-[#6B7280] text-sm mb-3">{p.domaine_etudes}</p>
            <div className="flex flex-wrap gap-3 text-sm text-[#6B7280]">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {p.ville || 'Abidjan'}
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap size={14} />
                {p.niveau_etudes || '—'}
              </span>
              <span className="flex items-center gap-1 font-semibold text-[#E9A23B]">
                <Award size={14} />
                {certs.length} certificat{certs.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        {p.linkedin_url && (
          <a
            href={p.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 text-sm text-[#1A2742] font-medium hover:underline"
          >
            <ExternalLink size={14} />
            Profil LinkedIn
          </a>
        )}
      </div>

      {/* Compétences moyennes */}
      {stats && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 mb-5">
          <h2 className="font-bold text-[18px] text-[#1A2742] mb-4">
            Compétences moyennes (toutes simulations)
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Score global', value: stats.score_global },
              { label: 'Pertinence', value: stats.score_pertinence },
              { label: 'Qualité d\'analyse', value: stats.score_analyse },
              { label: 'Clarté & présentation', value: stats.score_clarte },
              { label: 'Créativité', value: stats.score_creativite },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#6B7280]">{label}</span>
                  <span className="font-semibold text-[#1A1A1A]">{value}/100</span>
                </div>
                <div className="h-2 bg-[#F8F9FA] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${value}%`,
                      backgroundColor:
                        value >= 75 ? '#10B981' : value >= 50 ? '#E9A23B' : '#EF4444',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificats */}
      <div>
        <h2 className="font-bold text-[18px] text-[#1A2742] mb-3 flex items-center gap-2">
          <CheckCircle size={18} className="text-[#10B981]" />
          Simulations complétées
        </h2>
        {certs.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
            <p className="text-[#6B7280] text-sm">Aucune simulation complétée.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {certs.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">{cert.simulation.titre}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {cert.simulation.entreprise_partenaire} · {cert.simulation.niveau}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-[#1A2742]">{cert.score_final}/100</p>
                    <span
                      className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded-full',
                        getMentionColor(cert.mention)
                      )}
                    >
                      {cert.mention}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[#6B7280] pt-3 border-t border-[#E5E7EB]">
                  <span className="font-mono">{cert.numero_certificat}</span>
                  <span>
                    {new Date(cert.issued_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
