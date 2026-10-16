import {z} from 'zod';

export const SignupSchema = z.object({
    email: z.string().email(),
    password_hash: z.string().min(1),
    role: z.enum(['user', 'admin'])
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password_hash: z.string().min(1)
});