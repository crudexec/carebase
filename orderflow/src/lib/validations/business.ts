import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("Nigeria"),
  currency: z.string().default("NGN"),
});

export const storeSettingsSchema = z.object({
  storeEnabled: z.boolean().default(true),
  storeDomain: z.string().optional(),
  storeSeoTitle: z.string().optional(),
  storeSeoDesc: z.string().optional(),
  storeTheme: z
    .object({
      primaryColor: z.string().optional(),
      accentColor: z.string().optional(),
      fontFamily: z.string().optional(),
    })
    .optional(),
});

export type BusinessInput = z.infer<typeof businessSchema>;
export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;
