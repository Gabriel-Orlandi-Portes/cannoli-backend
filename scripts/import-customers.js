import fs from "fs";
import prisma from "../src/core/db.js";

async function main() {
  const data = JSON.parse(fs.readFileSync("./imports/customer.json", "utf8"));

  for (const item of data) {
    await prisma.customer.create({
      data: {
        id: item.id,
        name: item.name,
        taxId: item.taxId,
        gender: item.gender || null,
        dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth) : null,
        status: item.status,
        externalCode: item.externalCode || null,
        isEnriched: item.isEnriched || false,
        createdAt: new Date(item.createdAt),
        createdBy: item.createdBy,
        updatedAt: new Date(item.updatedAt),
        updatedBy: item.updatedBy || null,
        customerPhone: item.customerPhone || null,
        customerEmail: item.customerEmail || null,
        customerCity: item.customerCity || null,
        customerState: item.customerState || null,
      },
    });
  }

  console.log("✅ Customers importados com sucesso!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
