import dotenv from "dotenv/config";
import Express from "express";
import {contextMiddleware} from "./src/middleware/context.req-res.ts"

const app = Express();
const PORT = process.env.PORT || 3000;

app.use(contextMiddleware);





const start = async (): Promise<void>=>{
    try{
        console.log("initialising ticket services")

        await 
    }
}