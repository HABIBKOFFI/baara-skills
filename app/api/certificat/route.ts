import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { genererNumeroCertificat } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const body = await req.json()
    const { enrollmentId, apprenantId, simulationId, scoreFinal, mention } = body

    if (!enrollmentId || !apprenantId || !simulationId || scoreFinal === undefined || !mention) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Vérifier si un certificat existe déjà pour cet enrollment
    const { data: existingCert } = await supabase
      .from('certificats')
      .select('id')
      .eq('enrollment_id', enrollmentId)
      .single()

    if (existingCert) {
      return NextResponse.json({ success: true, certificatId: existingCert.id })
    }

    const numeroCertificat = genererNumeroCertificat()

    const { data: certificat, error } = await supabase
      .from('certificats')
      .insert({
        apprenant_id: apprenantId,
        simulation_id: simulationId,
        enrollment_id: enrollmentId,
        score_final: scoreFinal,
        mention,
        numero_certificat: numeroCertificat,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, certificatId: certificat.id })
  } catch (err: unknown) {
    console.error('Erreur certificat API:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur interne' },
      { status: 500 }
    )
  }
}
