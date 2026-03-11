// IMPORT AUTH VALIDATOR SCHEMA AND TYPES
import {
  SignupSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  SignupFormData,
  LoginFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from "./AuthValidationSchema";

// IMPORT FORM VALIDATOR SCHEMA AND TYPES
import {
  BiodataSchema,
  BiodataFormData,
  ReferenceFormSchema,
  ReferenceFormData,
  lawfulPermanentCitizenSchema,
  LawfulPermanentCitizenFormData,
  nonCitizenSchema,
  NonCitizenFormData,
  allDocumentSchema,
  AllDocumentType,
  documentASchema,
  DocumentAFormData,
  documentBAndCSchema,
  DocumentBAndCFormData,
  employeeDemographicPersonalInformationSchema,
  EmployeeDemographicPersonalInformationFormData,
  employeeDemographicContactInformationSchema,
  EmployeeDemographicContactInformationFormData,
  pneumococcalVaccinationEmployeeInformationSchema,
  PneumococcalVaccinationEmployeeInformationFormData,
} from "./FormValidationSchema";

// IMPORT INTAKE FORM VALIDATOR SCHEMA AND TYPES
import {
  ClientInformationSchema,
  ClientInformationFormData,
  ReferralInformationSchema,
  ReferralInformationFormData,
  IntakeInformationSchema,
  IntakeInformationFormData,
  ParentContactSchema,
  ParentContactFormData,
  SchoolContactSchema,
  ContactSchema,
  ContactFormData,
  SchoolContactFormData,
  ServiceCordinatorSchema,
  ServiceCordinatorFormData,
  AboutParticipantSchema,
  AboutParticipantFormData,
  MedicalInformationSchema,
  MedicalInformationFormData,
  AdmissionInformationSchema,
  AdmissionInformationFormData,
} from "./IntakeFormValidationSchema";

// IMPORT TREATMENT PLAN FORM VALIDATOR SCHEMA AND TYPES
import {
  BasicInformationSchema,
  BasicInformationType,
  TPInformationSchema,
  TPInformationType,
  AdditionalInformationSchema,
  AdditionalInformationType,
  GoalSchema,
  GoalType,
} from "./TreatmentPlanSchema";

// IMPORT CJIS FORM VALIDATOR SCHEMA AND TYPES
import {
  CJISEmployeeInformationSchema,
  CJISEmployeeInformationType,
} from "./CJISSchema";

// EXPORT CJIS FORM VALIDATOR SCHEMA AND TYPES
export { CJISEmployeeInformationSchema, type CJISEmployeeInformationType };

// EXPORT TREATMENT PLAN FORM VALIDATOR SCHEMA AND TYPES
export {
  BasicInformationSchema,
  type BasicInformationType,
  TPInformationSchema,
  type TPInformationType,
  AdditionalInformationSchema,
  type AdditionalInformationType,
  GoalSchema,
  type GoalType,
};

// EXPORT INTAKE FORM VALIDATOR SCHEMA AND TYPES
export {
  ClientInformationSchema,
  type ClientInformationFormData,
  ReferralInformationSchema,
  type ReferralInformationFormData,
  IntakeInformationSchema,
  type IntakeInformationFormData,
  ParentContactSchema,
  type ParentContactFormData,
  SchoolContactSchema,
  type SchoolContactFormData,
  ContactSchema,
  type ContactFormData,
  ServiceCordinatorSchema,
  type ServiceCordinatorFormData,
  AboutParticipantSchema,
  type AboutParticipantFormData,
  MedicalInformationSchema,
  type MedicalInformationFormData,
  AdmissionInformationSchema,
  type AdmissionInformationFormData,
};

// EXPORT FORM VALIDATOR SCHEMA AND TYPES
export {
  BiodataSchema,
  type BiodataFormData,
  ReferenceFormSchema,
  type ReferenceFormData,
  lawfulPermanentCitizenSchema,
  type LawfulPermanentCitizenFormData,
  nonCitizenSchema,
  type NonCitizenFormData,
  allDocumentSchema,
  type AllDocumentType,
  documentASchema,
  type DocumentAFormData,
  documentBAndCSchema,
  type DocumentBAndCFormData,
  employeeDemographicPersonalInformationSchema,
  type EmployeeDemographicPersonalInformationFormData,
  employeeDemographicContactInformationSchema,
  type EmployeeDemographicContactInformationFormData,
  pneumococcalVaccinationEmployeeInformationSchema,
  type PneumococcalVaccinationEmployeeInformationFormData,
};

// EXPORT AUTH VALIDATOR SCHEMA AND TYPES
export {
  SignupSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  type SignupFormData,
  type LoginFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
};
