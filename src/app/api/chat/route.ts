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

    const lastMessage = messages[messages.length - 1].content.toLowerCase()

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500))

    let response = "Miarahaba! Izaho dia AgriAssist, mpanampy anao amin'ny fambolena. Inona no azoko hanampiana anao anio?"

    if (lastMessage.includes("vary") || lastMessage.includes("aretina mety mahazo ny vary")) {
      response = "Ny vary dia matetika mety ho voan'ny aretina 'Piriculariose' (vokatry ny holatra) na ny 'Mildiou'. Ny tsara indrindra dia ny fampiasana masomboly voafantina tsara, ny fitantanana ny rano anaty tanimbary, ary ny fanasarahana ny fambolena. Azo ampiasaina ihany koa ny zezika voajanahary mba hanatanjahana ny taho."
    } else if (lastMessage.includes("voly tsara") || lastMessage.includes("vanim-potoana")) {
      response = "Amin'izao vanim-potoana ririnina na maintany izao, ny voly tsara atao dia ny tsaramaso, ny ovy, ary ny anana samihafa (legioma). Raha any amin'ny faritra misy rano kosa dia tsara ny manohy ny voly avotra na manomana ny ketsa ho an'ny vary asara."
    } else if (lastMessage.includes("voanjo")) {
      response = "Mba hitsaboana ny aretin'ny voanjo (toy ny fahalovàn'ny faka na ny aretin-dravina), mila miala amin'ny fambolena voanjo eo amin'ilay tany mitovy in-droa miantoana (rotation des cultures). Fafazo lavenona kely ny tany alohan'ny hambolena mba hamonoana ny bakteria ratsy."
    } else if (lastMessage.includes("orana") || lastMessage.includes("toetrandro")) {
      response = "Arakaraka ny toerana misy anao eto Madagasikara izany. Fa amin'ny ankapobeny, tsara hatrany ny manaraka ny toetrandro isam-paritra eto amin'ny AgriSense alohan'ny hanombohana ny famafazana."
    } else if (messages.length > 1) {
      response = "Aza misalasala manontany ahy raha mila fanazavana fanampiny momba ny fambolena, ny fitsaboana zavamaniry na ny toetrandro ianao. Eto aho hanampy ny tantsaha Malagasy!"
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('[Chat API] Error:', error)
    return NextResponse.json(
      { response: 'Miala tsiny, nisy olana tamin\'ny fifandraisana. Azafady, andramo indray.' },
      { status: 200 }
    )
  }
}