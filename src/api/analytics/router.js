import { Router } from "express";
import prisma from "../../../prismaClient.js";

const router = Router();

function safe(v) {
  return Number(v ?? 0);
}

/* =========================================================
   📊 FATURAMENTO — POR MÊS + CANAL
========================================================= */
router.get("/revenue", async (req, res) => {
  try {
    const orders = await prisma.order.findMany();

    const revenueByMonth = {};
    const revenueByChannel = {
      Delivery: 0,
      WhatsApp: 0,
      Site: 0,
      Ligação: 0,
    };

    for (const o of orders) {
      const amount = safe(o.totalAmount);

      // mês
      const month = new Date(o.createdAt).toLocaleString("pt-BR", {
        month: "short",
      });
      revenueByMonth[month] = (revenueByMonth[month] || 0) + amount;

      // canal unificado
      let canal = (o.salesChannel || "").toUpperCase();

      if (["IFOOD", "99FOOD", "DELIVERYVIP"].includes(canal)) {
        revenueByChannel.Delivery += amount;
      } else if (canal === "WHATSAPP") {
        revenueByChannel.WhatsApp += amount;
      } else if (canal === "SITE") {
        revenueByChannel.Site += amount;
      } else if (["SMS", "LIGACAO", "LIGAÇÃO"].includes(canal)) {
        revenueByChannel.Ligação += amount;
      }
    }

    // converter revenueByMonth OBJETO -> ARRAY
    const revenueByMonthArray = Object.entries(revenueByMonth).map(
      ([month, amount]) => ({
        month,
        amount: Number(amount.toFixed(2)),
      })
    );

    // ordenar meses na ordem correta
    const orderMap = [
      "jan.", "fev.", "mar.", "abr.", "mai.", "jun.",
      "jul.", "ago.", "set.", "out.", "nov.", "dez."
    ];

    revenueByMonthArray.sort(
      (a, b) =>
        orderMap.indexOf(a.month.toLowerCase()) -
        orderMap.indexOf(b.month.toLowerCase())
    );

    // formatar canais
    const revenueByChannelClean = Object.fromEntries(
      Object.entries(revenueByChannel).map(([c, v]) => [
        c,
        Number(v.toFixed(2)),
      ])
    );

    const totalRevenue = orders.reduce(
      (t, o) => t + safe(o.totalAmount),
      0
    );

    res.json({
      revenueByMonth: revenueByMonthArray,
      revenueByChannel: revenueByChannelClean,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders: orders.length,
      avgTicket: Number((totalRevenue / (orders.length || 1)).toFixed(2)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar relatório." });
  }
});

/* =========================================================
   🏪 LOJAS — RANKING
========================================================= */
router.get("/stores", async (req, res) => {
  try {
    const orders = await prisma.order.findMany();

    const storeMap = {};

    for (const o of orders) {
      if (!o.storeName || o.storeName.trim() === "") continue;

      const store = o.storeName;

      if (!storeMap[store])
        storeMap[store] = { revenue: 0, orders: 0, avgTicket: 0 };

      storeMap[store].revenue += safe(o.totalAmount);
      storeMap[store].orders++;
    }

    // ticket médio
    for (const s of Object.keys(storeMap)) {
      const d = storeMap[s];
      d.avgTicket = Number((d.revenue / (d.orders || 1)).toFixed(2));
      d.revenue = Number(d.revenue.toFixed(2));
    }

    const ranking = Object.entries(storeMap)
      .map(([store, info]) => ({ store, ...info }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json({ ranking, totalStores: ranking.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar lojas." });
  }
});

/* =========================================================
   ⏱ TEMPO & STATUS
========================================================= */
router.get("/timing", async (req, res) => {
  try {
    const orders = await prisma.order.findMany();

    const statusCounts = {};
    const prepTimes = [];
    const deliveryTimes = [];

    for (const o of orders) {
      if (o.status) {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      }

      if (typeof o.preparationTime === "number" && o.preparationTime > 0) {
        prepTimes.push(o.preparationTime);
      }

      if (o.deliveryDateTime && o.preparationStartDateTime) {
        const start = new Date(o.preparationStartDateTime);
        const end = new Date(o.deliveryDateTime);

        if (!isNaN(start) && !isNaN(end)) {
          deliveryTimes.push((end - start) / 60000);
        }
      }
    }

    const avgPrep =
      prepTimes.reduce((a, b) => a + b, 0) / (prepTimes.length || 1);

    const avgDelivery =
      deliveryTimes.reduce((a, b) => a + b, 0) /
      (deliveryTimes.length || 1);

    res.json({
      statusCounts,
      avgPrep: Number(avgPrep.toFixed(1)),
      avgDelivery: Number(avgDelivery.toFixed(1)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao analisar tempos." });
  }
});

export default router;
