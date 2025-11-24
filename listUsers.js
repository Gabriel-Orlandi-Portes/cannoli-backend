import prisma from "./prismaClient.js";

async function main() {
  const users = await prisma.user.findMany();
  console.log("👥 Usuários encontrados:");
  console.log(users);
}

main().finally(() => process.exit());
