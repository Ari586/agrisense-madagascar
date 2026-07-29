const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log("ALL POSTS:", JSON.stringify(posts.map(p => ({
    id: p.id,
    caption: p.caption,
    hasImage: !!p.imageUrl,
    imageLength: p.imageUrl ? p.imageUrl.length : 0,
    imageStart: p.imageUrl ? p.imageUrl.substring(0, 50) : null,
    createdAt: p.createdAt
  })), null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
