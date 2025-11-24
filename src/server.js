import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./api/auth/router.js";
import ordersRouter from "./api/orders/router.js";
import dashboardRouter from "./api/dashboard/router.js";
import clientDashboardRouter from "./api/clientDashboard/router.js";
import campaignRouter from "./api/campaign/router.js";
import analyticsRouter from "./api/analytics/router.js";
import clientDashboardRoutes from "./routes/clientDashboardRoutes.js";
import mlRouter from "./api/analytics/ml.router.js";


const app = express();

// 🔹 Middlewares globais
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/campaign", campaignRouter);
app.use("/analytics", analyticsRouter);
app.use("/client-dashboard", clientDashboardRoutes);
app.use("/ml", mlRouter);



// 🔹 Rotas públicas
app.use("/auth", authRouter);

// 🔹 Rotas simplificadas (sem JWT)
app.use("/orders", ordersRouter);
app.use("/dashboard", dashboardRouter);
app.use("/client-dashboard", clientDashboardRouter);

// 🔹 Rota base
app.get("/", (req, res) => {
  res.send("🚀 API Cannoli rodando (sem autenticação JWT)");
});

// 🔹 Inicialização do servidor
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`)
);
