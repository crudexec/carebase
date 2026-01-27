import { z } from "zod";

import { InferSchema } from "@/types";

export const PhysicianSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().optional().nullable(),
  upin: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  fax: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  npi: z.string().optional().nullable(),
  admission: z.date().optional().nullable(),
  discharge: z.date().optional().nullable(),
  soc: z.date().optional().nullable(),
  M0030_SOC: z.date().optional().nullable(),
  hospital: z.string().optional().nullable(),
});

export const patientAdmissionFormSchema = z
  .object({
    firstName: z.string().optional(),
    middleInitial: z.string().optional(),
    lastName: z.string().optional(),
    dob: z.date().optional().nullable(),
    ssn: z.string().optional(),
    phone: z.string().optional(),
    medicaidNumber: z.string().optional(),
    medicareNumber: z.string().optional(),
    notMedicareNumber: z.boolean().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    gender: z.string().optional(),
    maritalStatus: z.string().optional(),
    workersComp: z.string().optional(),
    race: z.string().optional(),
    referralSource: z.string().optional(),
    physician: PhysicianSchema.optional(),
    dme: z.string().optional(),
    dmeSupplies: z.string().optional(),
    suffix: z.string().optional(),
    controlNumber: z.string().optional(),
    admissionSOC: z.date().optional().nullable(),
    CBSACode: z.string().optional(),
    admissionSource: z.string().optional(),
    admissionPriority: z.string().optional(),
    authorizationNumber: z.string().optional(),
    employmentStatus: z.string().optional(),
    faceToFace: z.date().optional().nullable(),
    taxonomy: z.string().optional(),
    taxonomyCode: z.string().optional(),
    conditionRelation: z.array(z.string()).optional(),
    sharePatient: z.boolean().optional(),
    supervisingPhysician: z.string().optional().nullable(),
    supervisingPhysicianNpi: z.string().optional().nullable(),
    student: z.string().optional(),
    county: z.string().optional(),
    notAPhysician: z.boolean().optional(),
    autoAccidentState: z.string().optional().nullable(),
    MEDICARE: z
      .object({
        id: z.string().optional().nullable(),
        status: z.boolean().optional(),
        daysPerEpisode: z.string().min(1, {
          message: "days per episode is a required field",
        }),
        serviceRequired: z.array(z.string()).optional(),
      })
      .optional(),
    NON_MEDICARE: z
      .object({
        id: z.string().optional().nullable(),
        status: z.boolean().optional(),
        daysPerEpisode: z.string().min(1, {
          message: "days per episode is a required field",
        }),
        noOfVisitAuthorized: z.string().optional().nullable(),
        serviceRequired: z.array(z.string()).optional(),
        company: z.string().optional().nullable(),
        payerId: z.string().optional().nullable(),
        insuredId: z.string().optional().nullable(),
        clearingClaims: z.string().optional().nullable(),
      })
      .optional(),
    MANAGED_CARE: z
      .object({
        id: z.string().optional().nullable(),
        status: z.boolean().optional(),
        daysPerEpisode: z.string().min(1, {
          message: "days per episode is a required field",
        }),
        noOfVisitAuthorized: z.string().optional().nullable(),
        serviceRequired: z.array(z.string()).optional(),
        company: z.string().optional().nullable(),
        payerId: z.string().optional().nullable(),
        insuredId: z.string().optional().nullable(),
        clearingClaims: z.string().optional().nullable(),
      })
      .optional(),
    CMS: z
      .object({
        id: z.string().optional().nullable(),
        status: z.boolean().optional(),
        daysPerEpisode: z.string().min(1, {
          message: "days per episode is a required field",
        }),
        serviceRequired: z.array(z.string()).optional(),
        company: z.string().optional().nullable(),
        payerId: z.string().optional().nullable(),
        clearingClaims: z.string().optional().nullable(),
      })
      .optional(),
    HOSPICE: z
      .object({
        id: z.string().optional().nullable(),
        status: z.boolean().optional(),
        daysPerEpisode: z.string().min(1, {
          message: "days per episode is a required field",
        }),
        serviceRequired: z.array(z.string()).optional(),
      })
      .optional(),
    caregiver: z.string().min(1, {
      message: "caregiver is a required field",
    }),
  })
  .refine((args) => (args.ssn ? args.ssn.length === 4 : true), {
    message: "SSN should be 4 digits",
    path: ["ssn"],
  });

export type PhysicianForm = InferSchema<typeof PhysicianSchema>;

export type PatientAdmissionForm = InferSchema<
  typeof patientAdmissionFormSchema
>;
export const physicianDefaultValue: PhysicianForm = {
  id: "",
  firstName: "",
  lastName: "",
  upin: "",
  phone: "",
  fax: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  npi: "",
  admission: undefined,
  discharge: undefined,
  soc: undefined,
  M0030_SOC: undefined,
  hospital: "",
};

export const patientAdmissionDefaultValue: PatientAdmissionForm = {
  firstName: "",
  middleInitial: "",
  lastName: "",
  dob: undefined,
  ssn: "",
  phone: "",
  medicaidNumber: "",
  medicareNumber: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  country: "",
  zip: "",
  gender: "",
  maritalStatus: "",
  workersComp: "",
  race: "",
  referralSource: "",
  dme: "",
  dmeSupplies: "",
  suffix: "",
  controlNumber: "",
  admissionSOC: undefined,
  CBSACode: "",
  admissionSource: "",
  admissionPriority: "",
  authorizationNumber: "",
  employmentStatus: "",
  faceToFace: undefined,
  taxonomy: "",
  taxonomyCode: "",
  conditionRelation: [],
  sharePatient: false,
  supervisingPhysician: "",
  supervisingPhysicianNpi: "",
  notMedicareNumber: false,
  notAPhysician: false,
  physician: physicianDefaultValue,
  autoAccidentState: "",
  MEDICARE: {
    status: false,
    daysPerEpisode: "30",
    serviceRequired: [],
  },
  NON_MEDICARE: {
    status: false,
    daysPerEpisode: "30",
    noOfVisitAuthorized: "",
    serviceRequired: [],
    company: "",
    payerId: "",
    insuredId: "",
    clearingClaims: "",
  },
  MANAGED_CARE: {
    status: false,
    daysPerEpisode: "30",
    noOfVisitAuthorized: "",
    serviceRequired: [],
    company: "",
    payerId: "",
    insuredId: "",
    clearingClaims: "",
  },
  CMS: {
    status: false,
    daysPerEpisode: "30",
    serviceRequired: [],
    company: "",
    payerId: "",
    clearingClaims: "",
  },
  HOSPICE: {
    status: false,
    daysPerEpisode: "30",
    serviceRequired: [],
  },
  caregiver: "",
};
