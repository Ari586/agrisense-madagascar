import { NextResponse } from "next/server";

interface Alert {
  id: string;
  type: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  region: string;
  time: string;
}

interface AlertsData {
  alerts: Alert[];
}

export async function GET(): Promise<NextResponse<AlertsData | { error: string }>> {
  try {
    const alerts: Alert[] = [];
    
    // 1. Côte Est (Toamasina) - Vérification Cyclone / Pluie
    const eastRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-18.15&longitude=49.4&current=temperature_2m,wind_speed_10m,precipitation&timezone=auto', { next: { revalidate: 3600 } });
    if (eastRes.ok) {
        const data = await eastRes.json();
        const wind = data.current?.wind_speed_10m || 0;
        const rain = data.current?.precipitation || 0;
        
        if (wind > 90) {
            alerts.push({ id: "east-wind", type: "cyclone", severity: "critical", title: "Alerte Rivo-doza", message: `Rivodoza mahery (${wind} km/h) any amin'ny faritra Atsinanana. Arovy ny voly!`, region: "Côte Est", time: "Mivantana" });
        } else if (rain > 100) {
            alerts.push({ id: "east-rain", type: "rain", severity: "warning", title: "Oram-be", message: `Orana betsaka (${rain} mm) any Atsinanana. Mety hisy tondra-drano.`, region: "Côte Est", time: "Mivantana" });
        }
    }

    // 2. Sud (Ambovombe) - Vérification Sécheresse / Chaleur
    const southRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-25.17&longitude=46.08&current=temperature_2m,precipitation&daily=temperature_2m_max&timezone=auto', { next: { revalidate: 3600 } });
    if (southRes.ok) {
        const data = await southRes.json();
        const maxTemp = data.daily?.temperature_2m_max?.[0] || 25;
        const rain = data.current?.precipitation || 0;
        
        if (maxTemp > 38 && rain < 2) {
            alerts.push({ id: "south-heat", type: "drought", severity: "critical", title: "Hafanana sy Hain-tany", message: `Hafanana be (${maxTemp}°C) any Atsimo. Mila tondrahana matetika ny voly.`, region: "Sud", time: "Mivantana" });
        }
    }

    // 3. Hauts Plateaux (Antsirabe) - Vérification Gel / Froid extrême ou Pluie
    const highRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-19.86&longitude=47.03&current=temperature_2m,precipitation&daily=temperature_2m_min&timezone=auto', { next: { revalidate: 3600 } });
    if (highRes.ok) {
        const data = await highRes.json();
        const minTemp = data.daily?.temperature_2m_min?.[0] || 15;
        const rain = data.current?.precipitation || 0;
        
        if (minTemp <= 4) {
            alerts.push({ id: "high-cold", type: "info", severity: "warning", title: "Hatsiaka (Fanala)", message: `Hatsiaka be (${minTemp}°C) any Vakinankaratra. Arovy ny voly saropady.`, region: "Hauts Plateaux", time: "Mivantana" });
        }
        if (rain > 50) {
            alerts.push({ id: "high-rain", type: "rain", severity: "info", title: "Orana andrasana", message: `Orana andrasana (${rain} mm) any amin'ny faritra Afovoany.`, region: "Hauts Plateaux", time: "Mivantana" });
        }
    }

    // S'il n'y a aucune alerte critique
    if (alerts.length === 0) {
        alerts.push({ id: "all-good", type: "info", severity: "info", title: "Tsara ny andro", message: "Toetrandro tsara manerana ny Nosy. Tsy misy loza manambana ny fambolena.", region: "Madagascar", time: "Mivantana" });
    }

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Erreur lors de la récupération des alertes", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des alertes." },
      { status: 500 }
    );
  }
}