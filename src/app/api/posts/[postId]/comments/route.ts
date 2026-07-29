import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const resolvedParams = await params;
    const postId = resolvedParams.postId;

    const comments = await prisma.comment.findMany({
      where: { postId: postId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    const formattedComments = comments.map(c => ({
      id: c.id,
      userId: c.userId,
      userName: c.user?.name || 'Utilisateur',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      content: c.content,
      createdAt: c.createdAt.toISOString()
    }));

    return NextResponse.json({ success: true, comments: formattedComments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const resolvedParams = await params;
    const postId = resolvedParams.postId;
    
    const body = await request.json();
    let userId = body.userId;
    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) userId = null;
    }
    if (!userId) {
      const admin = await prisma.user.findFirst({ where: { email: 'Ari' } });
      if (admin) userId = admin.id;
      else {
        const anyUser = await prisma.user.findFirst();
        userId = anyUser?.id;
      }
    }
    const content = body.content;
    
    if (!userId || !content) {
      return NextResponse.json({ error: "User ID and content are required" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        userId: userId,
        postId: postId,
        content: content
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      comment: {
        id: comment.id,
        userId: comment.userId,
        userName: comment.user?.name || 'Utilisateur',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
        content: comment.content,
        createdAt: comment.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
