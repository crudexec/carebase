import {
  FormattedFormStatus,
  GeneratedFormDate,
  GeneratedFormStatus,
  GeneratedFormStatusWithIndex,
} from "@/types/form-types/FormTypes";
import {
  getBiodataFormStatus,
  getReferenceFormStatus,
  getI9FormStatus,
  getEmployeeDemographicFormStatus,
  getTbFormStatus,
  getPneumococcalVaccinationFormStatus,
  getHepatitisVaccinationFormStatus,
  getVaricellaVaccineFormStatus,
  getMmrVaccineFormStatus,
  getFluVaccineFormStatus,
  getCJISFormStatus,
} from "./form-status-checker";
import {
  getBiodataFormCreatedDate,
  getCJISFormCreatedDate,
  getEmployeeDemographicFormCreatedDate,
  getFluVaccineFormCreatedDate,
  getHepatitisVaccinationFormCreatedDate,
  getI9FormCreatedDate,
  getMmrVaccineFormCreatedDate,
  getPneumococcalVaccinationFormCreatedDate,
  getReferenceFormCreatedDate,
  getTbFormCreatedDate,
  getVaricellaVaccineFormCreatedDate,
} from "./form-created-date";
import {
  getBiodataFormSubmittedDate,
  getCJISFormSubmittedDate,
  getEmployeeDemographicFormSubmittedDate,
  getFluVaccineFormSubmittedDate,
  getHepatitisVaccinationFormSubmittedDate,
  getI9FormSubmittedDate,
  getMmrVaccineFormSubmittedDate,
  getPneumococcalVaccinationFormSubmittedDate,
  getReferenceFormSubmittedDate,
  getTbFormSubmittedDate,
  getVaricellaVaccineFormSubmittedDate,
} from "./form-submitted-date";
import {
  getBiodataFormID,
  getCJISFormID,
  getEmployeeDemographicFormID,
  getFluVaccineFormID,
  getHepatitisVaccinationFormID,
  getI9FormID,
  getMmrVaccineFormID,
  getPneumococcalVaccinationFormID,
  getReferenceFormID,
  getTbFormID,
  getVaricellaVaccineFormID,
} from "./form-id-checker";
import {
  calculateBiodataProgress,
  calculateCJISFormProgress,
  calculateEmployeeDemographicProgress,
  calculateFluVaccineProgress,
  calculateHepatitisVaccinationProgress,
  calculateI9Progress,
  calculateMmrVaccineProgress,
  calculatePneumococcalVaccinationProgress,
  calculateReferenceProgress,
  calculateTbFormProgress,
  calculateVaricellaVaccineProgress,
} from "./form-progress-calculator";

// Constants
const FORM_KEYS = [
  "biodata",
  "refForm",
  "i9",
  "employeeDemographic",
  "tbForm",
  "pneumococcalVaccination",
  "hepatitisVaccination",
  "varicellaVaccine",
  "mmrVaccine",
  "fluVaccine",
  "cjisAttestation",
] as const;

// Mappers
export const mapFormStatus = (
  forms: Record<string, any>[],
  admin: boolean
): GeneratedFormStatus => {
  const statusGetters = [
    getBiodataFormStatus,
    getReferenceFormStatus,
    getI9FormStatus,
    getEmployeeDemographicFormStatus,
    getTbFormStatus,
    getPneumococcalVaccinationFormStatus,
    getHepatitisVaccinationFormStatus,
    getVaricellaVaccineFormStatus,
    getMmrVaccineFormStatus,
    getFluVaccineFormStatus,
    getCJISFormStatus,
  ];

  return statusGetters.reduce((acc, getter, index) => {
    acc[FORM_KEYS[index]] = getter(forms[index], admin);
    return acc;
  }, {} as GeneratedFormStatus);
};

export const mapFormCreatedDate = (
  forms: Record<string, any>[],
  admin: boolean
): GeneratedFormDate => {
  const dateGetters = [
    getBiodataFormCreatedDate,
    getReferenceFormCreatedDate,
    getI9FormCreatedDate,
    getEmployeeDemographicFormCreatedDate,
    getTbFormCreatedDate,
    getPneumococcalVaccinationFormCreatedDate,
    getHepatitisVaccinationFormCreatedDate,
    getVaricellaVaccineFormCreatedDate,
    getMmrVaccineFormCreatedDate,
    getFluVaccineFormCreatedDate,
    getCJISFormCreatedDate,
  ];

  return dateGetters.reduce((acc, getter, index) => {
    acc[FORM_KEYS[index]] = getter(forms[index], admin);
    return acc;
  }, {} as GeneratedFormDate);
};

