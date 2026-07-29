const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log("No user");

  // Small valid PNG base64
  const testBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  const post = await prisma.post.create({
    data: {
      userId: user.id,
      caption: "Test de publication avec une image réelle Base64 !",
      imageUrl: testBase64
    }
  });

  console.log("Post créé avec succès:", post.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
