import { db } from "../../DB/db.ts";
import { generateAccessToken,generateRefreshToken, storeRefreshToken } from "../../services/tokens.ts";
import type { Request,Response } from "express";
import { LoginSchema } from "../../services/auth.validator.ts";
import { verifyPassword } from "../../services/hash.ts";

export const LoginModule = async(req:Request, res:Response)=>{
    try{
        const parsed = LoginSchema.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({ error:"invalid input",details: parsed.error.flatten()})}

        const email = parsed.data.email.toLowerCase();
        const { password_hash: password } = parsed.data;

        const { rows } = await db.query(
            "SELECT id, email, role, password_hash FROM users WHERE email = $1",
            [email]
            );
        const user = rows[0];

        const ok = user && (await verifyPassword(password, user.password_hash));
        if (!ok) {
            return res.status(401).json({ error: "Invalid email or password" });
            }

        const payload = {id:user.id, email:user.email, role:user.role};
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(user.id);
        await storeRefreshToken(user.id, refreshToken);

        return res.status(200).json({
        user: { id: user.id, email: user.email, role: user.role },
        accessToken,
        refreshToken,});
    

    }

    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
        }
}