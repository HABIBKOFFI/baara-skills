import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { moduleId, enrollmentId, contenuTexte } = body

    if (!moduleId || !enrollmentId || !contenuTexte) {
      return NextResponse.json(
        { error: 'Paramètres manquants : moduleId, enrollmentId, contenuTexte requis.' },
        { status: 400 }
      )
    }

    if (typeof contenuTexte !== 'string' || contenuTexte.trim().length < 50) {
      return NextResponse.json(
        { error: 'Le livrable est trop court. Minimum 50 caractères.' },
        { status: 400 }
      )
    }

    // Vérifier que l'enrollment appartient à l'utilisateur
    const { data: enrollment, error: enrError } = await supabase
      .from('enrollments')
      .select('id, apprenant_id, simulation_id')
      .eq('id', enrollmentId)
      .single()

    if (enrError || !enrollment) {
      return NextResponse.json({ error: 'Inscription introuvable.' }, { status: 404 })
    }

    if (enrollment.apprenant_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
    }

    // Vérifier qu'une soumission n'existe pas déjà pour ce module/enrollment
    const { data: existante } = await supabase
      .from('submissions')
      .select('id, statut')
      .eq('apprenant_id', user.id)
      .eq('module_id', moduleId)
      .eq('enrollment_id', enrollmentId)
      .maybeSingle()

    if (existante && existante.statut === 'evalue') {
      return NextResponse.json(
        { error: 'Ce module a déjà été évalué.' },
        { status: 409 }
      )
    }

    // Rate limit : max 5 soumissions par jour
    const debutJournee = new Date()
    debutJournee.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('apprenant_id', user.id)
      .gte('submitted_at', debutJournee.toISOString())

    if ((count || 0) >= 5) {
      return NextResponse.json(
        {
          error:
            'Tu as atteint la limite de 5 soumissions par jour. Réessaie demain !',
        },
        { status: 429 }
      )
    }

    // Créer la soumission
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .insert({
        apprenant_id: user.id,
        module_id: moduleId,
        enrollment_id: enrollmentId,
        contenu_texte: contenuTexte.trim(),
        statut: 'en_attente',
      })
      .select()
      .single()

    if (subError) throw subError

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
    })
  } catch (err: unknown) {
    console.error('Erreur submit API:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur interne' },
      { status: 500 }
    )
  }
}
