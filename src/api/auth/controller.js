import prisma from "../../../prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Senha incorreta" });

    // 🔑 gera token com a mesma secret
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || "cannoli_secret_key",
      { expiresIn: "2h" }
    );

    return res.json({
      token,
      role: user.role,
      name: user.name,
    });
  } catch (error) {
    console.error("❌ Erro no login:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
}
