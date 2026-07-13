import { NextResponse } from "next/server";

// --- Types ---

interface SensorData {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  lightLevel: number;
  windSpeed: number;
  rainfall: number;
  timestamp: string;
}

// --- Helpers ---

/** Returns a random integer clamped between min and max. */
function rand(base: number, delta: number, min = 0, max = 100): number {
  const value = Math.round(base + (Math.random() * 2 - 1) * delta);
  return Math.max(min, Math.min(max, value));
}

// --- Route Handler ---

export async function GET(): Promise<NextResponse<SensorData | { error: string }>> {
  try {
    const data: SensorData = {
      soilMoisture: rand(42, 5, 0, 100),
      temperature: rand(28, 2, 10, 45),
      humidity: rand(65, 5, 10, 100),
      lightLevel: rand(75, 8, 0, 100),
      windSpeed: rand(12, 3, 0, 80),
      rainfall: rand(0, 1, 0, 50),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données capteurs." },
      { status: 500 },
    );
  }
}