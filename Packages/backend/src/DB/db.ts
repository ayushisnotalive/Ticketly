import {Pool} from "pg";
import {env} from "../services/env.ts";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "node:url";
export const db = new Pool({
    connectionString : env.DATABASE_URL
})

export async function connectDB() {
    const client = await db.connect();

    try{
        const sql = fs.readFileSync(
            path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'SQL/InitialDB.sql'),
            'utf8'
        );

        await client.query("BEGIN");
        await client.query(sql);
        await client.query("COMMIT");
        console.log("DB connected successfully");
    }catch(e){
        await client.query("ROLLBACK").catch(() => undefined);
        console.error("Database connection or initialization failed", e);
        process.exit(1);
    } finally {
        client.release();
    }
}