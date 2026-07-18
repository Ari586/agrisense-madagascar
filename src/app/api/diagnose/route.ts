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

    // Simulate AI processing delay (2 to 3 seconds) for the Vercel demo
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    
    const mockDiagnoses: DiagnosisResponse[] = [
      {
        disease: 'Mildiou (Aretin-dravina)',
        confidence: 92,
        severity: 'high',
        symptoms: 'Taches brunes sur les feuilles avec un léger duvet blanc en dessous (Misy pentina mivolontsôkôlà ny ravina).',
        treatment: 'Appliquer un fongicide à base de cuivre (bouillie bordelaise). Retirer et brûler les feuilles malades.',
        prevention: 'Espacer les plants pour une bonne aération. Éviter d\'arroser les feuilles (Aza tondrahana ny ravina).',
        malagasyName: 'Aretin-dravina (Mildiou)',
      },
      {
        disease: 'Déficience en azote (Tsy ampy sakafo ny tany)',
        confidence: 88,
        severity: 'medium',
        symptoms: 'Jaunissement des feuilles (Mavo ny ravina), croissance ralentie de la plante.',
        treatment: 'Appliquer un engrais riche en azote comme l\'urée ou utiliser du fumier/compost (zezika).',
        prevention: 'Pratiquer la rotation des cultures avec des légumineuses comme le haricot (tsaramaso) pour enrichir le sol.',
        malagasyName: 'Tany mahantra (Tsy ampy Azote)',
      },
      {
        disease: 'Chenille légionnaire (Fango / Olitra)',
        confidence: 95,
        severity: 'critical',
        symptoms: 'Feuilles grignotées avec de gros trous (Ravina voakaikitra). Présence de déjections (tain\'olitra).',
        treatment: 'Utiliser un insecticide naturel à base de Neem ou un traitement chimique ciblé si l\'infestation est massive.',
        prevention: 'Désherber régulièrement autour des cultures. Inspecter le cœur des plantes tôt le matin.',
        malagasyName: 'Olitra mpanimba voly',
      }
    ];

    const result = mockDiagnoses[Math.floor(Math.random() * mockDiagnoses.length)];

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