import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Tu es un expert agronome malgache. Analyse la photo fournie (plante, champ, sol, maladie) et réponds ENTIÈREMENT EN MALAGASY (avec les termes techniques ou noms en français entre parenthèses).

Directives d'analyse :
Si c'est une plante malade :
- disease : Nom de la maladie
- severity : 'low' (faible), 'medium', 'high', 'critical'
- symptoms : Les symptômes observés
- treatment : Le traitement recommandé
- prevention : Les mesures préventives

Si c'est une plante saine ou une culture :
- disease : Nom de la plante/culture
- severity : 'low' (qui s'affichera comme "Azo ekena" / Bon état)
- symptoms : État de santé, stade de croissance
- treatment : Conseils d'entretien (engrais, arrosage)
- prevention : Bonnes pratiques agricoles

Si c'est un sol ou un terrain :
- disease : Type de sol ou terrain
- severity : 'low' (si bon pour culture) ou 'medium'/'high' (si aride/pauvre)
- symptoms : Caractéristiques du sol observées
- treatment : Cultures recommandées pour ce type de terrain
- prevention : Comment améliorer ou préparer ce sol

Dans tous les cas :
Réponds en JSON valide avec EXACTEMENT ces clés: { "disease": "", "confidence": 0-100, "severity": "low|medium|high|critical", "symptoms": "", "treatment": "", "prevention": "", "malagasyName": "" }`

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

    let base64Data = image;
    let mimeType = 'image/jpeg';
    if (image.startsWith('data:')) {
      const parts = image.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) {
         mimeType = match[1];
      }
      base64Data = parts[1];
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Gemini non configurée sur le serveur. Veuillez ajouter GEMINI_API_KEY.' },
        { status: 500 }
      )
    }

    // Dynamic import to avoid edge runtime issues if any
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType
      }
    };

    const apiResult = await model.generateContent([SYSTEM_PROMPT, imagePart]);
    const responseText = apiResult.response.text();
    
    const jsonStr = extractJson(responseText);
    if (!jsonStr) {
       throw new Error("L'IA n'a pas renvoyé de JSON valide: " + responseText);
    }
    
    const parsed = JSON.parse(jsonStr) as DiagnosisResponse;
    parsed.severity = normalizeSeverity(parsed.severity);

    return NextResponse.json(parsed)
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