import { NextResponse } from "next/server";

// --- Types ---

interface ForecastDay {
  day: string;
  temp: number;
  condition: string;
  rain: number;
}

interface WeatherData {
  region: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  forecast: ForecastDay[];
}

// --- Helpers ---

const REGIONS = [
  "Antananarivo",
  "Toamasina",
  "Antsirabe",
  "Mahajanga",
  "Fianarantsoa",
  "Toliara",
  "Antsiranana",
] as const;

const CONDITIONS = [
  "Ensoleillé",
  "Partiellement nuageux",
  "Nuageux",
  "Pluie légère",
  "Pluie forte",
  "Orageux",
  "Brouillard",
] as const;

const FORECAST_LABELS = ["Aujourd'hui", "Demain", "Après-demain"] as const;

function rand(base: number, delta: number): number {
  return Math.round((base + (Math.random() * 2 - 1) * delta) * 10) / 10;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Route Handler ---

export async function GET(): Promise<NextResponse<WeatherData | { error: string }>> {
  try {
    const region = pick(REGIONS);

    const baseTemp = 24 + Math.random() * 10; // 24-34
    const baseHumidity = 45 + Math.random() * 35; // 45-80
    const baseWind = 5 + Math.random() * 25; // 5-30
    const condition = pick(CONDITIONS);

    const forecast: ForecastDay[] = FORECAST_LABELS.map((day) => {
      const temp = Math.round(rand(baseTemp, 4));
      const rain = Math.round(Math.random() * 100);
      let forecastCondition: string;

      if (rain > 70) forecastCondition = "Pluie forte";
      else if (rain > 45) forecastCondition = "Pluie légère";
      else if (rain > 20) forecastCondition = "Nuageux";
      else if (rain > 10) forecastCondition = "Partiellement nuageux";
      else forecastCondition = "Ensoleillé";

      return { day, temp, condition: forecastCondition, rain };
    });

    const data: WeatherData = {
      region,
      temperature: Math.round(rand(baseTemp, 2)),
      humidity: Math.round(rand(baseHumidity, 5)),
      windSpeed: Math.round(rand(baseWind, 3)),
      condition,
      forecast,
    };

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données météo." },
      { status: 500 },
    );
  }
}