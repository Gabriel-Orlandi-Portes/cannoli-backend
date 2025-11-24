import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cannoli_secret_key";

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token ausente." });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token inválido." });
    req.user = decoded;
    next();
  });
}

// Para proteger rotas de admin
export function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado: apenas administradores." });
    }
    next();
  });
}
