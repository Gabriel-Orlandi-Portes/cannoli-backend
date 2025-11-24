import prisma from "../../../prismaClient.js";

export default async function dashboardController(req, res) {
  try {
    const dias = req.query.dias ? Number(req.query.dias) : null;

    const start = req.query.start ? new Date(req.query.start) : null;
    const end = req.query.end ? new Date(req.query.end) : null;

    let intervaloDias = dias;

    if (start && end) {
      const diffMs = end.getTime() - start.getTime();
      intervaloDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    let dataLimite = null;
    if (!start && !end && dias) {
      dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - dias);
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          ...(dataLimite ? { gte: dataLimite } : {}),
          ...(start ? { gte: start } : {}),
          ...(end ? { lte: end } : {}),
        },
      },
    });

    // 🔥 Remove pedidos com datas inválidas
    const validOrders = orders.filter(o => o.createdAt && !isNaN(new Date(o.createdAt)));

    if (!validOrders.length) {
      return res.json({
        summary: { revenueMonth: 0, ordersYear: 0, avgTicket: 0 },
        revenueByMonth: [],
        topStores: [],
      });
    }

    const revenueMonth = validOrders.reduce((t, o) => t + (o.totalAmount ?? 0), 0);
    const avgTicket = revenueMonth / validOrders.length;

    const agruparPorDia = intervaloDias && intervaloDias <= 31;

    const revenueMap = {};

    validOrders.forEach((o) => {
      const date = new Date(o.createdAt);

      let chave;

      if (agruparPorDia) {
        chave = date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });
      } else {
        chave = date.toLocaleString("pt-BR", { month: "short" });
      }

      revenueMap[chave] = (revenueMap[chave] || 0) + (o.totalAmount ?? 0);
    });

    let revenueByMonth = Object.entries(revenueMap).map(([label, amount]) => ({
      month: label,
      amount,
    }));

    if (agruparPorDia) {
      revenueByMonth.sort((a, b) => {
        const [diaA, mesA] = a.month.split("/").map(Number);
        const [diaB, mesB] = b.month.split("/").map(Number);

        const dataA = new Date(2025, mesA - 1, diaA);
        const dataB = new Date(2025, mesB - 1, diaB);

        return dataA - dataB;
      });
    } else {
      const ordemMeses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

      revenueByMonth.sort(
        (a, b) =>
          ordemMeses.indexOf(a.month.toLowerCase().replace(".", "")) -
          ordemMeses.indexOf(b.month.toLowerCase().replace(".", ""))
      );
    }

    const storeMap = {};

    validOrders.forEach((o) => {
      if (!o.storeName) return;
      storeMap[o.storeName] =
        (storeMap[o.storeName] || 0) + (o.totalAmount ?? 0);
    });

    const topStores = Object.entries(storeMap).map(([store, amount]) => ({
      store,
      amount,
    }));

    return res.json({
      summary: {
        revenueMonth,
        ordersYear: validOrders.length,
        avgTicket,
      },
      revenueByMonth,
      topStores,
    });
  } catch (err) {
    console.error("❌ ERRO NO DASHBOARD:", err);
    return res.status(500).json({ error: "Erro ao gerar dashboard" });
  }
}
