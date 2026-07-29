import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('userId');

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            id: true,
            avatarUrl: true,
          }
        },
        _count: {
          select: {
            postLikes: true,
            comments: true
          }
        },
        postLikes: currentUserId ? {
          where: { userId: currentUserId },
          select: { id: true }
        } : false
      }
    });

    // Formatting for Flutter
    const formattedPosts = posts.map(post => ({
      id: post.id,
      userId: post.userId,
      userName: post.user?.name || 'Utilisateur',
      userAvatar: post.user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      userRole: 'Agriculteur',
      caption: post.caption,
      images: post.imageUrl ? [post.imageUrl] : [],
      createdAt: post.createdAt.toISOString(),
      hashtags: [],
      likesCount: post._count.postLikes,
      commentsCount: post._count.comments,
      savedCount: 0,
      likedByMe: currentUserId && post.postLikes ? post.postLikes.length > 0 : false,
      savedByMe: false
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Simulating user ID if not provided (In real app, extract from token)
    let userId = data.userId;
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

    if (!userId) {
      return NextResponse.json({ error: "No user found" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        userId: userId,
        caption: data.caption,
        imageUrl: data.images && data.images.length > 0 ? data.images[0] : null,
      }
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
