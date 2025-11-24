import express from "express";
import prisma from "../../core/db.js";

const router = express.Router();

/**
 * GET /orders
 * Lista pedidos com filtros opcionais
 * Exemplo: /orders?channel=IFOOD&status=CONCLUDED&from=2000-01-01&to=2000-02-01&page=1&limit=20
 */
router.get("/", async (req, res) => {
  try {
    const { channel, status, from, to, page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (channel) where.salesChannel = String(channel);
    if (status) where.status = String(status);
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }
    if (search) {
      where.OR = [
        { displayId: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { storeName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      data,
    });
  } catch (err) {
    console.error("Erro ao buscar pedidos:", err);
    res.status(500).json({ error: "Erro interno ao buscar pedidos" });
  }
});

export default router;
