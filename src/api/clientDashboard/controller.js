import { Router } from "express";
import prisma from "../../../prismaClient.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório" });
    }

    const orders = await prisma.order.findMany({
      where: { customerEmail: email },
      orderBy: { createdAt: "desc" }
    });

    // 🔥 remove pedidos com data inválida
    const validOrders = orders.filter(o => o.createdAt && !isNaN(new Date(o.createdAt)));

    if (!validOrders.length) {
      return res.json({
        summary: {
          name: email,
          totalSpent: 0,
          totalOrders: 0,
          avgTicket: 0,
          fidelity: "Bronze"
        },
        chartData: [],
        pedidosRecentes: [],
        campanhasRecentes: []
      });
    }

    const totalSpent = validOrders.reduce((t, o) => t + (o.totalAmount || 0), 0);

    const summary = {
      name: validOrders[0].customerName || email,
      totalSpent,
      totalOrders: validOrders.length,
      avgTicket: totalSpent / validOrders.length,
      fidelity:
        validOrders.length > 30
          ? "Diamante"
          : validOrders.length > 20
          ? "Ouro"
          : validOrders.length > 10
          ? "Prata"
          : "Bronze"
    };

    const monthly = {};
    for (const o of validOrders) {
      const date = new Date(o.createdAt);
      const m = date.toLocaleString("pt-BR", { month: "short" });
      monthly[m] = (monthly[m] || 0) + (o.totalAmount || 0);
    }

    const chartData = Object.entries(monthly).map(([month, amount]) => ({
      month,
      amount: Number(amount.toFixed(2))
    }));

    const pedidosRecentes = validOrders.slice(0, 5).map((o) => ({
      id: o.id,
      store: o.storeName,
      value: o.totalAmount.toFixed(2),
      status: o.status,
      date: o.createdAt
    }));

    const campanhasRecentes = [
      { nome: "Cupom de 10%", tipo: "Desconto", status: "Ativo" },
      { nome: "Semana do Cliente", tipo: "Promoção", status: "Encerrado" }
    ];

    res.json({
      summary,
      chartData,
      pedidosRecentes,
      campanhasRecentes
    });

  } catch (err) {
    console.error("ERRO CLIENT DASHBOARD:", err);
    res.status(500).json({ error: "Erro ao gerar dashboard do cliente" });
  }
});

export default router;
