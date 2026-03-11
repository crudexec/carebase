import { z } from "zod";

const BasicInformationSchema = z.object({
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
  age: z.string().min(1, { message: "Age cannot be empty" }),
  gender: z.string().min(2, { message: "Gender cannot be empty" }),
  fatherName: z.string().min(1, {
    message: "Father name is required and must have at least 1 character",
  }),
  motherName: z.string().min(1, {
    message: "Mother name is required and must have at least 1 character",
  }),
  fatherMobilePhone: z
    .string()
    .min(1, { message: "Father Mobile Phone cannot be empty" }),
  motherMobilePhone: z
    .string()
    .min(1, { message: "Mother Mobile Phone cannot be empty" }),
  state: z.string().min(2, { message: "State cannot be empty" }),
  country: z.string().min(2, { message: "Country cannot be empty" }),
  address: z.string().min(1, {
    message: "Address cannot be empty",
  }),
  cityOrTown: z.string().min(1, {
    message: "City or town cannot be empty",
  }),
  apartmentNumber: z.string().min(1, {
    message: "Apartment number cannot be empty",
  }),
  zipCode: z
    .string()
    .min(1, { message: "Zip code must have at least 1 character" })
    .max(10, { message: "Zip code must not exceed 10 characters" }),
});

const TPInformationSchema = z.object({
  preparedBy: z
    .string()
    .min(1, { message: "TP Prepared By cannot be less than 1 character" }),
  implementedBy: z
    .string()
    .min(1, { message: "TP Implemented By cannot be less than 1 character" }),
  implementationStartDate: z
    .string()
    .min(1, { message: "Implementation Start Date cannot be less than empty" }),
  implementationStopDate: z
    .string()
    .min(1, { message: "Implementation Stop Date cannot be less than empty" }),
});

const AdditionalInformationSchema = z.object({
  backgroundInformation: z.string().min(1, {
    message:
      "Participant Background Information cannot be less than 1 character",
  }),
  behaviour: z.string().min(1, {
    message:
      "Behaviour Intervention Protocol and recommendation cannot be less than 1 character",
  }),
  transportationRequirements: z.string().min(1, {
    message:
      "Transportation requirements and recommendation cannot be less than 1 character",
  }),
});

const GoalSchema = z.object({
  goalArea: z.string().min(2, {
    message: "Goal Area cannot be less than 1 character",
  }),
  targetSkill: z.string().min(2, {
    message: "Target Skill cannot be less than 1 character",
  }),
  shortTermObjective: z.string().min(2, {
    message: "Short Term Objective (STO) cannot be less than 1 character",
  }),
  goalBackground: z.string().min(1, {
    message: "Goal Background cannot be less than 1 character",
  }),
  skillLevel: z.string().min(2, {
    message: "Current Skill Level cannot be less than 1 character",
  }),
  performanceLevel: z.string().min(2, {
    message: "Target Performance Level cannot be less than 1 character",
  }),
  implementationProcedure: z.string().min(2, {
    message: "Implementation Procedure cannot be less than 1 character",
  }),
});

export {
  BasicInformationSchema,
  TPInformationSchema,
  AdditionalInformationSchema,
  GoalSchema,
};

export type BasicInformationType = z.infer<typeof BasicInformationSchema>;
export type TPInformationType = z.infer<typeof TPInformationSchema>;
export type AdditionalInformationType = z.infer<
  typeof AdditionalInformationSchema
>;
export type GoalType = z.infer<typeof GoalSchema>;
