import { NextResponse } from "next/server";

// --- Types ---

interface CropPrice {
  crop: string;
  price: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: string;
}

interface MarketData {
  prices: CropPrice[];
  lastUpdate: string;
}

// --- Data ---

const BASE_PRICES: CropPrice[] = [
  { crop: "Riz (Vary)", price: 3200, unit: "Ar/kg", trend: "up", change: "+5%" },
  { crop: "Vanille", price: 250000, unit: "Ar/kg", trend: "down", change: "-3%" },
  { crop: "Café", price: 18000, unit: "Ar/kg", trend: "up", change: "+2%" },
  { crop: "Clou de girofle", price: 35000, unit: "Ar/kg", trend: "stable", change: "0%" },
  { crop: "Litchi", price: 5000, unit: "Ar/kg", trend: "up", change: "+8%" },
  { crop: "Manioc", price: 1200, unit: "Ar/kg", trend: "down", change: "-2%" },
  { crop: "Maïs", price: 2000, unit: "Ar/kg", trend: "stable", change: "0%" },
  { crop: "Pois du cap", price: 8000, unit: "Ar/kg", trend: "up", change: "+4%" },
];

// --- Route Handler ---

export async function GET(): Promise<NextResponse<MarketData | { error: string }>> {
  try {
    const prices: CropPrice[] = BASE_PRICES.map((item) => {
      // Add ±3% random price variation
      const variation = 1 + (Math.random() * 2 - 1) * 0.03;
      const price = Math.round(item.price * variation);

      return { ...item, price };
    });

    const lastUpdate = new Date().toISOString();

    return NextResponse.json({ prices, lastUpdate });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des prix du marché." },
      { status: 500 },
    );
  }
}