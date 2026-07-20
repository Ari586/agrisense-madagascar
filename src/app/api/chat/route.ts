import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const SYSTEM_PROMPT = `Tu es "AgriSense", un assistant vocal et textuel expert en agriculture malgache.
L'agriculteur va te poser une question, souvent en malagasy ou en français.
- Réponds de manière TRÈS CONCISE (1 ou 2 paragraphes courts), car ta réponse sera lue.
- Réponds EN MALAGASY (avec termes français si nécessaire).
- Sois très chaleureux et encourageant.
- Ne fais pas de listes à puces trop longues, utilise des phrases simples.`;

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(2_000),
}).strict()

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Le corps de la requête doit être un JSON valide.' },
      { status: 400 }
    )
  }

  const parsedBody = chatRequestSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: 'Le message doit contenir entre 1 et 2 000 caractères.' },
      { status: 400 }
    )
  }

  const { message } = parsedBody.data

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Gemini non configurée sur le serveur.' },
        { status: 500 }
      )
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: message }
    ]);
    
    const responseText = result.response.text();
    return NextResponse.json({ reply: responseText })

  } catch (err) {
    console.error('[/api/chat] Error:', err)
    return NextResponse.json(
      { error: "Tsy afaka mamaly ny IA amin'izao fotoana izao. Andramo indray azafady." },
      { status: 500 }
    )
  }
}