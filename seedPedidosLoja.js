import prisma from "./prismaClient.js";

// Ticket médio baixo para lojas médias: R$ 20 a 35
function randomValue() {
  return Number((Math.random() * 15 + 20).toFixed(2));
}

// Quantidade de pedidos necessária para bater 50k–70k/ano
// Ticket ~ R$ 27 => precisa de 1800–2600 pedidos anuais
function randomOrderCount() {
  return Math.floor(Math.random() * 800) + 1800; 
}

function randomDateThisYear() {
  const start = new Date(new Date().getFullYear(), 0, 1).getTime();
  const end = Date.now();
  return new Date(start + Math.random() * (end - start));
}

function randomChannel() {
  const c = ["IFOOD", "WHATSAPP", "SITE", "DELIVERYVIP"];
  return c[Math.floor(Math.random() * c.length)];
}

function randomStatus() {
  const s = ["CONCLUÍDO", "ENTREGUE", "CANCELADO", "CONFIRMADO"];
  return s[Math.floor(Math.random() * s.length)];
}

async function main() {
  const loja = "Dona Nuvem Sobremesas";

  console.log(`🧹 Limpando pedidos da loja: ${loja}`);
  await prisma.order.deleteMany({ where: { storeName: loja } });

  const qtd = randomOrderCount();
  console.log(`🛠 Criando ${qtd} pedidos para faturamento ~50k–70k/ano`);

  for (let i = 0; i < qtd; i++) {
    const date = randomDateThisYear();

    await prisma.order.create({
      data: {
        id: crypto.randomUUID(),
        displayId: String(Math.floor(Math.random() * 90000) + 10000),
        companyId: crypto.randomUUID(),
        customerId: crypto.randomUUID(),

        customerName: "Cliente Simulado",
        customerEmail: "cliente@exemplo.com",
        storeName: loja,

        totalAmount: randomValue(),
        salesChannel: randomChannel(),
        status: randomStatus(),

        createdAt: date,
        updatedAt: date,
      },
    });
  }

  console.log("✔ Seed finalizado → Lojas agora faturam 50k–70k/ano");
}

main().finally(() => process.exit());
