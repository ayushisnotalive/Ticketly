import {z} from "zod";
import * as dotenv from "dotenv";
import path from "node:path";
import {fileURLToPath} from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({path:path.resolve(currentDirectory, "../../.env")});

export const envSchema = z.object({
    DATABASE_URL : z.string(),
    JWT_ACCESS: z.string().min(1),
    JWT_REFRESH: z.string().min(1),
    JWT_ACCESS_EXPIRY: z.string(),
    JWT_REFRESH_EXPIRY: z.string()
})


const parsed = envSchema.safeParse(process.env);

if(!parsed.success){
    console.error("Invalid environment variables:", parsed.error.format());
    throw new Error("invalid environmental variable");
}

export const env = parsed.data;

export type User = z.infer<typeof envSchema>;