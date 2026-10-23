import { db } from "../../DB/db.ts";
import { generateAccessToken,generateRefreshToken, storeRefreshToken } from "../../services/tokens.ts";
import type { Request,Response } from "express";
import { LoginSchema } from "../../services/auth.validator.ts";
import { verifyPassword } from "../../services/hash.ts";

export const LoginModule = async(req:Request, res:Response)=>{
    try{
        const parsed = LoginSchema.safeParse(req.body);
        if(!parsed.success){
            return res.status(401).send({
                error:'invalid data'
            });
        }

        const email = parsed.data.email.toLocaleLowerCase();
        const {password_hash} = parsed.data;
        const isExisting = await db.query('SELECT id FROM users WHERE email=$1',[email]);
        if(!isExisting.rowCount){
            return res.status(409).send("user doesn't exists")
        }

        const { rows } = await db.query(
            "SELECT id, email, role, password_hash FROM users WHERE email = $1",
            [email]
            );
        const user = rows[0];

        const ok = user && (await verifyPassword(password_hash, user.password_hash));
        if (!ok) {
            return res.status(401).json({ error: "Invalid email or password" });
            }

        const payload = {id:user.id, email:user.email, role:user.role};
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        await storeRefreshToken(user.id, refreshToken);

        return res.status(200).json({
        user: { id: user.id, email: user.email, role: user.role },
        accessToken,
        refreshToken,});
    

    }

    catch(err:any){
            if (err.code === "23505") return res.status(409).json({ error: "Email already registered" });
            console.error(err);
            return res.status(500).json({ error: "Internal server error" });
    }
}