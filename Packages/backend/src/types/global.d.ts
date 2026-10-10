import {Request,Response} from "express";

declare global{
    const req : Request;
    const res:Response;
}