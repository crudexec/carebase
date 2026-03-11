import { z } from "zod";

const BiodataSchema = z.object({
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
  phoneNumber: z
    .string()
    .min(12, {
      message: "Phone number is required and must have at least 12 character",
    })
    .max(12, { message: "Phone number must not exceed 12 characters" }),
  address: z.string().min(1, {
    message: "Address is required and must have at least 1 character",
  }),
  apartmentNumber: z.string().optional(),
  cityOrTown: z.string().min(1, {
    message: "City or town cannot be empty",
  }),
  state: z.string().min(2, { message: "State cannot be empty" }),
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

const ReferenceFormSchema = z.object({
  referrer_one_firstname: z.string().min(1, {
    message:
      "Referrer one first name is required and must have at least 1 character",
  }),
  referrer_one_lastname: z.string().min(1, {
    message:
      "Referrer one last name is required and must have at least 1 character",
  }),
  referrer_one_email: z
    .string()
    .email({ message: "Invalid Referrer one email format" }),
  referrer_one_phone: z.string().min(12, {
    message:
      "Referrer one phone number is required and must have at least 12 character",
  }),
  referrer_two_firstname: z.string().min(1, {
    message:
      "Referrer two first name is required and must have at least 1 character",
  }),
  referrer_two_lastname: z.string().min(1, {
    message:
      "Referrer two last name is required and must have at least 1 character",
  }),
  referrer_two_email: z
    .string()
    .email({ message: "Invalid Referrer two email format" }),
  referrer_two_phone: z.string().min(12, {
    message:
      "Referrer two phone number is required and must have at least 12 character",
  }),
  referrer_three_firstname: z.string().min(1, {
    message:
      "Referrer three first name is required and must have at least 1 character",
  }),
  referrer_three_lastname: z.string().min(1, {
    message:
      "Referrer three last name is required and must have at least 1 character",
  }),
  referrer_three_email: z
    .string()
    .email({ message: "Invalid Referrer three email format" }),
  referrer_three_phone: z.string().min(12, {
    message:
      "Referrer three phone number is required and must have at least 12 character",
  }),
});

const lawfulPermanentCitizenSchema = z.object({
  lawfulUscis: z.string().min(1, {
    message: "Your USCIS must have at least 1 character",
  }),
});

const nonCitizenSchema = z.object({
  expDate: z.string().optional(),
  selection: z.union([
    z.object({
      uscis: z.string().min(1, {
        message: "USCIS / A-Number must have at least 1 character",
      }),
    }),
    z.object({
      admissionNo: z.string().min(1, {
        message: "Admission Number must have at least 1 character",
      }),
    }),
    z.object({
      passportNo: z.string().min(1, {
        message: "Passport Number must have at least 1 character",
      }),
    }),
  ]),
});

const allDocumentSchema = z.object({
  documentA: z.string().min(1, {
    message: "Document A field must have at least 1 character",
  }),
  documentAIssuingAuthority: z.string().min(1, {
    message: "Document A Issuing Authority must have at least 1 character",
  }),
  documentADocumentNumber: z.string().optional(),
  documentAExpirationDate: z.string().optional(),
  documentAFile: z.string().min(10, {
    message: "Document A File must be uploaded",
  }),
  documentB: z.string().min(1, {
    message: "Document B field must have at least 1 character",
  }),
  documentBIssuingAuthority: z.string().min(1, {
    message: "Document B Issuing Authority must have at least 1 character",
  }),
  documentBDocumentNumber: z.string().optional(),
  documentBExpirationDate: z.string().optional(),
  documentBFile: z.string().min(10, {
    message: "Document B File must be uploaded",
  }),
  documentC: z.string().min(1, {
    message: "Document C field must have at least 1 character",
  }),
  documentCIssuingAuthority: z.string().min(1, {
    message: "Document C Issuing Authority must have at least 1 character",
  }),
  documentCDocumentNumber: z.string().optional(),
  documentCExpirationDate: z.string().optional(),
  documentCFile: z.string().min(10, {
    message: "Document C File must be uploaded",
  }),
})

const documentASchema = z.object({
  documentA: z.string().min(1, {
    message: "Document A must have at least 1 character",
  }),
  documentAIssuingAuthority: z.string().min(1, {
    message: "Document A Issuing Authority must have at least 1 character",
  }),
  documentADocumentNumber: z.string().optional(),
  documentAExpirationDate: z.string().optional(),
  documentAFile: z.string().min(10, {
    message: "Document A File must be uploaded",
  }),
});

const documentBAndCSchema = z.object({
  documentB: z.string().min(1, {
    message: "Document B must have at least 1 character",
  }),
  documentBIssuingAuthority: z.string().min(1, {
    message: "Document B Issuing Authority must have at least 1 character",
  }),
  documentBDocumentNumber: z.string().optional(),
  documentBExpirationDate: z.string().optional(),
  documentBFile: z.string().min(10, {
    message: "Document B File must be uploaded",
  }),
  documentC: z.string().min(1, {
    message: "Document C must have at least 1 character",
  }),
  documentCIssuingAuthority: z.string().min(1, {
    message: "Document C Issuing Authority must have at least 1 character",
  }),
  documentCDocumentNumber: z.string().optional(),
  documentCExpirationDate: z.string().optional(),
  documentCFile: z.string().min(10, {
    message: "Document C File must be uploaded",
  }),
});

const employeeDemographicPersonalInformationSchema = z.object({
  lastName: z
    .string()
    .min(1, { message: "Last name must be at least 1 character long" }),
  firstName: z
    .string()
    .min(1, { message: "First name must be at least 1 character long" }),
  socialSecurityNumber: z
    .string()
    .min(9, {
      message: "Social security number cannot be less than 9 charcters",
    })
    .max(11, {
      message: "Social security number must not exceed 11 characters",
    }),
  dateOfBirth: z.string().min(1, { message: "Date of birth cannot be empty" }),
  cellPhoneNumber: z
    .string()
    .min(12, { message: "Cell phone number must be at least 12 character long" }),
  homePhoneNumber: z
    .string()
    .min(12, { message: "Home phone number must be at least 12 character long" }),
  address: z
    .string()
    .min(1, { message: "Address must be at least 1 character long" }),
  cityOrTown: z
    .string()
    .min(1, { message: "City or town must be at least 1 character long" }),
  state: z
    .string()
    .min(2, { message: "State must be at least 1 character long" }),
  zipCode: z
    .string()
    .min(1, { message: "Zip code must be at least 1 character long" }),
  race: z
    .string()
    .min(1, { message: "Race must be at least 1 character long" }),
  gender: z
    .string()
    .min(1, { message: "Gender must be at least 1 character long" }),
});

const employeeDemographicContactInformationSchema = z.object({
  lastName: z
    .string()
    .min(1, { message: "Last name must be at least 1 character long" }),
  firstName: z
    .string()
    .min(1, { message: "First name must be at least 1 character long" }),
  cellPhoneNumber: z
    .string()
    .min(1, { message: "Cell phone number must be at least 1 character long" }),
  relationshipToEmployee: z.string().min(1, {
    message: "Relationship to employee must be at least 1 character long",
  }),
  address: z
    .string()
    .min(1, { message: "Address must be at least 1 character long" }),
  cityOrTown: z
    .string()
    .min(1, { message: "City or town must be at least 1 character long" }),
  state: z
    .string()
    .min(2, { message: "State must be at least 1 character long" }),
  zipCode: z
    .string()
    .min(1, { message: "Zip code must be at least 1 character long" }),
});

const pneumococcalVaccinationEmployeeInformationSchema = z.object({
  lastName: z
    .string()
    .min(1, { message: "Last name must be at least 1 character long" }),
  firstName: z
    .string()
    .min(1, { message: "First name must be at least 1 character long" }),
  jobTitle: z
    .string()
    .optional(),
  todayDate: z
  .string()
  .optional()
});

export {
  BiodataSchema,
  ReferenceFormSchema,
  lawfulPermanentCitizenSchema,
  nonCitizenSchema,
  allDocumentSchema,
  documentASchema,
  documentBAndCSchema,
  employeeDemographicPersonalInformationSchema,
  employeeDemographicContactInformationSchema,
  pneumococcalVaccinationEmployeeInformationSchema,
};

export type BiodataFormData = z.infer<typeof BiodataSchema>;
export type ReferenceFormData = z.infer<typeof ReferenceFormSchema>;
export type LawfulPermanentCitizenFormData = z.infer<
  typeof lawfulPermanentCitizenSchema
>;
export type NonCitizenFormData = z.infer<typeof nonCitizenSchema>;
export type AllDocumentType = z.infer<typeof allDocumentSchema>;
export type DocumentAFormData = z.infer<typeof documentASchema>;
export type DocumentBAndCFormData = z.infer<typeof documentBAndCSchema>;
export type EmployeeDemographicPersonalInformationFormData = z.infer<
  typeof employeeDemographicPersonalInformationSchema
>;
export type EmployeeDemographicContactInformationFormData = z.infer<
  typeof employeeDemographicContactInformationSchema
>;
export type PneumococcalVaccinationEmployeeInformationFormData = z.infer<
  typeof pneumococcalVaccinationEmployeeInformationSchema
>;
