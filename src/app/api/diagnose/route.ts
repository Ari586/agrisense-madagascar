import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_IMAGE_BASE64_LENGTH = Math.ceil((MAX_IMAGE_BYTES * 4) / 3)
const MAX_REQUEST_BYTES = MAX_IMAGE_BASE64_LENGTH + 1_024
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/
const DATA_URI_PATTERN = /^data:(image\/(?:jpeg|png|webp|heic));base64,([A-Za-z0-9+/]+={0,2})$/

const diagnosisRequestSchema = z.object({
  image: z.string().min(1).max(MAX_IMAGE_BASE64_LENGTH + 128),
}).strict()

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

function parseImage(image: string) {
  const dataUriMatch = image.match(DATA_URI_PATTERN)
  if (dataUriMatch) {
    const [, mimeType, base64Data] = dataUriMatch
    return { base64Data, mimeType }
  }

  if (image.length % 4 === 0 && BASE64_PATTERN.test(image)) {
    return { base64Data: image, mimeType: 'image/jpeg' }
  }

  return null
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { error: 'L’image ne doit pas dépasser 5 Mo.' },
      { status: 413 }
    )
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Le corps de la requête doit être un JSON valide.' },
      { status: 400 }
    )
  }

  const parsedBody = diagnosisRequestSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: 'Le champ "image" doit contenir une image valide.' },
      { status: 400 }
    )
  }

  const imageData = parseImage(parsedBody.data.image)
  if (!imageData) {
    return NextResponse.json(
      { error: 'Formats acceptés : JPEG, PNG, WebP et HEIC encodés en base64.' },
      { status: 400 }
    )
  }

  try {
    const { base64Data, mimeType } = imageData

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

    return NextResponse.json(
      { error: "Une erreur interne s'est produite. Veuillez réessayer." },
      { status: 500 }
    )
  }
}