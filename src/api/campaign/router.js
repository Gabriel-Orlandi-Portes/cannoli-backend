import { Router } from "express";
import prisma from "../../../prismaClient.js";

const router = Router();

/**
 * POST /campaign/simulate
 * Body:
 * {
 *   "discount": 0.15,         // 15% de desconto
 *   "channel": "SMS",         // IFOOD, WHATSAPP, DELIVERYVIP, SMS, EMAIL, etc.
 *   "storeName": "Masseria di Paolo"  // opcional
 * }
 */
router.post("/simulate", async (req, res) => {
  try {
    let { discount, channel, storeName } = req.body;

    discount = Number(discount) || 0;

    // 1) Buscar pedidos base (todas as lojas ou uma loja)
    const where = storeName
      ? { storeName: { equals: storeName } }
      : {};

    const orders = await prisma.order.findMany({ where });

    if (!orders.length) {
      return res.status(400).json({
        error:
          "Nenhum pedido encontrado para o filtro informado. Verifique o nome da loja ou o período.",
      });
    }

    // 2) Cálculo dos indicadores atuais (baseline)
    const revenueBase = orders.reduce(
      (total, o) => total + (o.totalAmount ?? 0),
      0
    );
    const ordersBase = orders.length;
    const avgTicketBase = revenueBase / ordersBase;

    // 3) "Modelo" simples de impacto
    //    (isso é a parte de IA/ciência de dados simulada)
    const channelBoostMap = {
      IFOOD: 0.20,
      WHATSAPP: 0.12,
      DELIVERYVIP: 0.25,
      SMS: 0.10,
      EMAIL: 0.08,
      OUTRO: 0.10,
    };

    const cleanChannel = (channel || "OUTRO").toUpperCase();
    const baseChannelBoost = channelBoostMap[cleanChannel] ?? channelBoostMap.OUTRO;

    // Impacto do desconto: cada 10% de desconto = +6% de pedidos, +3% de receita
    const discountFactor = discount; // 0.15, 0.20...
    const discountBoostOrders = discountFactor * 0.6;  // 15% desc -> +9% pedidos
    const discountBoostRevenue = discountFactor * 0.3; // 15% desc -> +4.5% receita

    // Impacto total
    const boostOrders = baseChannelBoost + discountBoostOrders;
    const boostRevenue = baseChannelBoost + discountBoostRevenue;

    const ordersSimulated = Math.round(ordersBase * (1 + boostOrders));
    const revenueSimulated = revenueBase * (1 + boostRevenue);
    const avgTicketSimulated = revenueSimulated / ordersSimulated;

    // 4) Montar resposta
    const response = {
      scope: storeName || "Todas as lojas",
      baseline: {
        revenue: Number(revenueBase.toFixed(2)),
        orders: ordersBase,
        avgTicket: Number(avgTicketBase.toFixed(2)),
      },
      simulated: {
        revenue: Number(revenueSimulated.toFixed(2)),
        orders: ordersSimulated,
        avgTicket: Number(avgTicketSimulated.toFixed(2)),
      },
      deltas: {
        revenueDiff: Number((revenueSimulated - revenueBase).toFixed(2)),
        revenuePercent: Number((boostRevenue * 100).toFixed(1)),
        ordersDiff: ordersSimulated - ordersBase,
        ordersPercent: Number((boostOrders * 100).toFixed(1)),
      },
      explanation: `Campanha no canal ${cleanChannel} com desconto de ${
        discount * 100
      }% pode aumentar em ~${(boostRevenue * 100).toFixed(
        1
      )}% a receita e ~${(boostOrders * 100).toFixed(1)}% o volume de pedidos ${
        storeName ? "para a loja " + storeName : "no conjunto de lojas"
      }.`,
    };

    res.json(response);
  } catch (err) {
    console.error("❌ Erro na simulação de campanha:", err);
    res.status(500).json({ error: "Erro ao simular campanha." });
  }
});

export default router;
