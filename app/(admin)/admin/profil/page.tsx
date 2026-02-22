'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/shared/SkeletonCard'
import ErrorState from '@/components/shared/ErrorState'
import { User, MapPin, Loader2, CheckCircle, ShieldCheck } from 'lucide-react'
import type { Profile } from '@/types/profile'

export default function AdminProfilPage() {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState(false)

  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [ville, setVille] = useState('')

  useEffect(() => {
    async function charger() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      setEmail(user.email || '')

      const { data: p, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (pError) { setError(pError.message); setLoading(false); return }
      setProfile(p)
      setPrenom(p.prenom || '')
      setNom(p.nom || '')
      setVille(p.ville || 'Abidjan')
      setLoading(false)
    }
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function sauvegarder(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ prenom, nom, ville })
      .eq('id', profile.id)

    if (!error) {
      setProfile((p) => p ? { ...p, prenom, nom, ville } : p)
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2500)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <Skeleton className="h-24 w-full rounded-xl mb-4" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !profile) {
    return <ErrorState message={error || 'Profil introuvable.'} />
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-[28px] font-bold text-[#1A2742] mb-6">Mon profil</h1>

      {/* Carte identité */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#E9A23B] flex items-center justify-center text-white text-xl font-bold shrink-0">
          {profile.prenom?.[0]?.toUpperCase()}
          {profile.nom?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold text-[#1A1A1A]">
            {profile.prenom} {profile.nom}
          </p>
          <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium bg-orange-50 text-[#E9A23B] px-2 py-0.5 rounded-full">
            <ShieldCheck size={12} />
            Administrateur BAARA
          </span>
        </div>
      </div>

      {/* Email (lecture seule) */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 mb-4">
        <label className="block text-sm font-medium text-[#6B7280] mb-1">Adresse email</label>
        <div className="flex items-center gap-2 text-[#1A1A1A]">
          <User size={15} className="text-[#6B7280]" />
          <span className="text-sm">{email}</span>
        </div>
      </div>

      {/* Formulaire édition */}
      <form onSubmit={sauvegarder} className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
        <h2 className="text-[18px] font-semibold text-[#1A2742] mb-4">Modifier mes informations</h2>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Prénom</label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A2742] min-h-[44px] text-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Nom</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A2742] min-h-[44px] text-base"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                Ville
              </span>
            </label>
            <input
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A2742] min-h-[44px] text-base"
            />
          </div>

          {savedMsg && (
            <p className="text-sm text-[#10B981] flex items-center gap-1.5">
              <CheckCircle size={14} />
              Profil mis à jour avec succès
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#1A2742] text-white py-3 rounded-lg font-semibold min-h-[44px] hover:bg-[#1A2742]/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  )
}
