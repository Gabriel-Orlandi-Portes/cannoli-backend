import fs from "fs";
import prisma from "../src/core/db.js";

async function main() {
  console.log("🚀 Iniciando importação de orders...");

  // Lê o arquivo JSON (certifique-se de que está em /imports/)
  const data = JSON.parse(fs.readFileSync("./imports/order.json", "utf8"));

  let success = 0;
  let errors = 0;

  for (const item of data) {
    try {
      await prisma.order.upsert({
        where: { id: item.id },
        update: {
          displayId: item.displayId || null,
          companyId: item.companyId || "",
          customerId: item["customer.id"] || null,
          customerName: item["customer.name"] || null,
          customerEmail: item["customer.email"] || null,
          storeName: item["store.name"] || null,
          salesChannel: item.salesChannel || null,
          preparationStartDateTime: item.preparationStartDateTime
            ? new Date(item.preparationStartDateTime)
            : null,
          deliveryDateTime: item.deliveryDateTime
            ? new Date(item.deliveryDateTime)
            : null,
          preparationTime: item.preparationTime
            ? Number(item.preparationTime)
            : null,
          orderTiming: item.orderTiming || null,
          orderType: item.orderType || null,
          status: item.status || null,
          totalAmount: item["total.orderAmount"]
            ? Number(item["total.orderAmount"])
            : 0,
          deliveryFee: item["total.deliveryFee"]
            ? Number(item["total.deliveryFee"])
            : 0,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        },
        create: {
          id: item.id,
          displayId: item.displayId || null,
          companyId: item.companyId || "",
          customerId: item["customer.id"] || null,
          customerName: item["customer.name"] || null,
          customerEmail: item["customer.email"] || null,
          storeName: item["store.name"] || null,
          salesChannel: item.salesChannel || null,
          preparationStartDateTime: item.preparationStartDateTime
            ? new Date(item.preparationStartDateTime)
            : null,
          deliveryDateTime: item.deliveryDateTime
            ? new Date(item.deliveryDateTime)
            : null,
          preparationTime: item.preparationTime
            ? Number(item.preparationTime)
            : null,
          orderTiming: item.orderTiming || null,
          orderType: item.orderType || null,
          status: item.status || null,
          totalAmount: item["total.orderAmount"]
            ? Number(item["total.orderAmount"])
            : 0,
          deliveryFee: item["total.deliveryFee"]
            ? Number(item["total.deliveryFee"])
            : 0,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        },
      });

      success++;
    } catch (err) {
      console.error(`❌ Erro ao importar pedido ${item.id}:`, err.message);
      errors++;
    }
  }

  console.log(
    `\n🏁 Importação finalizada. ${success} pedidos importados com sucesso, ${errors} erros.`
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Erro geral na importação:", e);
  prisma.$disconnect();
});
