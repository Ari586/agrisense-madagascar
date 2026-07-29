import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    // Find all messages where this user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, name: true, lastSeen: true }
        },
        receiver: {
          select: { id: true, name: true, lastSeen: true }
        }
      }
    });

    // Group by conversation partner to find the latest message per partner
    const conversationsMap = new Map();

    for (const msg of messages) {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!partner) continue;

      if (!conversationsMap.has(partner.id)) {
        conversationsMap.set(partner.id, {
          partnerId: partner.id,
          partnerName: partner.name || 'Inconnu',
          partnerAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop', // default avatar
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          lastSeen: partner.lastSeen,
          unread: 0, // Mock unread count for now
        });
      }
    }

    const conversations = Array.from(conversationsMap.values());

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
