import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.coerce.number().int().min(1),
  price: z.coerce.number().min(0),
});

export const orderSchema = z.object({
  customerId: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  discountCode: z.string().optional(),
  shippingMethod: z.string().optional(),
  shippingAddress: z
    .object({
      address: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      postalCode: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
  source: z.enum(["MANUAL", "ONLINE", "POS"]).default("MANUAL"),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED"]),
});

export const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "MOBILE_MONEY", "WALLET", "OTHER"]),
  reference: z.string().optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
