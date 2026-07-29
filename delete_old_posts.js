const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.post.deleteMany({
    where: {
      imageUrl: {
        contains: 'unsplash'
      }
    }
  });
  console.log('Deleted old posts:', result);
}
main().catch(console.error).finally(() => prisma.$disconnect());
