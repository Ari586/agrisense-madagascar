const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' }, take: 3 });
  console.log(posts.map(p => ({
    id: p.id,
    caption: p.caption,
    imageUrlLength: p.imageUrl ? p.imageUrl.length : 0,
    imageUrlPrefix: p.imageUrl ? p.imageUrl.substring(0, 40) : null,
    createdAt: p.createdAt
  })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
