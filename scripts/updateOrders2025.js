import prisma from "../prismaClient.js";

function randomDateIn2025() {
  const start = new Date("2025-01-01T00:00:00");
  const end   = new Date("2025-11-24T23:59:59");

  const ts = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(ts);
}

async function main() {
  const orders = await prisma.order.findMany();

  console.log(`🔄 Atualizando ${orders.length} pedidos para datas de 2025...`);

  for (const order of orders) {
    const newDate = randomDateIn2025();

    // Preparação começa 15 min depois
    const prepStart = new Date(newDate.getTime() + 15 * 60 * 1000);

    // entrega 30–90 min depois
    const delivery = new Date(
      prepStart.getTime() +
      ((order.preparationTime ?? 45) * 60 * 1000)
    );

    await prisma.order.update({
      where: { id: order.id },
      data: {
        createdAt: newDate,
        preparationStartDateTime: prepStart,
        deliveryDateTime: delivery,
        updatedAt: new Date(),
      },
    });
  }

  console.log("✅ TODAS AS DATAS FORAM AJUSTADAS PARA 2025!");
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
