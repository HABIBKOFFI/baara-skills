import { cn } from '@/lib/utils'
import { CheckCircle, Circle, Lock } from 'lucide-react'
import type { Module } from '@/types/simulation'

interface ModuleNavProps {
  modules: Module[]
  moduleActuelId: string | null
  modulesCompletes: string[]
  onSelectModule?: (moduleId: string) => void
}

const typeLabels = {
  decouverte: 'Découverte',
  analyse: 'Analyse',
  production: 'Production',
  presentation: 'Présentation',
}

export default function ModuleNav({
  modules,
  moduleActuelId,
  modulesCompletes,
  onSelectModule,
}: ModuleNavProps) {
  return (
    <div className="flex flex-col gap-2">
      {modules.map((module, index) => {
        const estComplete = modulesCompletes.includes(module.id)
        const estActuel = module.id === moduleActuelId
        const estDebloque = index === 0 || modulesCompletes.includes(modules[index - 1].id)

        return (
          <button
            key={module.id}
            onClick={() => estDebloque && onSelectModule?.(module.id)}
            disabled={!estDebloque}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg text-left transition-colors min-h-[44px]',
              estActuel && 'bg-[#1A2742] text-white',
              !estActuel && estDebloque && 'hover:bg-gray-50 text-[#1A1A1A]',
              !estDebloque && 'opacity-40 cursor-not-allowed text-[#6B7280]'
            )}
          >
            <div className="shrink-0">
              {estComplete ? (
                <CheckCircle size={18} className={estActuel ? 'text-[#E9A23B]' : 'text-[#10B981]'} />
              ) : estDebloque ? (
                <Circle size={18} className={estActuel ? 'text-white/70' : 'text-[#6B7280]'} />
              ) : (
                <Lock size={18} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium opacity-70">
                {typeLabels[module.type]}
              </p>
              <p className="text-sm font-medium truncate">{module.titre}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
