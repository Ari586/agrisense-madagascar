import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const resolvedParams = await params;
    const postId = resolvedParams.postId;
    
    // We should ideally verify that the user trying to delete is the owner
    // But since authentication is mocked via headers/body in this app version,
    // we just get the userId from query or body. Let's use searchParams.
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');

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

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (userId && post.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
