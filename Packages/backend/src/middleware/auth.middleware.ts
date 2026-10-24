import type { Request, Response, NextFunction } from "express";
import { verifyAcessToken } from "../services/tokens.ts";

export const authorizeMiddleware = async (req:Request, res:Response, next:NextFunction)=>{
    const header = req.headers.authorization;

    if(!header || !header.startsWith('Bearer ')){
        return res.status(401).json({error:'Missing token'});
    }

    const token = header.slice(7);

    try{
        req.user = verifyAcessToken(token);
        next();
    }
    catch{
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}