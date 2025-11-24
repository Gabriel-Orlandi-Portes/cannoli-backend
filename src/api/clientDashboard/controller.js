import { Router } from "express";
import prisma from "../../../prismaClient.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório" });
    }

    // Buscar todos os pedidos do cliente
    const orders = await prisma.order.findMany({
      where: { customerEmail: email },
      orderBy: { createdAt: "desc" }
    });

    // Se não tiver pedidos
    if (!orders.length) {
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

    // 🔹 Summary
    const totalSpent = orders.reduce((t, o) => t + (o.totalAmount || 0), 0);

    const summary = {
      name: orders[0].customerName || email,
      totalSpent,
      totalOrders: orders.length,
      avgTicket: totalSpent / orders.length,
      fidelity:
        orders.length > 30
          ? "Diamante"
          : orders.length > 20
          ? "Ouro"
          : orders.length > 10
          ? "Prata"
          : "Bronze"
    };

    // 🔹 Agrupar por mês
    const monthly = {};
    for (const o of orders) {
      const m = new Date(o.createdAt).toLocaleString("pt-BR", { month: "short" });
      monthly[m] = (monthly[m] || 0) + (o.totalAmount || 0);
    }

    const chartData = Object.entries(monthly).map(([month, amount]) => ({
      month,
      amount: Number(amount.toFixed(2))
    }));

    // 🔹 Últimos pedidos
    const pedidosRecentes = orders.slice(0, 5).map((o) => ({
      id: o.id,
      store: o.storeName,
      value: o.totalAmount.toFixed(2),
      status: o.status,
      date: o.createdAt
    }));

    // 🔹 Campanhas recentes (fake por enquanto)
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
