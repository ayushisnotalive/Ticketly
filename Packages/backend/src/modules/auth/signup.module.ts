import { db } from "../../DB/db.ts";
import { generateAccessToken, generateRefreshToken, storeRefreshToken } from "../../services/tokens.ts";
import type { Request,Response } from "express";
import { SignupSchema } from "../../services/auth.validator.ts";
import { hashPassword } from "../../services/hash.ts";

export const SignupModule = async (req: Request, res: Response) => {
  try {
    const parsed = SignupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const { email, password_hash, role } = parsed.data;

    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rowCount) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await hashPassword(password_hash);
    const { rows } = await db.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, hashedPassword, role]
    );
    const user = rows[0];

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    await storeRefreshToken(user.id, refreshToken);

    return res.status(201).json({ user, accessToken, refreshToken });
  } catch (err: any) {
    if (err.code === "23505") return res.status(409).json({ error: "Email already registered" });
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};