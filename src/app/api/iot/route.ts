import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { z } from 'zod';

// Base de données simulée en mémoire (À remplacer par Supabase, Firebase ou PostgreSQL en production)
let latestSensorData = {
  deviceId: "CAPTEUR_VAKINANKARATRA_01",
  soilMoisture: 65, // Pourcentage d'humidité
  temperature: 24, // Température au sol
  lastUpdated: new Date().toISOString(),
};

const sensorReadingSchema = z.object({
  deviceId: z.string().trim().min(1).max(100).optional(),
  soilMoisture: z.number().finite().min(0).max(100),
  temperature: z.number().finite().min(-20).max(80).optional(),
}).strict();

// POST : Le capteur IoT (ex: Arduino, ESP32) envoie ses données ici via GSM/Wi-Fi
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Le corps de la requête doit être un JSON valide." },
      { status: 400 }
    );
  }

  const parsedBody = sensorReadingSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { success: false, error: "Mesures invalides. L'humidité doit être comprise entre 0 et 100%." },
      { status: 400 }
    );
  }

  const { deviceId, soilMoisture, temperature } = parsedBody.data;

  try {
    
    // Le capteur doit envoyer : { "deviceId": "...", "soilMoisture": 28, "temperature": 24 }
    latestSensorData.soilMoisture = soilMoisture;
    if (temperature !== undefined) latestSensorData.temperature = temperature;
    latestSensorData.lastUpdated = new Date().toISOString();
    latestSensorData.deviceId = deviceId || latestSensorData.deviceId;
      
    let smsSent = false;
    let alertMessage = "";

    // LOGIQUE D'ALERTE SMS
    // Si l'humidité descend en dessous de 30%, on déclenche une alerte
    if (soilMoisture < 30) {
      alertMessage = `Fampitandremana: Maina loatra ny tany (${soilMoisture}%). Mila tondrahana haingana ny voly.`;
        
      console.log(`[ALERTE SMS DÉCLENCHÉE] Tentative d'envoi...`);
      console.log(`[MESSAGE] ${alertMessage}`);

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      const toNumber = process.env.USER_PHONE_NUMBER;

      if (accountSid && authToken && fromNumber && toNumber) {
        try {
          const client = twilio(accountSid, authToken);
          const message = await client.messages.create({
            body: alertMessage,
            from: fromNumber,
            to: toNumber
          });
          console.log(`[SMS ENVOYÉ AVEC SUCCÈS] SID: ${message.sid}`);
          smsSent = true;
        } catch (twilioError) {
          console.error('[ERREUR TWILIO]', twilioError);
        }
      } else {
        console.warn("[ATTENTION] Les clés Twilio ne sont pas configurées. Le SMS n'a pas été réellement envoyé.");
      }
    }

    return NextResponse.json({
      success: true,
      message: "Données du capteur enregistrées",
      smsSent,
      alertMessage,
      currentData: latestSensorData
    });
    
  } catch (error) {
    console.error('[/api/iot] Error:', error);
    return NextResponse.json({ success: false, error: "Erreur serveur IoT" }, { status: 500 });
  }
}

// GET : L'application mobile/web vient lire les dernières données ici pour l'affichage
export async function GET() {
  return NextResponse.json(latestSensorData);
}
