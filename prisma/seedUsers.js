import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Inserindo dados de exemplo...");

  const password = "senha123";
  const hashed = await bcrypt.hash(password, 10);

  // 🔹 Usuário admin
  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Admin Cannoli",
      email: "admin@gmail.com",
      password: hashed,
      role: "admin",
    },
  });

  // 🔹 Usuário cliente
  await prisma.user.upsert({
    where: { email: "cliente@gmail.com" },
    update: {},
    create: {
      name: "Cliente Cannoli",
      email: "cliente@gmail.com",
      password: hashed,
      role: "cliente",
    },
  });

  // 🔹 Cliente vinculado ao e-mail cliente@gmail.com
  await prisma.customer.upsert({
    where: { customerEmail: "cliente@gmail.com" },
    update: {},
    create: {
      name: "Cliente Demo",
      customerEmail: "cliente@gmail.com",
      customerPhone: "11999999999",
      taxId: "12345678900",
      gender: "F",
      dateOfBirth: new Date("1995-03-25"),
      status: 1,
      externalCode: "CLI001",
      isEnriched: true,
      createdBy: "seedScript",
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: "seedScript",
      customerCity: "São Paulo",
      customerState: "SP",
    },
  });

  // 🔹 Pedido de exemplo para o cliente
  await prisma.order.create({
    data: {
      id: "ORD001",
      companyId: "COMP001",
      customerId: "1", // opcional, se quiser vincular a customer real, pode buscar via prisma.customer.findFirst()
      customerName: "Cliente Demo",
      customerEmail: "cliente@gmail.com",
      storeName: "Cannoli Center",
      salesChannel: "Delivery",
      preparationStartDateTime: new Date("2025-10-05T10:30:00Z"),
      deliveryDateTime: new Date("2025-10-05T11:00:00Z"),
      preparationTime: 30,
      orderTiming: "On Time",
      orderType: "Online",
      status: "Delivered",
      totalAmount: 85.5,
      deliveryFee: 5.0,
      createdAt: new Date("2025-10-05T10:00:00Z"),
      updatedAt: new Date(),
    },
  });

  // 🔹 Campanha de exemplo
  await prisma.campaign.create({
    data: {
      id: "CAMP001",
      segmentId: "SEG001",
      templateId: "TMP001",
      storeId: "STORE001",
      name: "Promoção de Outubro",
      description: "Campanha de fidelização para clientes frequentes.",
      badge: "Promoção",
      type: 1,
      status: 1,
      isDefault: false,
      createdAt: new Date(),
      createdBy: "seedScript",
      segmentName: "Clientes VIP",
      storeName: "Cannoli Center",
      templateName: "Mensagem Padrão",
    },
  });

  console.log("✅ Seed completo! Admin, Cliente, Pedido e Campanha criados.");
}

// 🚀 Executa o seed
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
