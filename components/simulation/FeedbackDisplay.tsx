import { CheckCircle, TrendingUp, Star } from 'lucide-react'
import { cn, getMentionColor, getScoreColor } from '@/lib/utils'
import type { Feedback } from '@/types/submission'

interface FeedbackDisplayProps {
  feedback: Feedback
}

interface ScoreBarProps {
  label: string
  score: number
  poids: string
}

function ScoreBar({ label, score, poids }: ScoreBarProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-[#6B7280]">
          {label} <span className="text-xs">({poids})</span>
        </span>
        <span className={cn('text-sm font-semibold', getScoreColor(score))}>
          {score}/100
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${score}%`,
            backgroundColor:
              score >= 75
                ? '#10B981'
                : score >= 50
                ? '#E9A23B'
                : '#EF4444',
          }}
        />
      </div>
    </div>
  )
}

export default function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Score global */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E7EB] text-center">
        <p className="text-[#6B7280] text-sm mb-2">Score global</p>
        <p
          className={cn(
            'text-6xl font-bold mb-2',
            getScoreColor(feedback.score_global)
          )}
        >
          {feedback.score_global}
        </p>
        <span
          className={cn(
            'inline-block text-sm font-semibold px-3 py-1 rounded-full',
            getMentionColor(feedback.mention)
          )}
        >
          {feedback.mention}
        </span>
      </div>

      {/* Détail scores */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E5E7EB]">
        <h3 className="font-semibold text-[18px] mb-4">Détail de l&apos;évaluation</h3>
        <div className="flex flex-col gap-4">
          <ScoreBar label="Pertinence" score={feedback.score_pertinence} poids="30%" />
          <ScoreBar label="Qualité d'analyse" score={feedback.score_analyse} poids="30%" />
          <ScoreBar label="Clarté & présentation" score={feedback.score_clarte} poids="20%" />
          <ScoreBar label="Créativité" score={feedback.score_creativite} poids="20%" />
        </div>
      </div>

      {/* Commentaire */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-3">
          <Star size={18} className="text-[#E9A23B]" />
          <h3 className="font-semibold text-[18px]">Commentaire de l&apos;évaluateur</h3>
        </div>
        <p className="text-[#1A1A1A] text-sm leading-relaxed">
          {feedback.commentaire_detaille}
        </p>
      </div>

      {/* Points forts */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle size={18} className="text-[#10B981]" />
          <h3 className="font-semibold text-[18px]">Points forts</h3>
        </div>
        <ul className="flex flex-col gap-2">
          {feedback.points_forts.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#1A1A1A]">
              <span className="text-[#10B981] mt-0.5">✓</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Axes d'amélioration */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-[#E9A23B]" />
          <h3 className="font-semibold text-[18px]">Axes d&apos;amélioration</h3>
        </div>
        <ul className="flex flex-col gap-2">
          {feedback.axes_amelioration.map((axe, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#1A1A1A]">
              <span className="text-[#E9A23B] mt-0.5">→</span>
              {axe}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
