import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Tu es un expert agronome spécialisé dans l'agriculture malgache. Analyse cette photo de plante et identifie:
1. La maladie ou le problème (nom en français et en malagasy si possible)
2. Le niveau de confiance (pourcentage)
3. La sévérité (faible, moyen, élevé, critique)
4. Les symptômes observés
5. Le traitement recommandé (produits accessibles à Madagascar)
6. Les mesures préventives
7. Le nom malagasy de la plante si identifiable

Réponds en JSON valide avec les clés: disease, confidence, severity, symptoms, treatment, prevention, malagasyName`

interface DiagnosisResponse {
  disease: string
  confidence: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  symptoms: string
  treatment: string
  prevention: string
  malagasyName: string
}

const SEVERITY_MAP: Record<string, DiagnosisResponse['severity']> = {
  faible: 'low',
  low: 'low',
  moyen: 'medium',
  medium: 'medium',
  modéré: 'medium',
  moderee: 'medium',
  élevé: 'high',
  eleve: 'high',
  high: 'high',
  grave: 'high',
  critique: 'critical',
  critical: 'critical',
}

function normalizeSeverity(raw: string): DiagnosisResponse['severity'] {
  const lower = raw.toLowerCase().trim()
  for (const [key, value] of Object.entries(SEVERITY_MAP)) {
    if (lower.includes(key)) return value
  }
  return 'medium'
}

function extractJson(text: string): string | null {
  // Try to find a JSON object in the response
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()

  const braceStart = text.indexOf('{')
  const braceEnd = text.lastIndexOf('}')
  if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
    return text.slice(braceStart, braceEnd + 1)
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image } = body

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Le champ "image" est requis (base64 ou data URI).' },
        { status: 400 }
      )
    }

    // Build the data URI — accept both raw base64 and full data URI
    let imageDataUri: string
    if (image.startsWith('data:')) {
      imageDataUri = image
    } else {
      // Default to jpeg if no mime type detectable
      imageDataUri = `data:image/jpeg;base64,${image}`
    }

    // Dynamically import the SDK (backend only)
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const response = await zai.chat.completions.createVision({
      model: 'default',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyse cette photo de plante.' },
            { type: 'image_url', image_url: { url: imageDataUri } },
          ],
        },
      ],
      thinking: { type: 'disabled' } as any,
    } as any)

    const rawContent = response.choices?.[0]?.message?.content
    if (!rawContent) {
      return NextResponse.json(
        { error: "L'IA n'a pas pu générer de diagnostic. Veuillez réessayer." },
        { status: 502 }
      )
    }

    // Parse the VLM response into structured JSON
    const jsonStr = extractJson(rawContent)
    if (!jsonStr) {
      return NextResponse.json(
        { error: 'Réponse invalide du modèle. Veuillez réessayer.' },
        { status: 502 }
      )
    }

    const parsed = JSON.parse(jsonStr) as Record<string, unknown>

    // Normalize and validate fields
    const confidence = typeof parsed.confidence === 'number'
      ? Math.min(100, Math.max(0, Math.round(parsed.confidence)))
      : 50

    const severity = typeof parsed.severity === 'string'
      ? normalizeSeverity(parsed.severity)
      : 'medium'

    const result: DiagnosisResponse = {
      disease: typeof parsed.disease === 'string' ? parsed.disease : 'Inconnu',
      confidence,
      severity,
      symptoms: typeof parsed.symptoms === 'string' ? parsed.symptoms : '',
      treatment: typeof parsed.treatment === 'string' ? parsed.treatment : '',
      prevention: typeof parsed.prevention === 'string' ? parsed.prevention : '',
      malagasyName: typeof parsed.malagasyName === 'string' ? parsed.malagasyName : '',
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/diagnose] Error:', err)

    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Le corps de la requête doit être un JSON valide.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Une erreur interne s'est produite. Veuillez réessayer." },
      { status: 500 }
    )
  }
}