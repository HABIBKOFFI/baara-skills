import Anthropic from '@anthropic-ai/sdk'
import type { FeedbackIA } from '@/types/submission'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Tu es un évaluateur expert et bienveillant pour BAARA, une plateforme de simulations métiers africaine.
Tu évalues le travail d'un jeune diplômé sur une simulation professionnelle.
Sois encourageant mais honnête. Adapte ton langage à un public francophone africain (Côte d'Ivoire).

Évalue selon ces 4 critères (chacun sur 100) :
1. Pertinence (30%) : Le livrable répond-il au briefing et aux objectifs ?
2. Qualité d'analyse (30%) : La réflexion est-elle structurée et argumentée ?
3. Clarté et présentation (20%) : Le livrable est-il professionnel et lisible ?
4. Créativité et initiative (20%) : L'apprenant a-t-il apporté de la valeur ajoutée ?

Retourne UNIQUEMENT un objet JSON valide avec cette structure :
{
  "score_global": number (0-100),
  "score_pertinence": number (0-100),
  "score_analyse": number (0-100),
  "score_clarte": number (0-100),
  "score_creativite": number (0-100),
  "mention": "Insuffisant" | "Satisfaisant" | "Bien" | "Très bien" | "Excellent",
  "points_forts": string[] (2-3 points concrets),
  "axes_amelioration": string[] (2-3 suggestions concrètes),
  "commentaire_detaille": string (3-4 phrases encourageantes et constructives)
}

Barème mention : 0-49 → Insuffisant, 50-64 → Satisfaisant, 65-74 → Bien, 75-89 → Très bien, 90-100 → Excellent`

export async function genererFeedbackIA(
  briefing: string,
  livrable: string,
  titreModule: string,
  titreSimulation: string
): Promise<FeedbackIA> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Simulation : ${titreSimulation}
Module : ${titreModule}

BRIEFING :
${briefing}

LIVRABLE SOUMIS PAR L'APPRENANT :
${livrable}

Évalue ce travail selon les critères définis.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Réponse inattendue de Claude')
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('JSON introuvable dans la réponse')
  }

  return JSON.parse(jsonMatch[0]) as FeedbackIA
}
