import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  const totalOrders = 1000;

  const stores = [
    "Masseria di Paolo",
    "Dona Nuvem Sobremesas",
    "Sabor de Casa Mineira",
    "The Urban Lunch",
    "Bistrô da Praça",
    "Panetteria & Co",
    "La Pizzaria Bella",
    "Empório Bella Massa",
    "Cantina do Centro"
  ];

  const channels = ["IFOOD", "WHATSAPP", "DELIVERYVIP", "SMS", "EMAIL"];

  for (let i = 0; i < totalOrders; i++) {
    // Data aleatória de 2025
    const date = faker.date.between({
      from: "2025-01-01",
      to: "2025-11-30",
    });

    // Campos
    const prepMinutes = faker.number.int({ min: 10, max: 60 });
    const deliveryMinutes = faker.number.int({ min: 15, max: 45 });

    const preparationStart = new Date(date);
    const deliveryDate = new Date(preparationStart.getTime() + (prepMinutes + deliveryMinutes) * 60000);

    await prisma.order.create({
      data: {
        id: faker.string.uuid(),
        displayId: faker.number.int({ min: 1000, max: 99999 }).toString(),
        companyId: faker.string.uuid(),
        customerId: faker.string.uuid(),
        customerName: faker.person.fullName(),
        customerEmail: faker.internet.email(),
        storeName: faker.helpers.arrayElement(stores),
        salesChannel: faker.helpers.arrayElement(channels),
        preparationStartDateTime: preparationStart,
        deliveryDateTime: deliveryDate,
        preparationTime: prepMinutes,
        orderTiming: "PADRÃO",
        orderType: "DELIVERY",
        status: faker.helpers.arrayElement(["CONCLUÍDO", "ENTREGUE", "CANCELADO"]),
        totalAmount: faker.number.float({ min: 20, max: 250, precision: 0.01 }),
        deliveryFee: faker.number.float({ min: 2, max: 15, precision: 0.01 }),
        createdAt: preparationStart,
        updatedAt: preparationStart,
      },
    });
  }

  console.log("🔥 1000 pedidos gerados com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
