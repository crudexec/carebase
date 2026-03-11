"use client";

import { API_BASE_URL } from "@/constants";
import {
  AdmissionInformationType,
  ClientInformationResponseType,
  ContactResponseType,
  IntakeInformationResponseType,
  MedicalResponseType,
  MoreAboutClientResponseType,
  ReferralInformationResponseType,
  ServiceCordinatorResponseType,
} from "@/types/form-types/IntakeFormTypes";
import { retrieveForm } from "@/use-cases/forms";
import { FullIntakeType } from "@/types/IntakeForm";

export const retrieveClientInformationForm = async (
  token: string
): Promise<ClientInformationResponseType | undefined> => {
  const url = `${API_BASE_URL}/intake/retrieve/client-information`;
  return await retrieveForm(url, token);
};

export const retrieveReferralInformationForm = async (
  token: string
): Promise<ReferralInformationResponseType | undefined> => {
  const url = `${API_BASE_URL}/intake/retrieve/referral-information`;
  return await retrieveForm(url, token);
};

export const retrieveIntakeInformationForm = async (
  token: string
): Promise<IntakeInformationResponseType | undefined> => {
  const url = `${API_BASE_URL}/intake/retrieve/intake-information`;
  return await retrieveForm(url, token);
};

export const retrieveServiceCordinatorForm = async (
  token: string
): Promise<ServiceCordinatorResponseType | undefined> => {
  const url = `${API_BASE_URL}/intake/retrieve/service-coordinator-information`;
  return await retrieveForm(url, token);
};

export const retrieveMedicalInformationForm = async (
  token: string
): Promise<MedicalResponseType | undefined> => {
  const url = `${API_BASE_URL}/intake/retrieve/medical-information`;
  return await retrieveForm(url, token);
};

export const retrieveAdmissionInformationForm = async (
  token: string
): Promise<AdmissionInformationType | undefined> => {
  const url = `${API_BASE_URL}/intake/retrieve/admission-information`;
  return await retrieveForm(url, token);
};

export const retrieveMoreAboutClientForm = async (
  token: string
): Promise<MoreAboutClientResponseType | undefined> => {
  const url = `${API_BASE_URL}/intake/retrieve/more-about-client`;
  return await retrieveForm(url, token);
};

export const retrieveContactForm = async (
  token: string
): Promise<ContactResponseType | undefined> => {
  const url = `${API_BASE_URL}/intake/retrieve/general/contact-information`;
  return await retrieveForm(url, token);
};

export const retrievFullIntakeForm = async (
  token: string
): Promise<FullIntakeType | undefined> => {
  const url = `${API_BASE_URL}/intake/retrieve/full-intake`;
  return await retrieveForm(url, token);
};

export const retrievEmployeeFullIntakeForm = async (
  token: string
): Promise<FullIntakeType | undefined> => {
  const url = `${API_BASE_URL}/intake/retrieve/employee/intake`;
  return await retrieveForm(url, token);
};
