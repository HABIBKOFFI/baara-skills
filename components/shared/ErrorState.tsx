import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({
  message = 'Une erreur est survenue. Veuillez réessayer.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-[#EF4444]" />
      </div>
      <p className="text-[#1A1A1A] font-semibold mb-1">Oops !</p>
      <p className="text-[#6B7280] text-sm mb-6 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-[#1A2742] text-white px-5 py-2.5 rounded-lg text-sm font-medium min-h-[44px] hover:bg-[#1A2742]/90 transition-colors"
        >
          <RefreshCw size={16} />
          Réessayer
        </button>
      )}
    </div>
  )
}
