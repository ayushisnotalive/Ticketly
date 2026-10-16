import jwt from 'jsonwebtoken';
import { env } from "./env.ts";
import { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../DB/db.ts';

type TokenPayload = {id:string, email:string,  role: 'user' | 'admin'};

export const generateAccessToken = (payload:TokenPayload)=>{
    return jwt.sign(payload,env.JWT_ACCESS,{expiresIn:env.JWT_ACCESS_EXPIRY as SignOptions['expiresIn']})
}

export const verifyAcessToken = (token:string)=>{
    return jwt.verify(token , env.JWT_ACCESS) as TokenPayload;
}

export const generateRefreshToken = (payload:TokenPayload)=>{
    return jwt.sign(payload,env.JWT_REFRESH,{expiresIn:env.JWT_REFRESH_EXPIRY as SignOptions['expiresIn']})
}

export const verifyRefreshToken = (token:string)=>{
    return jwt.verify(token, env.JWT_REFRESH) as TokenPayload
}

export const HashToken = (token:string)=>{
    return crypto.createHash('sha256').update(token).digest('hex');
}


export const storeRefreshToken = async(id:string, token:string)=>{
    const tokenHash = HashToken(token);
    const {exp} = jwt.decode(token) as {exp:number};
    const expiresAt = new Date(exp * 1000);

    await db.query(`INSERT INTO refresh_tokens (id,token_hash,expires_at)
        VALUES($1,$2,$3)`,
    [id,tokenHash,expiresAt]);
};

export const findRefreshToken = async (token: string) => {
  const { rows } = await db.query(
    `SELECT id, user_id FROM refresh_tokens
     WHERE token_hash = $1 AND expires_at > now()`,
    [HashToken(token)]
  );
  return rows[0] ?? null;
};

export const deleteRefreshToken = async (token: string) => {
  await db.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [
    HashToken(token),
  ]);
};