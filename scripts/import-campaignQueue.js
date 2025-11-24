import fs from "fs";
import prisma from "../src/core/db.js";

async function main() {
  const data = JSON.parse(fs.readFileSync("./imports/campaignQueue.json", "utf8"));

  for (const item of data) {
    await prisma.campaignQueue.create({
      data: {
        id: item.id,
        jobId: item.jobId,
        campaignId: item.campaignId,
        storeId: item.storeId,
        storeInstanceId: item.storeInstanceId,
        customerId: item.customerId,
        phoneNumber: item.phoneNumber,
        scheduledAt: new Date(item.scheduledAt),
        sendAt: new Date(item.sendAt),
        status: item.status,
        message: item.message,
        response: item.response || null,
        createdAt: new Date(item.createdAt),
        createdBy: item.createdBy,
        updatedAt: new Date(item.updatedAt),
        updatedBy: item.updatedBy || null,
      },
    });
  }

  console.log("✅ CampaignQueue importado com sucesso!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
