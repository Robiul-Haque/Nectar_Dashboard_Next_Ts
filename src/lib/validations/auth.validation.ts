import { z } from "zod";

export const adminLoginSchema = z.object({
    email: z
        .email("Invalid email address"),

    password: z
        .string()
        .min(6, "Password minimum 6 characters"),
});

export type AdminLoginInput =
    z.infer<typeof adminLoginSchema>;