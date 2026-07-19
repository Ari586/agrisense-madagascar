import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialPrices = [
  { cropId: 'vary', name: 'Vary (Riz)', price: 2800, trend: 'stable', percentage: 0.5, category: 'Renivola (Sakafo Fototra)' },
  { cropId: 'vanille', name: 'Vanille', price: 150000, trend: 'down', percentage: 5.2, category: 'Fanondranana' },
  { cropId: 'jirofo', name: 'Jirofo', price: 25000, trend: 'up', percentage: 3.1, category: 'Fanondranana' },
  { cropId: 'katsaka', name: 'Katsaka', price: 1200, trend: 'up', percentage: 1.5, category: 'Renivola' },
  { cropId: 'voanjo', name: 'Voanjo', price: 4500, trend: 'stable', percentage: 0.0, category: 'Vokatry ny tany' },
  { cropId: 'mangahazo', name: 'Mangahazo', price: 800, trend: 'stable', percentage: 0.2, category: 'Renivola' }
];

export async function GET() {
  try {
    let prices = await prisma.marketPrice.findMany({
      orderBy: { name: 'asc' }
    });

    // Seed database if empty
    if (prices.length === 0) {
      for (const p of initialPrices) {
        await prisma.marketPrice.create({ data: p });
      }
      prices = await prisma.marketPrice.findMany({ orderBy: { name: 'asc' } });
    }

    return NextResponse.json({ success: true, data: prices });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Erreur DB" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (data.action === 'update' && data.updates) {
      // updates is an array of { id, price, trend, percentage }
      const promises = data.updates.map((u: any) => 
        prisma.marketPrice.update({
          where: { id: u.id },
          data: {
            price: Number(u.price),
            trend: u.trend,
            percentage: Number(u.percentage)
          }
        })
      );
      await Promise.all(promises);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Erreur DB" }, { status: 500 });
  }
}
