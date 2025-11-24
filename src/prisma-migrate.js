import { exec } from "child_process";

exec("npx prisma migrate deploy", (err, stdout, stderr) => {
  if (err) {
    console.error("❌ Erro ao rodar migrations:", stderr);
    return;
  }
  console.log("🚀 Migrations rodadas com sucesso!");
  console.log(stdout);
});
