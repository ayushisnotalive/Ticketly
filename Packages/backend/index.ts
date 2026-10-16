import Express from "express";
import {contextMiddleware} from "./src/middleware/context.req-res.ts"
import {connectDB} from './src/DB/db.ts';

const app = Express();
const PORT = process.env.PORT || 3000;

app.use(contextMiddleware);





const start = async (): Promise<void> => {
    try{
        console.log("initialising ticket services");
        await connectDB();
        app.listen(PORT,()=>{
            console.log(`server is running on PORT : ${PORT}`);
        });
    } catch (e) {
        console.error("Server startup failed", e);
        process.exitCode = 1;
    }
};

void start();