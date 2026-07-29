import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const resolvedParams = await params;
    const postId = resolvedParams.postId;
    
    const body = await request.json();
    const userId = body.userId;
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId
        }
      }
    });

    let liked = false;
    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      liked = false;
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: userId,
          postId: postId
        }
      });
      liked = true;
    }
    
    const count = await prisma.like.count({ where: { postId: postId } });

    return NextResponse.json({ success: true, likedByMe: liked, likesCount: count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
  }
}
