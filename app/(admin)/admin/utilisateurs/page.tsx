import { createClient } from '@/lib/supabase/server'
import { Users, UserCheck, Briefcase, Shield, Search } from 'lucide-react'
import type { Profile } from '@/types/profile'

const roleConfig = {
  apprenant: {
    label: 'Apprenant',
    couleur: 'bg-blue-50 text-blue-700',
    icon: <Users size={12} />,
  },
  recruteur: {
    label: 'Recruteur',
    couleur: 'bg-orange-50 text-orange-700',
    icon: <Briefcase size={12} />,
  },
  admin: {
    label: 'Admin',
    couleur: 'bg-purple-50 text-purple-700',
    icon: <Shield size={12} />,
  },
}

export default async function AdminUtilisateursPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>
}) {
  const { role: roleFilter, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (roleFilter && roleFilter !== 'tous') {
    query = query.eq('role', roleFilter)
  }

  const { data: profiles } = await query
  const tous = (profiles || []) as Profile[]

  // Filtrage texte côté serveur (simple)
  const filtres = q
    ? tous.filter(
        (p) =>
          `${p.prenom} ${p.nom}`.toLowerCase().includes(q.toLowerCase()) ||
          p.domaine_etudes?.toLowerCase().includes(q.toLowerCase())
      )
    : tous

  // Compteurs par rôle
  const counts = {
    apprenant: tous.filter((p) => p.role === 'apprenant').length,
    recruteur: tous.filter((p) => p.role === 'recruteur').length,
    admin: tous.filter((p) => p.role === 'admin').length,
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1A2742]">Utilisateurs</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          {tous.length} utilisateur{tous.length !== 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Résumé rôles */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.entries(counts).map(([role, count]) => {
          const config = roleConfig[role as keyof typeof roleConfig]
          return (
            <a
              key={role}
              href={`?role=${role}`}
              className={`bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4 text-center hover:shadow-md transition-shadow ${
                roleFilter === role ? 'ring-2 ring-[#1A2742]' : ''
              }`}
            >
              <p className="text-2xl font-bold text-[#1A1A1A]">{count}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${config.couleur}`}>
                {config.label}
              </span>
            </a>
          )
        })}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['tous', 'apprenant', 'recruteur', 'admin'].map((r) => (
          <a
            key={r}
            href={`?role=${r}`}
            className={`px-4 py-2 rounded-full text-sm font-medium min-h-[36px] transition-colors ${
              (roleFilter || 'tous') === r
                ? 'bg-[#1A2742] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#1A2742]/40'
            }`}
          >
            {r === 'tous' ? 'Tous' : roleConfig[r as keyof typeof roleConfig]?.label}
          </a>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {filtres.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6B7280] text-sm">Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                    Utilisateur
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide hidden md:table-cell">
                    Domaine
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                    Rôle
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide hidden sm:table-cell">
                    Ville
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide hidden lg:table-cell">
                    Inscrit le
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                    Visible
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filtres.map((p) => {
                  const config = roleConfig[p.role as keyof typeof roleConfig]
                  return (
                    <tr key={p.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1A2742] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {p.prenom?.[0]?.toUpperCase()}
                            {p.nom?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#1A1A1A] truncate">
                              {p.prenom} {p.nom}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#6B7280] hidden md:table-cell">
                        <span className="truncate block max-w-[200px]">
                          {p.domaine_etudes || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config?.couleur}`}>
                          {config?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6B7280] hidden sm:table-cell">
                        {p.ville || 'Abidjan'}
                      </td>
                      <td className="px-4 py-3 text-[#6B7280] hidden lg:table-cell">
                        {new Date(p.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        {p.role === 'apprenant' ? (
                          p.visible_recruteurs ? (
                            <UserCheck size={16} className="text-[#10B981]" />
                          ) : (
                            <span className="text-xs text-[#6B7280]">—</span>
                          )
                        ) : (
                          <span className="text-xs text-[#6B7280]">N/A</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-[#6B7280] mt-3 text-center">
        {filtres.length} résultat{filtres.length !== 1 ? 's' : ''} affiché{filtres.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
