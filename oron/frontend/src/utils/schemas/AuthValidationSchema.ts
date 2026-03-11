import { z } from "zod";

const SignupSchema = z.object({
  firstName: z
    .string()
    .min(3, { message: "First name must be at least 3 characters long" })
    .max(50, { message: "First name must not exceed 50 characters" }),
  lastName: z
    .string()
    .min(3, { message: "Last name must be at least 3 characters long" })
    .max(50, { message: "Last name must not exceed 50 characters" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "Entered Password must be at least 8 characters long" }),
  confirmPassword: z
    .string()
    .min(8, {
      message: "Confirm Password must be at least 8 characters long",
    }),
});

const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  rememberMe: z.boolean(),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
});

const ResetPasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(8, { message: "First Password must be at least 8 characters long" }),
  newPassword: z
    .string()
    .min(8, { message: "Second Password must be at least 8 characters long" }),
});

export { SignupSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema };

export type SignupFormData = z.infer<typeof SignupSchema>;
export type LoginFormData = z.infer<typeof LoginSchema>;
export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;
