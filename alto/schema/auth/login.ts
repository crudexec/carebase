import { z } from "zod";

import { InferSchema } from "@/types";

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

export const loginDefaultValues = {
  email: "",
  password: "",
};

export type LoginForm = InferSchema<typeof loginFormSchema>;
