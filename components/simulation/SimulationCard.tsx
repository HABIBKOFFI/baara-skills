import Link from 'next/link'
import { Clock, Building2, ChevronRight, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Simulation } from '@/types/simulation'
import type { Enrollment } from '@/types/simulation'

interface SimulationCardProps {
  simulation: Simulation
  enrollment?: Enrollment | null
}

const niveauColors = {
  Débutant: 'bg-green-50 text-green-700',
  Intermédiaire: 'bg-orange-50 text-orange-700',
  Avancé: 'bg-red-50 text-red-700',
}

export default function SimulationCard({ simulation, enrollment }: SimulationCardProps) {
  const estComplete = enrollment?.statut === 'complete'
  const enCours = enrollment?.statut === 'en_cours'

  return (
    <Link
      href={`/simulation/${simulation.id}`}
      className="block bg-white rounded-xl p-4 shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#1A1A1A] text-[18px] leading-snug mb-1 truncate">
            {simulation.titre}
          </h3>
          <div className="flex items-center gap-1.5 text-[#6B7280] text-sm">
            <Building2 size={14} />
            <span>{simulation.entreprise_partenaire}</span>
          </div>
        </div>
        {estComplete && (
          <div className="shrink-0">
            <CheckCircle size={22} className="text-[#10B981]" />
          </div>
        )}
      </div>

      <p className="text-[#6B7280] text-sm line-clamp-2 mb-4">
        {simulation.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-full',
              niveauColors[simulation.niveau]
            )}
          >
            {simulation.niveau}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#6B7280]">
            <Clock size={12} />
            {simulation.duree_heures}h
          </span>
          {enCours && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
              En cours
            </span>
          )}
          {estComplete && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">
              Terminé
            </span>
          )}
        </div>
        <ChevronRight size={18} className="text-[#6B7280]" />
      </div>
    </Link>
  )
}
