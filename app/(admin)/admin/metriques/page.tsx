import { createClient } from '@/lib/supabase/server'
import { Users, Award, BookOpen, TrendingUp, Star, Clock } from 'lucide-react'

interface StatBoxProps {
  label: string
  value: number | string
  sub?: string
  icon: React.ReactNode
  couleur: string
}

function StatBox({ label, value, sub, icon, couleur }: StatBoxProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${couleur}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-[#1A1A1A]">{value}</p>
      {sub && <p className="text-xs text-[#6B7280] mt-0.5">{sub}</p>}
      <p className="text-sm text-[#6B7280] mt-1">{label}</p>
    </div>
  )
}

export default async function MetriquesPage() {
  const supabase = await createClient()

  const [
    { count: totalApprenants },
    { count: totalRecruteurs },
    { count: totalEnrollments },
    { count: totalComplete },
    { count: totalCertificats },
    { count: totalSubmissions },
    { data: feedbacksData },
    { data: simulationsData },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'apprenant'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'recruteur'),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('statut', 'complete'),
    supabase.from('certificats').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }),
    supabase.from('feedbacks').select('score_global, mention'),
    supabase.from('simulations').select('id, titre, slug').eq('actif', true),
  ])

  const tauxCompletion =
    totalEnrollments && totalComplete
      ? Math.round(((totalComplete || 0) / (totalEnrollments || 1)) * 100)
      : 0

  const scoreMoyen =
    feedbacksData && feedbacksData.length > 0
      ? Math.round(
          feedbacksData.reduce((acc: number, f: { score_global: number }) => acc + f.score_global, 0) /
            feedbacksData.length
        )
      : 0

  // Répartition mentions
  const mentionCount = new Map<string, number>()
  feedbacksData?.forEach((f: { mention: string }) => {
    mentionCount.set(f.mention, (mentionCount.get(f.mention) || 0) + 1)
  })
  const mentions = ['Excellent', 'Très bien', 'Bien', 'Satisfaisant', 'Insuffisant']
  const mentionColors: Record<string, string> = {
    Excellent: 'bg-purple-500',
    'Très bien': 'bg-green-500',
    Bien: 'bg-blue-500',
    Satisfaisant: 'bg-yellow-500',
    Insuffisant: 'bg-red-500',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1A2742]">Métriques BAARA</h1>
        <p className="text-[#6B7280] text-sm mt-1">Vue d&apos;ensemble de la plateforme.</p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatBox
          label="Apprenants inscrits"
          value={totalApprenants || 0}
          icon={<Users size={20} className="text-[#1A2742]" />}
          couleur="bg-blue-50"
        />
        <StatBox
          label="Simulations lancées"
          value={totalEnrollments || 0}
          icon={<BookOpen size={20} className="text-[#E9A23B]" />}
          couleur="bg-orange-50"
        />
        <StatBox
          label="Certifications délivrées"
          value={totalCertificats || 0}
          icon={<Award size={20} className="text-[#10B981]" />}
          couleur="bg-green-50"
        />
        <StatBox
          label="Taux de complétion"
          value={`${tauxCompletion}%`}
          sub={`${totalComplete || 0} / ${totalEnrollments || 0} terminées`}
          icon={<TrendingUp size={20} className="text-purple-600" />}
          couleur="bg-purple-50"
        />
        <StatBox
          label="Score moyen IA"
          value={scoreMoyen ? `${scoreMoyen}/100` : '—'}
          sub={`Sur ${feedbacksData?.length || 0} évaluations`}
          icon={<Star size={20} className="text-yellow-500" />}
          couleur="bg-yellow-50"
        />
        <StatBox
          label="Recruteurs inscrits"
          value={totalRecruteurs || 0}
          icon={<Users size={20} className="text-[#6B7280]" />}
          couleur="bg-gray-50"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Répartition mentions */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
          <h2 className="font-bold text-[18px] text-[#1A2742] mb-4">
            Répartition des mentions
          </h2>
          {(feedbacksData?.length || 0) === 0 ? (
            <p className="text-sm text-[#6B7280] py-4 text-center">Aucune donnée.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {mentions.map((mention) => {
                const count = mentionCount.get(mention) || 0
                const pct = Math.round((count / (feedbacksData?.length || 1)) * 100)
                return (
                  <div key={mention}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#1A1A1A] font-medium">{mention}</span>
                      <span className="text-[#6B7280]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-[#F8F9FA] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${mentionColors[mention]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Simulations actives */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
          <h2 className="font-bold text-[18px] text-[#1A2742] mb-4">
            Simulations actives ({simulationsData?.length || 0})
          </h2>
          {simulationsData && simulationsData.length > 0 ? (
            <div className="flex flex-col gap-2">
              {simulationsData.map((sim: { id: string; titre: string; slug: string }) => (
                <div
                  key={sim.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#F8F9FA]"
                >
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{sim.titre}</p>
                  <span className="text-xs text-[#6B7280] font-mono shrink-0 ml-2">
                    {sim.slug}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B7280] py-4 text-center">Aucune simulation active.</p>
          )}

          {/* Soumissions totales */}
          <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex items-center gap-2 text-sm text-[#6B7280]">
            <Clock size={14} />
            <span>
              <strong className="text-[#1A1A1A]">{totalSubmissions || 0}</strong> livrables soumis au total
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
