import { z } from "zod";

import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/constants";
import { InferSchema } from "@/types";

export const createUserFormSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Email is required",
    })
    .email({
      message: "Invalid email address",
    }),
  firstName: z.string().min(1, {
    message: "First Name is required",
  }),
  lastName: z.string().min(1, {
    message: "Last Name is required",
  }),
  middleName: z.string().optional(),
  licenseNo: z.string().optional(),
  service: z.string().optional(),
  jobTitle: z.string().optional(),
  taxonomy: z.string().optional(),
  taxonomyCode: z.string().optional(),
  notes: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  homePhone: z.string().optional(),
  cellPhone: z.string().optional(),
  fax: z.string().optional(),
  memo: z.string().optional(),
  image: z
    .any()
    .refine((file) => {
      if (!file || (typeof file === "string" && file.includes("http")))
        return true;
      return file?.size <= MAX_IMAGE_SIZE;
    }, `Max image size is 5MB.`)
    .refine((file) => {
      if (!file || (typeof file === "string" && file.includes("http")))
        return true;
      return (
        ACCEPTED_IMAGE_TYPES.includes(file?.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported."
      );
    }),
});

export const userDefaultValues = {
  email: "",
  firstName: "",
  lastName: "",
  middleName: "",
  licenseNo: "",
  service: "",
  jobTitle: "",
  taxonomy: "",
  taxonomyCode: "",
  notes: "",
  addressLine1: "",
  addressLine2: "",
  state: "",
  country: "",
  city: "",
  postalCode: "",
  homePhone: "",
  cellPhone: "",
  fax: "",
  memo: "",
  image: "",
};

export type UserForm = InferSchema<typeof createUserFormSchema>;
