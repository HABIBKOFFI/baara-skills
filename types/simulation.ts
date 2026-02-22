export type NiveauSimulation = 'Débutant' | 'Intermédiaire' | 'Avancé'
export type TypeModule = 'decouverte' | 'analyse' | 'production' | 'presentation'
export type StatutEnrollment = 'en_cours' | 'complete' | 'abandonne'

export interface Simulation {
  id: string
  slug: string
  titre: string
  description: string
  entreprise_partenaire: string
  logo_entreprise_url: string | null
  duree_heures: number
  niveau: NiveauSimulation
  domaine: string
  actif: boolean
  ordre: number
  created_at: string
}

export interface Ressource {
  titre: string
  url: string
  type: 'pdf' | 'lien' | 'video'
}

export interface CritereEvaluation {
  nom: string
  description: string
  poids: number
}

export interface Module {
  id: string
  simulation_id: string
  titre: string
  description: string
  ordre: number
  type: TypeModule
  briefing_contenu: string
  ressources: Ressource[]
  criteres_evaluation: CritereEvaluation[]
}

export interface Enrollment {
  id: string
  apprenant_id: string
  simulation_id: string
  statut: StatutEnrollment
  module_actuel_id: string | null
  score_global: number | null
  started_at: string
  completed_at: string | null
}

export interface SimulationWithModules extends Simulation {
  modules: Module[]
}
