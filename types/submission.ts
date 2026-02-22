export type StatutSubmission = 'en_attente' | 'evalue'
export type Mention = 'Insuffisant' | 'Satisfaisant' | 'Bien' | 'Très bien' | 'Excellent'

export interface Submission {
  id: string
  apprenant_id: string
  module_id: string
  enrollment_id: string
  contenu_texte: string | null
  fichiers_urls: string[]
  statut: StatutSubmission
  submitted_at: string
}

export interface Feedback {
  id: string
  submission_id: string
  score_global: number
  score_pertinence: number
  score_analyse: number
  score_clarte: number
  score_creativite: number
  mention: Mention
  points_forts: string[]
  axes_amelioration: string[]
  commentaire_detaille: string
  generated_at: string
}

export interface Certificat {
  id: string
  apprenant_id: string
  simulation_id: string
  enrollment_id: string
  score_final: number
  mention: Mention
  pdf_url: string | null
  numero_certificat: string
  issued_at: string
}

export interface FeedbackIA {
  score_global: number
  score_pertinence: number
  score_analyse: number
  score_clarte: number
  score_creativite: number
  mention: Mention
  points_forts: string[]
  axes_amelioration: string[]
  commentaire_detaille: string
}
