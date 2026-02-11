import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  comparePrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  taxable: z.boolean().default(true),
  trackQuantity: z.boolean().default(true),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  weight: z.coerce.number().min(0).optional(),
  weightUnit: z.string().default("kg"),
});

export const productVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  costPrice: z.coerce.number().min(0).optional(),
  options: z.record(z.string()),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  parentId: z.string().optional(),
  image: z.string().optional(),
});

export const inventoryUpdateSchema = z.object({
  quantity: z.coerce.number().int(),
  type: z.enum(["set", "add", "subtract"]),
  note: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>;
