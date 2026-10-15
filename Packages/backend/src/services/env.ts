import {z} from "zod";
import * as dotenv from "dotenv";

dotenv.config({path:require("path").resolve(__dirname,"../.env")});

export const envSchema = z.object({
    DATABASE_URL : z.string()
})

const parsed = envSchema.safeParse(process.env);

if(!parsed.success){
    console.error("Invalid environment variables:", parsed.error.format());
    throw new Error("invalid environmental variable");
}

export const env = parsed.data;

export type User = z.infer<typeof envSchema>;