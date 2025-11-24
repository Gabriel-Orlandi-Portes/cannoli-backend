import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Token não fornecido" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token inválido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "cannoli_secret_key");
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Erro na verificação do token:", error.message);
    return res.status(401).json({ message: "Token expirado ou inválido" });
  }
}
