import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Mention } from '@/types/submission'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMentionColor(mention: Mention): string {
  const colors: Record<Mention, string> = {
    Insuffisant: 'text-red-500 bg-red-50',
    Satisfaisant: 'text-yellow-600 bg-yellow-50',
    Bien: 'text-blue-600 bg-blue-50',
    'Très bien': 'text-green-600 bg-green-50',
    Excellent: 'text-purple-600 bg-purple-50',
  }
  return colors[mention]
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-purple-600'
  if (score >= 75) return 'text-green-600'
  if (score >= 65) return 'text-blue-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-500'
}

export function formatDuree(heures: number): string {
  if (heures === 1) return '1 heure'
  return `${heures} heures`
}

export function genererNumeroCertificat(): string {
  const date = new Date()
  const year = date.getFullYear()
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `BAARA-${year}-${rand}`
}
