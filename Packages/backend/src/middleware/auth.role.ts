import type { Request,Response,NextFunction } from "express";

export const requireRole = async(...roles:Array<'user'|'admin'>)=>{
    return(req:Request, res:Response, next:NextFunction)=>{
        if(!req.user){
            return res.status(401).json({error:'Not logged in'});
        }

        if(!roles.includes(req.user.role)){
            return res.status(403).json({error:'forbidded'});
        }

        next();
    };

};