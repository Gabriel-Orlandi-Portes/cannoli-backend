import { Router } from "express";
import prisma from "../../prismaClient.js";

const router = Router();

/* 🎯 Vincular login → loja */
const lojaPorCliente = {
  "cliente@gmail.com": "Dona Nuvem Sobremesas",
  "barbosaleandro@cunha.br": "Dona Nuvem Sobremesas",
};

function getStoreByEmail(email) {
  return lojaPorCliente[email] || null;
}

/* ============================================================
   📌 DASHBOARD PRINCIPAL COM FILTROS (IGUAL ADMIN)
   ============================================================ */
router.get("/", async (req, res) => {
  try {
    const email = req.query.email;
    const store = getStoreByEmail(email);

    if (!store)
      return res.status(400).json({ error: "Loja não vinculada a este cliente." });

    const dias = req.query.dias ? Number(req.query.dias) : null;

    const start = req.query.start ? new Date(req.query.start) : null;
    const end = req.query.end ? new Date(req.query.end) : null;

    // Detectar intervalo
    let intervaloDias = dias;
    if (start && end) {
      const diffMs = end.getTime() - start.getTime();
      intervaloDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    // Filtro por datas
    let dataLimite = null;
    if (!start && !end && dias) {
      dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - dias);
    }

    const pedidos = await prisma.order.findMany({
      where: {
        storeName: store,
        createdAt: {
          ...(dataLimite ? { gte: dataLimite } : {}),
          ...(start ? { gte: start } : {}),
          ...(end ? { lte: end } : {}),
        },
      },
      orderBy: { createdAt: "asc" }
    });

    if (!pedidos.length) {
      return res.json({
        summary: {
          name: store,
          totalSpent: 0,
          totalOrders: 0,
          fidelity: "Bronze",
        },
        chartData: [],
        pedidosRecentes: [],
        campanhasRecentes: [],
      });
    }

    /* ===================== KPIs ===================== */
    const totalSpent = pedidos.reduce((s, p) => s + (p.totalAmount || 0), 0);
    const totalOrders = pedidos.length;

    /* ===================== AGRUPAMENTO ===================== */
    const agruparPorDia = intervaloDias && intervaloDias <= 31;

    const map = {};

    pedidos.forEach((p) => {
      const dt = new Date(p.createdAt);

      let chave;
      if (agruparPorDia) {
        chave = dt.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit"
        });
      } else {
        chave = dt.toLocaleString("pt-BR", { month: "short" });
      }

      map[chave] = (map[chave] || 0) + p.totalAmount;
    });

    let chartData = Object.entries(map).map(([month, amount]) => ({
      month,
      amount: Number(amount.toFixed(2)),
    }));

    /* ===================== ORDENAR ===================== */
    if (agruparPorDia) {
      chartData.sort((a, b) => {
        const [d1, m1] = a.month.split("/").map(Number);
        const [d2, m2] = b.month.split("/").map(Number);
        const A = new Date(2025, m1 - 1, d1);
        const B = new Date(2025, m2 - 1, d2);
        return A - B;
      });
    } else {
      const ordem = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
      chartData.sort(
        (a, b) =>
          ordem.indexOf(a.month.toLowerCase()) -
          ordem.indexOf(b.month.toLowerCase())
      );
    }

    /* ===================== ÚLTIMOS PEDIDOS ===================== */
    const pedidosRecentes = [...pedidos]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        store: p.storeName,
        value: p.totalAmount,
        status: p.status,
        date: p.createdAt,
      }));

    /* ===================== CAMPANHAS (FAKE) ===================== */
    const campanhasRecentes = [
      { nome: "Black Friday", tipo: "Desconto 30%", status: "Finalizada" },
      { nome: "Semana Doce", tipo: "Brinde", status: "Ativa" },
    ];

    /* ===================== RESPOSTA ===================== */
    res.json({
      summary: {
        name: store,
        totalSpent,
        totalOrders,
        fidelity: totalOrders > 200 ? "Ouro" : "Prata",
      },
      chartData,
      pedidosRecentes,
      campanhasRecentes,
    });

  } catch (err) {
    console.error("Erro dashboard cliente:", err);
    res.status(500).json({ error: "Erro ao carregar dashboard." });
  }
});

/* ============================================================
   📌 2) LISTA DE PEDIDOS
   ============================================================ */
router.get("/pedidos", async (req, res) => {
  try {
    const email = req.query.email;
    const store = getStoreByEmail(email);

    if (!store)
      return res.status(400).json({ error: "Loja não vinculada." });

    const pedidos = await prisma.order.findMany({
      where: { storeName: store },
      orderBy: { createdAt: "desc" }
    });

    res.json(
      pedidos.map((p) => ({
        id: p.id,
        store: p.storeName,
        value: p.totalAmount,
        date: p.createdAt,
        status: p.status,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar pedidos." });
  }
});

/* ============================================================
   📌 3) PERFIL
   ============================================================ */
router.get("/perfil", async (req, res) => {
  try {
    const email = req.query.email;
    const store = getStoreByEmail(email);

    if (!store)
      return res.status(400).json({ error: "Loja não encontrada." });

    res.json({
      storeName: store,
      address: "Rua das Flores, 123",
      phone: "(11) 99999-9999",
      email,
      createdAt: new Date("2023-05-10")
    });

  } catch (err) {
    res.status(500).json({ error: "Erro no perfil." });
  }
});

/* ============================================================
   📌 4) PROMOÇÕES
   ============================================================ */
router.get("/promocoes", async (req, res) => {
  try {
    const email = req.query.email;
    const store = getStoreByEmail(email);

    if (!store)
      return res.status(400).json({ error: "Loja não vinculada." });

    res.json([
      { nome: "Black Friday", tipo: "Desconto", status: "Finalizada" },
      { nome: "Semana Doce", tipo: "Cupom", status: "Ativa" },
      { nome: "Cliente Fiel", tipo: "Brinde", status: "Ativa" },
    ]);

  } catch (err) {
    res.status(500).json({ error: "Erro promoções." });
  }
});

export default router;
