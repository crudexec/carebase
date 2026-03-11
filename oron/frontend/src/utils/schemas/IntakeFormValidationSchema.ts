import { z } from "zod";

const ClientInformationSchema = z.object({
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
  sex: z.string().min(1, {
    message: "Sex cannot be empty",
  }),
  dateOfBirth: z.string().min(1, { message: "Date of birth cannot be empty" }),
  country: z.string().min(2, { message: "Country cannot be empty" }),
  race: z.string().min(1, { message: "Race cannot be empty" }),
  socialSecurityNumber: z
    .string()
    .min(1, {
      message: "Social security number cannot be less than 9 charcters",
    })
    .max(11, {
      message: "Social security number must not exceed 11 characters",
    }),
  medicaidNumber: z
    .string()
    .min(1, { message: "Medicaid Number cannot be empty" }),
  state: z.string().min(1, { message: "State cannot be empty" }),
});

const ReferralInformationSchema = z.object({
  dateOfReferral: z
    .string()
    .min(1, { message: "Date of Referral cannot be empty" }),
  referralType: z.string().min(1, { message: "Referral Type cannot be empty" }),
  referralSourceName: z
    .string()
    .min(1, { message: "Referral Source Name cannot be empty" }),
});

const IntakeInformationSchema = z.object({
  whoConductedTheIntake: z
    .string()
    .min(1, { message: "Who conducted the intake cannot be empty" }),
  dateOfIntake: z
    .string()
    .min(1, { message: "Date of intake cannot be empty" }),
});

const MotherContactSchema = z.object({
  contactFirstName: z
    .string()
    .min(1, { message: "Mother Contact First Name cannot be empty" }),
  contactLastName: z
    .string()
    .min(1, { message: "Mother Contact Last Name cannot be empty" }),
  relationship: z
    .string()
    .min(1, { message: "Mother Relationship cannot be empty" }),
  email: z.string().email({ message: "Invalid mother email format" }),
  streetAddress: z.string().min(1, {
    message: "Mother Street Number & House Address cannot be empty",
  }),
  country: z.string().min(2, { message: "Mother Country cannot be empty" }),
  state: z.string().min(2, { message: "Mother State cannot be empty" }),
  city: z.string().min(1, { message: "Mother City cannot be empty" }),
  apartmentNumber: z
    .string()
    .min(1, { message: "Mother Apartment Number cannot be empty" }),
  zipCode: z.string().min(1, { message: "Mother Zip Code cannot be empty" }),
  cellPhone: z
    .string()
    .min(1, { message: "Mother Cell Phone cannot be empty" }),
  homePhone: z
    .string()
    .min(1, { message: "Mother Home Phone cannot be empty" }),
  workPhone: z
    .string()
    .min(1, { message: "Mother Work Phone cannot be empty" }),
});

const FatherContactSchema = z.object({
  contactFirstName: z
    .string()
    .min(1, { message: "Father Contact First Name cannot be empty" }),
  contactLastName: z
    .string()
    .min(1, { message: "Father Contact Last Name cannot be empty" }),
  relationship: z
    .string()
    .min(1, { message: "Father Relationship cannot be empty" }),
  email: z.string().email({ message: "Invalid father email format" }),
  streetAddress: z.string().min(1, {
    message: "Father Street Number & House Address cannot be empty",
  }),
  country: z.string().min(2, { message: "Father Country cannot be empty" }),
  state: z.string().min(2, { message: "Father State cannot be empty" }),
  city: z.string().min(1, { message: "Father City cannot be empty" }),
  apartmentNumber: z
    .string()
    .min(1, { message: "Father Apartment Number cannot be empty" }),
  zipCode: z.string().min(1, { message: "Father Zip Code cannot be empty" }),
  cellPhone: z
    .string()
    .min(1, { message: "Father Cell Phone cannot be empty" }),
  homePhone: z
    .string()
    .min(1, { message: "Father Home Phone cannot be empty" }),
  workPhone: z
    .string()
    .min(1, { message: "Father Work Phone cannot be empty" }),
});

