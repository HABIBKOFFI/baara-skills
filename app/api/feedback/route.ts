import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { genererFeedbackIA } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const { submissionId, briefing, livrable, titreModule, titreSimulation } = body

    if (!submissionId || !briefing || !livrable || !titreModule || !titreSimulation) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Vérifier que la submission appartient à l'utilisateur
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .select('id, apprenant_id, module_id, enrollment_id')
      .eq('id', submissionId)
      .single()

    if (subError || !submission) {
      return NextResponse.json({ error: 'Soumission introuvable' }, { status: 404 })
    }

    if (submission.apprenant_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Générer le feedback via Claude (timeout 30s)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    let feedbackIA
    try {
      feedbackIA = await genererFeedbackIA(
        briefing,
        livrable,
        titreModule,
        titreSimulation
      )
    } finally {
      clearTimeout(timeout)
    }

    // Sauvegarder le feedback en base
    const { data: feedback, error: fbError } = await supabase
      .from('feedbacks')
      .insert({
        submission_id: submissionId,
        score_global: feedbackIA.score_global,
        score_pertinence: feedbackIA.score_pertinence,
        score_analyse: feedbackIA.score_analyse,
        score_clarte: feedbackIA.score_clarte,
        score_creativite: feedbackIA.score_creativite,
        mention: feedbackIA.mention,
        points_forts: feedbackIA.points_forts,
        axes_amelioration: feedbackIA.axes_amelioration,
        commentaire_detaille: feedbackIA.commentaire_detaille,
      })
      .select()
      .single()

    if (fbError) throw fbError

    // Mettre à jour le statut de la submission
    await supabase
      .from('submissions')
      .update({ statut: 'evalue' })
      .eq('id', submissionId)

    // Mettre à jour l'enrollment (avancer au module suivant ou compléter)
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('simulation_id')
      .eq('id', submission.enrollment_id)
      .single()

    if (enrollment) {
      const { data: modules } = await supabase
        .from('modules')
        .select('id, ordre')
        .eq('simulation_id', enrollment.simulation_id)
        .order('ordre')

      const moduleActuelIndex = modules?.findIndex(
        (m: { id: string }) => m.id === submission.module_id
      )
      const modulesSorted = modules || []

      if (
        moduleActuelIndex !== undefined &&
        moduleActuelIndex < modulesSorted.length - 1
      ) {
        // Passer au module suivant
        await supabase
          .from('enrollments')
          .update({ module_actuel_id: modulesSorted[moduleActuelIndex + 1].id })
          .eq('id', submission.enrollment_id)
      } else {
        // Dernière module — simulation complète
        await supabase
          .from('enrollments')
          .update({
            statut: 'complete',
            score_global: feedbackIA.score_global,
            completed_at: new Date().toISOString(),
          })
          .eq('id', submission.enrollment_id)

        // Générer le certificat
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/certificat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentId: submission.enrollment_id,
            apprenantId: user.id,
            simulationId: enrollment.simulation_id,
            scoreFinal: feedbackIA.score_global,
            mention: feedbackIA.mention,
          }),
        })
      }
    }

    return NextResponse.json({ success: true, feedbackId: feedback.id })
  } catch (err: unknown) {
    console.error('Erreur feedback API:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur interne' },
      { status: 500 }
    )
  }
}
