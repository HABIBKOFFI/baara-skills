'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react'

const DOMAINES = [
  'Finance & Comptabilité',
  'Informatique & Tech',
  'Ressources Humaines',
  'Marketing & Communication',
  'Commerce & Vente',
  'Supply Chain & Logistique',
  'Droit & Juridique',
  'Ingénierie',
  'Autre',
]

const NIVEAUX = [
  'Licence / Bachelor',
  'Master',
  'BTS / DUT',
  'Bac professionnel',
  'Doctorat',
  'Autre',
]

interface FormData {
  prenom: string
  nom: string
  ville: string
  domaine_etudes: string
  niveau_etudes: string
}

export default function OnboardingPage() {
  const [etape, setEtape] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({
    prenom: '',
    nom: '',
    ville: 'Abidjan',
    domaine_etudes: '',
    niveau_etudes: '',
  })
  const router = useRouter()
  const supabase = createClient()

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function etapeSuivante() {
    if (etape === 1 && (!form.prenom.trim() || !form.nom.trim())) {
      setError('Merci de renseigner ton prénom et ton nom.')
      return
    }
    if (etape === 2 && !form.domaine_etudes) {
      setError('Choisis ton domaine d\'études.')
      return
    }
    setError(null)
    setEtape((e) => e + 1)
  }

  async function terminer() {
    if (!form.niveau_etudes) {
      setError('Choisis ton niveau d\'études.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth')
        return
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        role: 'apprenant',
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        ville: form.ville || 'Abidjan',
        domaine_etudes: form.domaine_etudes,
        niveau_etudes: form.niveau_etudes,
        visible_recruteurs: false,
      })

      if (error) throw error
      router.push('/catalogue')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const progression = (etape / 3) * 100

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1A2742] mb-1">
            Bienvenue sur BAARA
          </h1>
          <p className="text-[#6B7280] text-sm">
            Étape {etape} sur 3 — Configure ton profil
          </p>
        </div>

        {/* Barre de progression */}
        <div className="h-1.5 bg-[#E5E7EB] rounded-full mb-8">
          <div
            className="h-full bg-[#E9A23B] rounded-full transition-all duration-500"
            style={{ width: `${progression}%` }}
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">

          {/* Étape 1 — Identité */}
          {etape === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-[22px] font-bold text-[#1A1A1A] mb-1">
                  Qui es-tu ?
                </h2>
                <p className="text-[#6B7280] text-sm">
                  Commence par nous présenter.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                  Prénom
                </label>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => update('prenom', e.target.value)}
                  placeholder="Kouassi"
                  className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A2742] min-h-[44px] text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => update('nom', e.target.value)}
                  placeholder="Yao"
                  className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A2742] min-h-[44px] text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                  Ville
                </label>
                <input
                  type="text"
                  value={form.ville}
                  onChange={(e) => update('ville', e.target.value)}
                  placeholder="Abidjan"
                  className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A2742] min-h-[44px] text-base"
                />
              </div>
            </div>
          )}

          {/* Étape 2 — Domaine */}
          {etape === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-[22px] font-bold text-[#1A1A1A] mb-1">
                  Ton domaine d&apos;études
                </h2>
                <p className="text-[#6B7280] text-sm">
                  On te proposera des simulations adaptées.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {DOMAINES.map((d) => (
                  <button
                    key={d}
                    onClick={() => update('domaine_etudes', d)}
                    className={`text-left px-4 py-3 rounded-lg border text-sm font-medium min-h-[44px] transition-colors ${
                      form.domaine_etudes === d
                        ? 'border-[#1A2742] bg-[#1A2742] text-white'
                        : 'border-[#E5E7EB] text-[#1A1A1A] hover:border-[#1A2742]/40'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Étape 3 — Niveau */}
          {etape === 3 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-[22px] font-bold text-[#1A1A1A] mb-1">
                  Ton niveau d&apos;études
                </h2>
                <p className="text-[#6B7280] text-sm">
                  Dernière étape avant de commencer !
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {NIVEAUX.map((n) => (
                  <button
                    key={n}
                    onClick={() => update('niveau_etudes', n)}
                    className={`text-left px-4 py-3 rounded-lg border text-sm font-medium min-h-[44px] transition-colors ${
                      form.niveau_etudes === n
                        ? 'border-[#1A2742] bg-[#1A2742] text-white'
                        : 'border-[#E5E7EB] text-[#1A1A1A] hover:border-[#1A2742]/40'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <p className="text-sm text-[#EF4444] bg-red-50 px-3 py-2 rounded-lg mt-4">
              {error}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-4">
          {etape > 1 && (
            <button
              onClick={() => setEtape((e) => e - 1)}
              className="flex items-center gap-1 px-4 py-3 rounded-lg border border-[#E5E7EB] text-[#6B7280] font-medium text-sm min-h-[44px] hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={18} />
              Retour
            </button>
          )}
          {etape < 3 ? (
            <button
              onClick={etapeSuivante}
              className="flex-1 flex items-center justify-center gap-1 bg-[#1A2742] text-white py-3 rounded-lg font-semibold min-h-[44px] hover:bg-[#1A2742]/90 transition-colors"
            >
              Continuer
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={terminer}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#E9A23B] text-white py-3 rounded-lg font-semibold min-h-[44px] hover:bg-[#E9A23B]/90 transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Commencer BAARA !
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
