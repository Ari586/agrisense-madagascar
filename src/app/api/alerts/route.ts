import { NextResponse } from "next/server";

// --- Types ---

interface Alert {
  id: number;
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

// --- Data ---

const ALERTS: Alert[] = [
  {
    id: 1,
    type: "cyclone",
    severity: "critical",
    title: "Alerte Cyclone",
    message:
      "Risque de cyclone dans 72h sur la côte Est. Protégez vos cultures immédiatement.",
    region: "Côte Est",
    time: "Il y a 2h",
  },
  {
    id: 2,
    type: "drought",
    severity: "warning",
    title: "Sécheresse prolongée",
    message:
      "Période sèche anormale dans le Sud. Réduisez l'irrigation et privilégiez les cultures résistantes.",
    region: "Grand Sud",
    time: "Il y a 5h",
  },
  {
    id: 3,
    type: "rain",
    severity: "info",
    title: "Pluies attendues",
    message:
      "Pluies modérées prévues dans 48h dans les Hauts Plateaux. Bon moment pour préparer les rizières.",
    region: "Hauts Plateaux",
    time: "Il y a 8h",
  },
];

// --- Route Handler ---

export async function GET(): Promise<NextResponse<AlertsData | { error: string }>> {
  try {
    return NextResponse.json({ alerts: ALERTS });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des alertes." },
      { status: 500 },
    );
  }
}