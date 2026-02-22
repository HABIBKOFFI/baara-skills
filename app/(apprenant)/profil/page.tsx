'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/shared/SkeletonCard'
import ErrorState from '@/components/shared/ErrorState'
import { cn, getMentionColor } from '@/lib/utils'
import {
  User,
  MapPin,
  GraduationCap,
  Award,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import type { Profile } from '@/types/profile'
import type { Certificat } from '@/types/submission'
import type { Simulation } from '@/types/simulation'

interface CertificatAvecSim extends Certificat {
  simulation: Simulation
}

export default function ProfilPage() {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [certificats, setCertificats] = useState<CertificatAvecSim[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState(false)

  useEffect(() => {
    async function charger() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: p, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (pError) { setError(pError.message); setLoading(false); return }
      setProfile(p)

      const { data: certs } = await supabase
        .from('certificats')
        .select('*, simulation:simulations(*)')
        .eq('apprenant_id', user.id)
        .order('issued_at', { ascending: false })

      setCertificats(certs || [])
      setLoading(false)
    }
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function toggleVisibilite() {
    if (!profile) return
    setSaving(true)
    const nouvelleValeur = !profile.visible_recruteurs
    const { error } = await supabase
      .from('profiles')
      .update({ visible_recruteurs: nouvelleValeur })
      .eq('id', profile.id)

    if (!error) {
      setProfile((p) => p ? { ...p, visible_recruteurs: nouvelleValeur } : p)
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Skeleton className="h-24 w-full rounded-xl mb-4" />
        <Skeleton className="h-16 w-full rounded-xl mb-4" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !profile) {
    return <ErrorState message={error || 'Profil introuvable.'} />
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-[28px] font-bold text-[#1A2742] mb-6">Mon profil</h1>

      {/* Carte profil */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 mb-4">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-[#1A2742] flex items-center justify-center text-white text-xl font-bold shrink-0">
            {profile.prenom?.[0]?.toUpperCase()}
            {profile.nom?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-[#1A1A1A]">
              {profile.prenom} {profile.nom}
            </h2>
            <p className="text-[#6B7280] text-sm">{profile.domaine_etudes}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <MapPin size={15} />
            {profile.ville || 'Abidjan'}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <GraduationCap size={15} />
            {profile.niveau_etudes || '—'}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <User size={15} />
            {profile.domaine_etudes || '—'}
          </div>
        </div>
      </div>

      {/* Visibilité recruteurs */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-[#1A1A1A] mb-1">
              Visible par les recruteurs
            </h3>
            <p className="text-sm text-[#6B7280]">
              {profile.visible_recruteurs
                ? 'Ton profil est visible dans l\'espace recruteurs.'
                : 'Ton profil est privé. Active la visibilité pour être trouvé par les recruteurs.'}
            </p>
          </div>
          <button
            onClick={toggleVisibilite}
            disabled={saving}
            className={cn(
              'shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors',
              profile.visible_recruteurs
                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
            )}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : profile.visible_recruteurs ? (
              <Eye size={16} />
            ) : (
              <EyeOff size={16} />
            )}
            {profile.visible_recruteurs ? 'Visible' : 'Masqué'}
          </button>
        </div>
        {savedMsg && (
          <p className="text-xs text-[#10B981] mt-2 flex items-center gap-1">
            <CheckCircle size={12} />
            Préférence sauvegardée
          </p>
        )}
      </div>

      {/* Certificats */}
      <div>
        <h2 className="text-[22px] font-bold text-[#1A2742] mb-3 flex items-center gap-2">
          <Award size={20} />
          Mes certificats ({certificats.length})
        </h2>

        {certificats.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
            <Award size={32} className="text-[#E5E7EB] mx-auto mb-2" />
            <p className="text-[#6B7280] text-sm">
              Aucun certificat pour l&apos;instant. Complète une simulation !
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {certificats.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">
                      {cert.simulation.titre}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {cert.simulation.entreprise_partenaire}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-[#1A2742]">
                      {cert.score_final}/100
                    </p>
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        getMentionColor(cert.mention)
                      )}
                    >
                      {cert.mention}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E7EB]">
                  <span className="text-xs text-[#6B7280] font-mono">
                    {cert.numero_certificat}
                  </span>
                  <span className="text-xs text-[#6B7280]">
                    {new Date(cert.issued_at).toLocaleDateString('fr-FR')}
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
