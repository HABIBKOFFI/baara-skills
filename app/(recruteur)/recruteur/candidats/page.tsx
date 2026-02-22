'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Award, MapPin, GraduationCap, Filter } from 'lucide-react'
import Link from 'next/link'
import { SkeletonList } from '@/components/shared/SkeletonCard'
import ErrorState from '@/components/shared/ErrorState'

interface Candidat {
  id: string
  prenom: string
  nom: string
  ville: string
  domaine_etudes: string
  niveau_etudes: string
  nb_certificats: number
}

const DOMAINES = [
  'Tous',
  'Finance & Comptabilité',
  'Informatique & Tech',
  'Ressources Humaines',
  'Marketing & Communication',
  'Commerce & Vente',
  'Supply Chain & Logistique',
  'Droit & Juridique',
  'Ingénierie',
]

export default function CandidatsPage() {
  const [candidats, setCandidats] = useState<Candidat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recherche, setRecherche] = useState('')
  const [domaine, setDomaine] = useState('Tous')
  const [showFilters, setShowFilters] = useState(false)
  const supabase = createClient()

  async function charger() {
    setLoading(true)
    setError(null)
    try {
      // Récupérer les profils visibles avec le nombre de certificats
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, prenom, nom, ville, domaine_etudes, niveau_etudes')
        .eq('role', 'apprenant')
        .eq('visible_recruteurs', true)
        .order('created_at', { ascending: false })

      if (pError) throw pError

      // Récupérer le nombre de certificats pour chaque candidat
      const ids = profiles?.map((p: { id: string }) => p.id) || []
      const { data: certs } = await supabase
        .from('certificats')
        .select('apprenant_id')
        .in('apprenant_id', ids)

      const certCount = new Map<string, number>()
      certs?.forEach((c: { apprenant_id: string }) => {
        certCount.set(c.apprenant_id, (certCount.get(c.apprenant_id) || 0) + 1)
      })

      const enriched = (profiles || []).map((p: {
        id: string; prenom: string; nom: string; ville: string;
        domaine_etudes: string; niveau_etudes: string
      }) => ({
        ...p,
        nb_certificats: certCount.get(p.id) || 0,
      }))

      setCandidats(enriched)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les candidats.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtres = candidats.filter((c) => {
    const q = recherche.toLowerCase()
    const matchRecherche =
      c.prenom?.toLowerCase().includes(q) ||
      c.nom?.toLowerCase().includes(q) ||
      c.domaine_etudes?.toLowerCase().includes(q) ||
      c.ville?.toLowerCase().includes(q)
    const matchDomaine = domaine === 'Tous' || c.domaine_etudes === domaine
    return matchRecherche && matchDomaine
  })

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1A2742]">Candidats certifiés</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          {filtres.length} profil{filtres.length !== 1 ? 's' : ''} disponible{filtres.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Recherche + filtre */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Nom, domaine, ville…"
            className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-[#1A1A1A] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1A2742] min-h-[44px] text-base bg-white"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium min-h-[44px] transition-colors ${
            showFilters || domaine !== 'Tous'
              ? 'border-[#1A2742] bg-[#1A2742] text-white'
              : 'border-[#E5E7EB] bg-white text-[#6B7280]'
          }`}
        >
          <Filter size={16} />
          Filtres
        </button>
      </div>

      {/* Filtres domaine */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
            Domaine d&apos;études
          </p>
          <div className="flex flex-wrap gap-2">
            {DOMAINES.map((d) => (
              <button
                key={d}
                onClick={() => setDomaine(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  domaine === d
                    ? 'bg-[#1A2742] text-white'
                    : 'bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:border-[#1A2742]/40'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={charger} />
      ) : filtres.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#E5E7EB]">
          <p className="text-[#6B7280] text-sm">
            Aucun candidat ne correspond à votre recherche.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtres.map((c) => (
            <Link
              key={c.id}
              href={`/recruteur/candidats/${c.id}`}
              className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-[#1A2742] flex items-center justify-center text-white font-bold shrink-0">
                  {c.prenom?.[0]?.toUpperCase()}
                  {c.nom?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#1A1A1A] truncate">
                    {c.prenom} {c.nom}
                  </p>
                  <p className="text-sm text-[#6B7280] truncate">{c.domaine_etudes}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                  <MapPin size={12} />
                  {c.ville || 'Abidjan'}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                  <GraduationCap size={12} />
                  {c.niveau_etudes || '—'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E9A23B]">
                  <Award size={14} />
                  {c.nb_certificats} certificat{c.nb_certificats !== 1 ? 's' : ''}
                </div>
                <span className="text-xs text-[#1A2742] font-medium">
                  Voir le profil →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
