import { NextResponse } from 'next/server';

// Base de données simulée en mémoire (À remplacer par Supabase, Firebase ou PostgreSQL en production)
let latestSensorData = {
  deviceId: "CAPTEUR_VAKINANKARATRA_01",
  soilMoisture: 65, // Pourcentage d'humidité
  temperature: 24, // Température au sol
  lastUpdated: new Date().toISOString(),
};

// POST : Le capteur IoT (ex: Arduino, ESP32) envoie ses données ici via GSM/Wi-Fi
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Le capteur doit envoyer : { "deviceId": "...", "soilMoisture": 28, "temperature": 24 }
    if (data.soilMoisture !== undefined) {
      latestSensorData.soilMoisture = data.soilMoisture;
      if (data.temperature) latestSensorData.temperature = data.temperature;
      latestSensorData.lastUpdated = new Date().toISOString();
      latestSensorData.deviceId = data.deviceId || latestSensorData.deviceId;
      
      let smsSent = false;
      let alertMessage = "";

      // LOGIQUE D'ALERTE SMS
      // Si l'humidité descend en dessous de 30%, on déclenche une alerte
      if (data.soilMoisture < 30) {
        alertMessage = `Fampitandremana: Maina loatra ny tany (${data.soilMoisture}%). Mila tondrahana haingana ny voly.`;
        
        // C'est ici que l'on intégrerait l'API SMS (Twilio, Orange API, Telma, etc.)
        // ex: await sendSMS("+261340000000", alertMessage);
        
        console.log(`[ALERTE SMS DÉCLENCHÉE] Envoi au: +261 34 XX XXX XX`);
        console.log(`[MESSAGE] ${alertMessage}`);
        smsSent = true;
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Données du capteur enregistrées", 
        smsSent,
        alertMessage,
        currentData: latestSensorData 
      });
    }

    return NextResponse.json({ success: false, error: "Format invalide. 'soilMoisture' requis." }, { status: 400 });
    
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erreur serveur IoT" }, { status: 500 });
  }
}

// GET : L'application mobile/web vient lire les dernières données ici pour l'affichage
export async function GET() {
  return NextResponse.json(latestSensorData);
}
