import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // A real app would filter stories from the last 24 hours.
    // We'll fetch all stories and include the user.
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const stories = await prisma.story.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: stories });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, imageUrl } = data;

    if (!userId || !imageUrl) {
      return NextResponse.json({ success: false, error: 'userId and imageUrl are required' }, { status: 400 });
    }

    const newStory = await prisma.story.create({
      data: {
        imageUrl,
        userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: newStory });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
