'use client'

import { useState, useTransition } from 'react'
import { toggleSimulationActif } from './actions'

interface Props {
  simulationId: string
  actif: boolean
}

export default function ToggleSimulationButton({ simulationId, actif }: Props) {
  const [isPending, startTransition] = useTransition()
  const [erreur, setErreur] = useState<string | null>(null)

  function handleToggle() {
    setErreur(null)
    startTransition(async () => {
      try {
        await toggleSimulationActif(simulationId, actif)
      } catch (err: unknown) {
        setErreur(err instanceof Error ? err.message : 'Erreur interne')
      }
    })
  }

  return (
    <div>
      <button
        onClick={handleToggle}
        disabled={isPending}
        aria-busy={isPending}
        aria-label={actif ? 'Désactiver cette simulation' : 'Activer cette simulation'}
        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors min-h-[36px] disabled:opacity-60 disabled:cursor-not-allowed ${
          actif
            ? 'text-red-600 border-red-200 hover:bg-red-50'
            : 'text-green-700 border-green-200 hover:bg-green-50'
        }`}
      >
        {isPending ? '…' : actif ? 'Désactiver' : 'Activer'}
      </button>
      {erreur && (
        <p role="alert" className="text-xs text-red-600 mt-1">
          {erreur}
        </p>
      )}
    </div>
  )
}
