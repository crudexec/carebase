"use client";

import { GeneratedFormType } from "@/types/form-types/FormTypes";

import {
  mapFormStatus,
  mapFormCreatedDate,
  mapFormSubmittedDate,
  filterCompletedForms,
  mapFormProgress,
} from "./helpers";

import {
  retrieveBioDataForm,
  retrieveI9Form,
  retrieveEmployeeDemographicForm,
  retrieveTBForm,
  retrievePneumococcalVaccinationForm,
  retrieveHepatitisVaccinationAttestation,
  retrieveVaricellaVaccineAttestationForm,
  retrieveMMRVaccineAttestation,
  retrieveFluVaccineAttestationAndDeclination,
  retrieveCjisForm,
  retrieveReferenceForm,
} from "../../use-cases/forms";

export const generateFormData = async (
  token: string
): Promise<GeneratedFormType> => {
  try {
    const forms = await fetchForms(token);

    const formData: any = {
      status: mapFormStatus(forms, false),
      createdDate: mapFormCreatedDate(forms, false),
      submittedDate: mapFormSubmittedDate(forms, false),
      progress: mapFormProgress(forms, false),
      completedForms: filterCompletedForms(forms, false),
    };

    return formData;
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};

const fetchForms = async (token: string): Promise<Record<string, any>[]> => {
  return await Promise.all([
    retrieveBioDataForm(token),
    retrieveReferenceForm(token),
    retrieveI9Form(token),
    retrieveEmployeeDemographicForm(token),
    retrieveTBForm(token),
    retrievePneumococcalVaccinationForm(token),
    retrieveHepatitisVaccinationAttestation(token),
    retrieveVaricellaVaccineAttestationForm(token),
    retrieveMMRVaccineAttestation(token),
    retrieveFluVaccineAttestationAndDeclination(token),
    retrieveCjisForm(token),
  ]);
};
