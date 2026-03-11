import { z } from "zod";

export const BiodataSchema = z.object({
  lastName: z
    .string()
    .min(1, {
      message: "Last name is required and must have at least 1 character",
    })
    .max(50, { message: "Last name must not exceed 50 characters" }),
  firstName: z
    .string()
    .min(1, {
      message: "First name is required and must have at least 1 character",
    })
    .max(50, { message: "First name must not exceed 50 characters" }),
  middleName: z.string().optional(),
  otherLastName: z.string().optional(),
  email: z.string().email({ message: "Invalid email format" }),
  phoneNumber: z.string().min(17, {
    message: "Phone number is required and must have at least 12 character",
  }),
  address: z.string().min(1, {
    message: "Address is required and must have at least 1 character",
  }),
  apartmentNumber: z.string().optional(),
  city: z.string().min(1, {
    message: "City cannot be empty",
  }),
  state: z.string().min(2, { message: "State cannot be empty" }),
  npi: z.string().optional(),
  lba: z.string().optional(),
  zipCode: z
    .string()
    .min(1, { message: "Zip code must have at least 1 character" })
    .max(10, { message: "Zip code must not exceed 10 characters" }),
  socialSecurityNumber: z
    .string()
    .min(9, {
      message: "Social security number cannot be less than 9 charcters",
    })
    .max(11, {
      message: "Social security number must not exceed 11 characters",
    }),
});

export type BiodataType = z.infer<typeof BiodataSchema>;
