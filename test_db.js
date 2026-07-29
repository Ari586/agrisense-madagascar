const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log("POSTS:", JSON.stringify(posts, null, 2));
  const stories = await prisma.story.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log("STORIES:", JSON.stringify(stories, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