export const mapFormSubmittedDate = (
  forms: Record<string, any>[],
  admin: boolean
): GeneratedFormDate => {
  const submittedDateGetters = [
    getBiodataFormSubmittedDate,
    getReferenceFormSubmittedDate,
    getI9FormSubmittedDate,
    getEmployeeDemographicFormSubmittedDate,
    getTbFormSubmittedDate,
    getPneumococcalVaccinationFormSubmittedDate,
    getHepatitisVaccinationFormSubmittedDate,
    getVaricellaVaccineFormSubmittedDate,
    getMmrVaccineFormSubmittedDate,
    getFluVaccineFormSubmittedDate,
    getCJISFormSubmittedDate,
  ];

  return submittedDateGetters.reduce((acc, getter, index) => {
    acc[FORM_KEYS[index]] = getter(forms[index], admin);
    return acc;
  }, {} as GeneratedFormDate);
};

export const mapFormProgress = (
  forms: Record<string, any>[],
  admin: boolean
): GeneratedFormDate => {
  const formProgress: Partial<GeneratedFormDate> = {};

  forms.forEach((form, index) => {
    formProgress[getFieldName(index)] = getFormProgress(form, index + 1, admin);
  });

  return formProgress as GeneratedFormDate;
};

export const mapFormIds = (
  forms: Record<string, any>[],
  admin: boolean
): GeneratedFormDate => {
  const idGetters = [
    getBiodataFormID,
    getReferenceFormID,
    getI9FormID,
    getEmployeeDemographicFormID,
    getTbFormID,
    getPneumococcalVaccinationFormID,
    getHepatitisVaccinationFormID,
    getVaricellaVaccineFormID,
    getMmrVaccineFormID,
    getFluVaccineFormID,
    getCJISFormID,
  ];

  return idGetters.reduce((acc, getter, index) => {
    acc[FORM_KEYS[index]] = getter(forms[index], admin);
    return acc;
  }, {} as GeneratedFormDate);
};

export const filterCompletedForms = (
  forms: Record<string, any>[],
  admin: boolean
): Record<string, any>[] => {
  const completedForms: Record<string, any>[] = [];
  const formStatus = mapFormStatus(forms, admin);

  Object.keys(formStatus).forEach((key) => {
    if ((formStatus as GeneratedFormStatusWithIndex)[key] === "Approved") {
      completedForms.push(forms[parseInt(key)]);
    }
  });

  return completedForms;
};

const getFormProgress = (
  form: Record<string, any>,
  id: number,
  admin: boolean
): string => {
  const progressCalculators = [
    calculateBiodataProgress,
    calculateReferenceProgress,
    calculateI9Progress,
    calculateEmployeeDemographicProgress,
    calculateTbFormProgress,
    calculatePneumococcalVaccinationProgress,
    calculateHepatitisVaccinationProgress,
    calculateVaricellaVaccineProgress,
    calculateMmrVaccineProgress,
    calculateFluVaccineProgress,
    calculateCJISFormProgress,
  ];

  return progressCalculators[id - 1](form, admin);
};

const getFieldName = (index: number): keyof GeneratedFormDate => {
  switch (index) {
    case 0:
      return "biodata";
    case 1:
      return "refForm";
    case 2:
      return "i9";
    case 3:
      return "employeeDemographic";
    case 4:
      return "tbForm";
    case 5:
      return "pneumococcalVaccination";
    case 6:
      return "hepatitisVaccination";
    case 7:
      return "varicellaVaccine";
    case 8:
      return "mmrVaccine";
    case 9:
      return "fluVaccine";
    case 10:
      return "cjisAttestation";
    default:
      throw new Error(`Invalid index: ${index}`);
  }
};

export const formatFormStatus = (status: string): FormattedFormStatus => {
  switch (status) {
    case "not_started":
      return "Not Filled";
    case "in_progress":
      return "In Progress";
    case "awaiting_approval":
      return "Awaiting Approval";
    case "approved":
      return "Approved";
    case "reviewed":
      return "Correction Required";
    default:
      return "Not Filled";
  }
};

export type FormattedDocumentStatus =
  | "Not Submitted"
  | "Submitted"
  | "Approved"
  | "Correction Required"
  | "Awaiting Approval";

export const formatDocumentStatus = (
  status: string
): FormattedDocumentStatus => {
  switch (status) {
    case "not_started":
      return "Not Submitted";
    case "submitted":
      return "Awaiting Approval";
    case "awaiting_approval":
      return "Awaiting Approval";
    case "approved":
      return "Approved";
    case "reviewed":
      return "Correction Required";
    default:
      return "Not Submitted";
  }
};
