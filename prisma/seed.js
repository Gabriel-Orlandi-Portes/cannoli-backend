import prisma from "../prismaClient.js";

async function main() {
  console.log("🌱 Inserindo dados fake...");

  // Criar usuário admin
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@cannoli.com",
      password: "123456",
      role: "admin",
    },
  });

  // Criar usuário cliente
  await prisma.user.create({
    data: {
      name: "Cliente Teste",
      email: "cliente@teste.com",
      password: "123456",
      role: "cliente",
    },
  });

  // Criar alguns pedidos
  await prisma.order.createMany({
    data: [
      {
        id: "001",
        companyId: "1",
        customerEmail: "cliente@teste.com",
        customerName: "Cliente Teste",
        storeName: "Cannoli Jardins",
        status: "Delivered",
        totalAmount: 45.90,
        createdAt: new Date("2025-01-05"),
        updatedAt: new Date(),
      },
      {
        id: "002",
        companyId: "1",
        customerEmail: "cliente@teste.com",
        customerName: "Cliente Teste",
        storeName: "Cannoli Vila Olímpia",
        status: "Delivered",
        totalAmount: 67.00,
        createdAt: new Date("2025-01-12"),
        updatedAt: new Date(),
      },
      {
        id: "003",
        companyId: "1",
        customerEmail: "cliente@teste.com",
        customerName: "Cliente Teste",
        storeName: "Cannoli Tatuapé",
        status: "Delivered",
        totalAmount: 32.50,
        createdAt: new Date("2025-01-20"),
        updatedAt: new Date(),
      },
    ],
  });

  console.log("🌱 SEED FINALIZADO!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
