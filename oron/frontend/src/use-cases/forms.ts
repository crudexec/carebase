"use client";

import { API_BASE_URL } from "@/constants";
import {
  BiodataFormResponse,
  INineFormResponse,
} from "@/types/form-types/FormTypes";
import { EmployeeDemographicFormResponse } from "@/types/form-types/EmployeeDemographicFormTypes";
import { PneumococcalVaccinationForm } from "@/types/form-types/PneumococcalFormTypes";
import { TBFormResponse } from "@/types/form-types/TBFormTypes";
import { HepatitisResponse } from "@/types/form-types/HepatitisFormTypes";
import { VaricellaResponse } from "@/types/form-types/VaricellaFormTypes";
import { MMRFormResponse } from "@/types/form-types/MMRFormTypes";
import { FluVaccineFormResponse } from "@/types/form-types/FluVaccineFormTypes";
import { OfferLetterResponse } from "@/types/OfferLetterTypes";

export const retrieveForm = async <T>(
  url: string,
  token: string
): Promise<T | undefined> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      return undefined;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    return undefined;
  }
};

export const retrieveOfferLetterForm = async (
  token: string
): Promise<OfferLetterResponse | undefined> => {
  const url = `${API_BASE_URL}/users/retrieve/offer-letter`;
  return await retrieveForm(url, token);
};

export const retrieveBioDataForm = async (
  token: string
): Promise<BiodataFormResponse | undefined> => {
  const url = `${API_BASE_URL}/biodata/retrieve`;
  return await retrieveForm(url, token);
};

export const retrieveReferenceForm = async (token: string): Promise<any> => {
  const url = `${API_BASE_URL}/referenceForm/retrieve`;
  return await retrieveForm(url, token);
};

export const retrieveI9Form = async (
  token: string
): Promise<INineFormResponse | undefined> => {
  const url = `${API_BASE_URL}/i9form/retrieve`;
  return await retrieveForm(url, token);
};

export const retrieveEmployeeDemographicForm = async (
  token: string
): Promise<EmployeeDemographicFormResponse | undefined> => {
  const url = `${API_BASE_URL}/employeeform/retrieve`;
  return await retrieveForm(url, token);
};

export const retrieveTBForm = async (
  token: string
): Promise<TBFormResponse | undefined> => {
  const url = `${API_BASE_URL}/tuberculosisForm/retrieve`;
  return await retrieveForm(url, token);
};

export const retrievePneumococcalVaccinationForm = async (
  token: string
): Promise<PneumococcalVaccinationForm | undefined> => {
  const url = `${API_BASE_URL}/pneumococcalForm/retrieve`;
  return await retrieveForm(url, token);
};

export const retrieveHepatitisVaccinationAttestation = async (
  token: string
): Promise<HepatitisResponse | undefined> => {
  const url = `${API_BASE_URL}/hepatitisBForm/retrieve`;
  return await retrieveForm(url, token);
};

export const retrieveVaricellaVaccineAttestationForm = async (
  token: string
): Promise<VaricellaResponse | undefined> => {
  const url = `${API_BASE_URL}/varicellaForm/retrieve`;
  return await retrieveForm(url, token);
};

export const retrieveMMRVaccineAttestation = async (
  token: string
): Promise<MMRFormResponse | undefined> => {
  const url = `${API_BASE_URL}/mmrForm/retrieve`;
  return await retrieveForm(url, token);
};

export const retrieveFluVaccineAttestationAndDeclination = async (
  token: string
): Promise<FluVaccineFormResponse | undefined> => {
  const url = `${API_BASE_URL}/fluForm/retrieve`;
  return await retrieveForm(url, token);
};

export const retrieveCjisForm = async (token: string): Promise<any> => {
  const url = `${API_BASE_URL}/cjis/retrieveCJISForm/`;
  return await retrieveForm(url, token);
};
