export type UserRole = 'apprenant' | 'recruteur' | 'admin'

export interface Profile {
  id: string
  role: UserRole
  prenom: string
  nom: string
  ville: string
  domaine_etudes: string | null
  niveau_etudes: string | null
  photo_url: string | null
  linkedin_url: string | null
  visible_recruteurs: boolean
  created_at: string
}
