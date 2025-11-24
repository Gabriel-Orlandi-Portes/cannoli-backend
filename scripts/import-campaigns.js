import fs from "fs";
import prisma from "../src/core/db.js";

async function main() {
  const data = JSON.parse(fs.readFileSync("./imports/campaign.json", "utf8"));

  for (const item of data) {
    await prisma.campaign.create({
      data: {
        id: item.id,
        segmentId: item.segmentId || null,
        templateId: item.templateId,
        storeId: item.storeId,
        name: item.name,
        description: item.description || null,
        badge: item.badge || null,
        type: item.type,
        status: item.status,
        isDefault: item.isDefault,
        createdAt: new Date(item.createdAt),
        createdBy: item.createdBy,
        updatedAt: new Date(item.updatedAt),
        updatedBy: item.updatedBy || null,
        segmentName: item["segment.name"] || null,
        storeName: item["store.name"] || null,
        templateName: item["template.name"] || null,
      },
    });
  }

  console.log("✅ Campaign importado com sucesso!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
