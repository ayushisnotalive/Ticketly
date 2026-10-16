import type {Request, Response, NextFunction} from "express";
import { AsyncLocalStorage } from "async_hooks";

const storage = new AsyncLocalStorage<{req:Request, res:Response}>();

Object.defineProperty(globalThis,'req',{
    get : ()=>storage.getStore()?.req,
    configurable : true
});

Object.defineProperty(globalThis, 'res',{
    get: ()=>storage.getStore()?.res,
    configurable:true
});

export const contextMiddleware = (req:Request, res:Response, next:NextFunction)=>{
    storage.run({req,res}, ()=>next());
}