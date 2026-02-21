import { createClient } from '@/lib/supabase/server'
import { Users, Award, TrendingUp, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  couleur: string
}

function StatCard({ label, value, icon, couleur }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${couleur}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1A1A1A]">{value}</p>
        <p className="text-sm text-[#6B7280]">{label}</p>
      </div>
    </div>
  )
}

export default async function RecruteurDashboard() {
  const supabase = await createClient()

  // Stats globales
  const [
    { count: totalCandidats },
    { count: totalCertificats },
    { data: topSimulations },
    { data: derniersCandidats },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'apprenant')
      .eq('visible_recruteurs', true),
    supabase
      .from('certificats')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('enrollments')
      .select('simulation_id, simulations(titre)')
      .eq('statut', 'complete')
      .limit(5),
    supabase
      .from('profiles')
      .select('id, prenom, nom, domaine_etudes, niveau_etudes, created_at')
      .eq('role', 'apprenant')
      .eq('visible_recruteurs', true)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Compter les complétions par simulation
  const simCount = new Map<string, { titre: string; count: number }>()
  topSimulations?.forEach((e: { simulation_id: string; simulations: { titre: string } | null }) => {
    const key = e.simulation_id
    const titre = e.simulations?.titre || 'Inconnu'
    simCount.set(key, { titre, count: (simCount.get(key)?.count || 0) + 1 })
  })
  const topSims = Array.from(simCount.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1A2742]">Dashboard Recruteur</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Découvrez les talents certifiés sur BAARA Skills.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard
          label="Candidats visibles"
          value={totalCandidats || 0}
          icon={<Users size={22} className="text-[#1A2742]" />}
          couleur="bg-blue-50"
        />
        <StatCard
          label="Certificats délivrés"
          value={totalCertificats || 0}
          icon={<Award size={22} className="text-[#E9A23B]" />}
          couleur="bg-orange-50"
        />
        <StatCard
          label="Simulations actives"
          value={topSims.length}
          icon={<BookOpen size={22} className="text-[#10B981]" />}
          couleur="bg-green-50"
        />
        <StatCard
          label="Taux de complétion"
          value={totalCertificats && totalCandidats ? `${Math.round(((totalCertificats || 0) / ((totalCandidats || 1))) * 100)}%` : '—'}
          icon={<TrendingUp size={22} className="text-purple-600" />}
          couleur="bg-purple-50"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Derniers candidats */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[18px] text-[#1A2742]">Nouveaux candidats</h2>
            <Link
              href="/recruteur/candidats"
              className="text-sm text-[#E9A23B] font-medium hover:underline"
            >
              Voir tous →
            </Link>
          </div>
          {derniersCandidats && derniersCandidats.length > 0 ? (
            <div className="flex flex-col gap-3">
              {derniersCandidats.map((c) => (
                <Link
                  key={c.id}
                  href={`/recruteur/candidats/${c.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F8F9FA] transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#1A2742] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {(c.prenom as string)?.[0]?.toUpperCase()}
                    {(c.nom as string)?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-[#1A1A1A] truncate">
                      {c.prenom as string} {c.nom as string}
                    </p>
                    <p className="text-xs text-[#6B7280] truncate">{c.domaine_etudes as string}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B7280] py-4 text-center">
              Aucun candidat visible pour l&apos;instant.
            </p>
          )}
        </div>

        {/* Top simulations */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
          <h2 className="font-bold text-[18px] text-[#1A2742] mb-4">Simulations populaires</h2>
          {topSims.length > 0 ? (
            <div className="flex flex-col gap-3">
              {topSims.map((sim, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center text-xs font-bold text-[#6B7280]">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{sim.titre}</p>
                    <div className="h-1.5 bg-[#F8F9FA] rounded-full mt-1.5">
                      <div
                        className="h-full bg-[#E9A23B] rounded-full"
                        style={{ width: `${Math.min((sim.count / (topSims[0]?.count || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#6B7280] shrink-0">
                    {sim.count} certif.
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B7280] py-4 text-center">
              Aucune donnée disponible.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
