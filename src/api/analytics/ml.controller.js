import prisma from "../../../prismaClient.js";

/* Util: converte dias → nome amigável */
function nomeDoPeriodo(dias) {
  if (dias <= 7) return "Últimos 7 dias";
  if (dias <= 30) return "Últimos 30 dias";
  if (dias <= 90) return "Últimos 3 meses";
  if (dias <= 365) return "Último ano";
  return "Período selecionado";
}

/* ============================================================
   📈 PREVISÃO REAL — SOMA DO PERÍODO COMPLETO
   Regressão linear → prever próximos N dias → somar tudo
============================================================ */
export async function predictRevenue(req, res) {
  try {
    const dias = Number(req.query.dias) || 30;
    const periodoNome = nomeDoPeriodo(dias);

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);

    // Filtro opcional para loja (cliente)
    const storeName = req.query.storeName || undefined;

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: dataLimite },
        ...(storeName && { storeName })
      }
    });

    if (!orders.length) {
      return res.json({
        periodo: periodoNome,
        historico: [],
        previsaoProximoPeriodo: 0
      });
    }

    // Agrupar faturamento diário
    const map = {};
    for (const o of orders) {
      const d = new Date(o.createdAt).toISOString().substring(0, 10);
      map[d] = (map[d] || 0) + (o.totalAmount ?? 0);
    }

    const historico = Object.entries(map).map(([label, amount]) => ({
      label,
      amount
    }));

    // Vetores X e Y para regressão
    const xs = historico.map((_, i) => i);
    const ys = historico.map(h => h.amount);

    const n = xs.length;
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;

    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - meanX) * (ys[i] - meanY);
      den += (xs[i] - meanX) ** 2;
    }

    const m = num / den; // inclinação
    const b = meanY - m * meanX; // intercepto

    // Calcular previsão para vários dias futuros
    let somaPeriodo = 0;

    for (let i = 1; i <= dias; i++) {
      const xFuturo = n + i; // continua a série
      const valorPrevisto = m * xFuturo + b;
      somaPeriodo += Math.max(valorPrevisto, 0); // evitar números negativos
    }

    const previsaoFinal = Number(somaPeriodo.toFixed(2));

    res.json({
      periodo: periodoNome,
      historico,
      previsaoProximoPeriodo: previsaoFinal
    });

  } catch (err) {
    console.error("❌ ERRO IA:", err);
    res.status(500).json({ error: "Erro na previsão da IA" });
  }
}

/* ============================================================
   ⚠️ ANOMALIAS (Z-score)
============================================================ */
export async function detectAnomalies(req, res) {
  try {
    const dias = Number(req.query.dias) || 30;
    const periodoNome = nomeDoPeriodo(dias);

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);

    const storeName = req.query.storeName || undefined;

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: dataLimite },
        ...(storeName && { storeName })
      }
    });

    if (!orders.length) {
      return res.json({ periodo: periodoNome, anomalies: [] });
    }

    const map = {};
    for (const o of orders) {
      const d = new Date(o.createdAt).toISOString().substring(0, 10);
      map[d] = (map[d] || 0) + (o.totalAmount ?? 0);
    }

    const valores = Object.values(map);
    const labels = Object.keys(map);

    const media = valores.reduce((t, v) => t + v, 0) / valores.length;
    const desvio = Math.sqrt(
      valores.map(v => (v - media) ** 2).reduce((a, b) => a + b, 0) /
        valores.length
    );

    const anomalies = valores
      .map((v, i) => {
        const z = (v - media) / (desvio || 1);
        if (Math.abs(z) > 2) {
          return {
            label: labels[i],
            amount: v,
            tipo: z > 0 ? "acima" : "abaixo"
          };
        }
        return null;
      })
      .filter(Boolean);

    res.json({ periodo: periodoNome, anomalies });

  } catch (err) {
    console.error("❌ ERRO IA:", err);
    res.status(500).json({ error: "Erro ao detectar anomalias" });
  }
}
