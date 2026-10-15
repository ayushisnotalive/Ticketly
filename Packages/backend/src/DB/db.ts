import {Pool} from "pg";
import {env} from "../services/env";

export const db = new Pool({
    connectionString : env.DATABASE_URL
})

export async function connectDB() {
    try{
        await db.query("SELECT NOW();");

        console.log("DB connected successfully");
    }catch(e){
        console.log("DB connetion failed...");
        console.log(e);
        process.exit(1);
    }
}