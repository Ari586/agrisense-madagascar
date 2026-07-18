import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Tu es AgriAssist, un assistant IA agricole pour les producteurs malgaches. Tu es expert en:
- Cultures de Madagascar: riz (vary), vanille, café, clou de girofle, litchi, manioc, maïs
- Calendrier agricole malgache et saisons des pluies (novembre-avril)
- Gestion de l'eau et irrigation (sahan-drano, tetikasa fitari-drano)
- Lutte contre les ravageurs et maladies (bibikoka, valala, loza)
- Pratiques agricoles durables et techniques traditionnelles (tavy, horaka)
- Sol et fertilité (tanin-tany, fangaro)
- Commercialisation et prix des produits agricoles sur les marchés locaux

Tu réponds ENTIÈREMENT EN MALAGASY (teny Gasy). Tes conseils doivent être pratiques et accessibles aux petits exploitants familiaux. Tu connais les défis climatiques de Madagascar: cyclones, sécheresse, pluies irrégulières. Tu donnes des réponses concises mais complètes, adaptées au contexte rural malgache. Utilise des exemples concrets et des méthodes à la portée de tous.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Le champ "messages" est requis et doit être un tableau non vide.' },
        { status: 400 }
      )
    }

    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      thinking: { type: 'disabled' },
    })

    const response =
      completion.choices?.[0]?.message?.content ??
      'Miala tsiny, tsy nahazo nomena valiny azafady. Andramo indray.'

    return NextResponse.json({ response })
  } catch (error) {
    console.error('[Chat API] Error:', error)
    return NextResponse.json(
      { response: 'Miala tsiny, nisy olana tamin\'ny server. Andramo indray mety ho lasa.' },
      { status: 200 }
    )
  }
}