const ParentContactSchema = z.object({
  contactFirstName: z
    .string()
    .min(1, { message: "Emergency Contact First Name cannot be empty" }),
  contactLastName: z
    .string()
    .min(1, { message: "Emergency Contact Last Name cannot be empty" }),
  relationship: z
    .string()
    .min(1, { message: "Emergency Relationship cannot be empty" }),
  email: z.string().email({ message: "Invalid emergency email format" }),
  streetAddress: z.string().min(1, {
    message: "Emergency Street Number & House Address cannot be empty",
  }),
  country: z.string().min(2, { message: "Emergency Country cannot be empty" }),
  state: z.string().min(2, { message: "Emergency State cannot be empty" }),
  city: z.string().min(1, { message: "Emergency City cannot be empty" }),
  apartmentNumber: z
    .string()
    .min(1, { message: "Emergency Apartment Number cannot be empty" }),
  zipCode: z.string().min(1, { message: "Emergency Zip Code cannot be empty" }),
  cellPhone: z
    .string()
    .min(1, { message: "Emergency Cell Phone cannot be empty" }),
  homePhone: z
    .string()
    .min(1, { message: "Emergency Home Phone cannot be empty" }),
  workPhone: z
    .string()
    .min(1, { message: "Emergency Work Phone cannot be empty" }),
});

const SchoolContactSchema = z.object({
  nameOfSchool: z
    .string()
    .min(1, { message: "Name of School cannot be empty" }),
  schoolAddress: z
    .string()
    .min(1, { message: "School Address cannot be empty" }),
  telephone: z.string().min(1, { message: "Telephone cannot be empty" }),
  emailAddress: z.string().email({ message: "Invalid school email format" }),
  contactPerson: z
    .string()
    .min(1, { message: "Contact Person cannot be empty" }),
});

const ContactSchema = z.object({
  motherContact: MotherContactSchema,
  fatherContact: FatherContactSchema,
  emergencyContact: ParentContactSchema,
  schoolContact: SchoolContactSchema,
});

const ServiceCordinatorSchema = z.object({
  fullname: z.string().min(1, { message: "Full name cannot be empty" }),
  email: z.string().email({ message: "Invalid email format" }),
  phoneNumber: z.string().min(1, { message: "Phone number cannot be empty" }),
  country: z.string().min(2, { message: "Country cannot be empty" }),
  faxNumber: z.string().min(1, { message: "Fax number cannot be empty" }),
});

const AboutParticipantSchema = z.object({
  strengths: z.string().optional(),
  thingsINeedHelpWith: z.string().optional(),
  newSkillsToLearn: z.string().optional(),
  hobbies: z.string().optional(),
  favoriteFood: z.string().optional(),
  whatMakesMeMad: z.string().optional(),
  behaviorsDisplayed: z.string().optional(),
  behaviorManagement: z.string().optional(),
  houseRules: z.string().optional(),
  transportAlone: z.string().optional(),
  toileting: z.string().optional(),
  preferredCareBy: z.string().optional(),
  intakeDocument: z.string().optional(),
  performanceReward: z.string().optional(),
  otherComments: z.string().optional(),
});

const MedicalInformationSchema = z.object({
  diagnosis: z.string().optional(),
  medicalHistoryAllergies: z.string().optional(),
  medications: z.string().optional(),
  otherComments: z.string().optional(),
});

const AdmissionInformationSchema = z.object({
  pocAuthorizationNumber: z
    .string()
    .min(1, { message: "POC Authorization Number cannot be empty" }),
  pocStartDate: z
    .string()
    .min(1, { message: "POC Start Date cannot be empty" }),
  pocEndDate: z.string().min(1, {
    message: "POC End Date (Day before recertification) cannot be empty",
  }),
});

export {
  ClientInformationSchema,
  ReferralInformationSchema,
  IntakeInformationSchema,
  ParentContactSchema,
  SchoolContactSchema,
  ContactSchema,
  ServiceCordinatorSchema,
  AboutParticipantSchema,
  MedicalInformationSchema,
  AdmissionInformationSchema,
};

export type ClientInformationFormData = z.infer<typeof ClientInformationSchema>;
export type ReferralInformationFormData = z.infer<
  typeof ReferralInformationSchema
>;
export type IntakeInformationFormData = z.infer<typeof IntakeInformationSchema>;
export type ParentContactFormData = z.infer<typeof ParentContactSchema>;
export type SchoolContactFormData = z.infer<typeof SchoolContactSchema>;
export type ContactFormData = z.infer<typeof ContactSchema>;
export type ServiceCordinatorFormData = z.infer<typeof ServiceCordinatorSchema>;
export type AboutParticipantFormData = z.infer<typeof AboutParticipantSchema>;
export type MedicalInformationFormData = z.infer<
  typeof MedicalInformationSchema
>;
export type AdmissionInformationFormData = z.infer<
  typeof AdmissionInformationSchema
>;
