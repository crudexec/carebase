import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { formatFormStatus } from "./helpers";

type Form = Record<string, any>;

const isFormValid = (form: any): form is Record<string, any> =>
  typeof form === "object" && form !== null && "data" in form;

const getStatus = (field: any): FormattedFormStatus =>
  field ? formatFormStatus(field.status) : "Not Filled";

export const getBiodataFormStatus = (
  form: Form,
  admin: boolean
): FormattedFormStatus => {
  if (isFormValid(form)) {
    return getStatus(form.data);
  }
  return "Not Filled";
};

export const getReferenceFormStatus = (
  form: Form,
  admin: boolean
): FormattedFormStatus => {
  if (isFormValid(form)) {
    if (admin) {
      return getStatus(form.data);
    }

    const {
      referrer_one_firstname,
      referrer_one_lastname,
      referrer_one_email,
      referrer_one_phone,
      referrer_two_firstname,
      referrer_two_lastname,
      referrer_two_email,
      referrer_two_phone,
      referrer_three_firstname,
      referrer_three_lastname,
      referrer_three_email,
      referrer_three_phone,
    } = form.data;

    const formObject = {
      referrer_one_firstname,
      referrer_one_lastname,
      referrer_one_email,
      referrer_one_phone,
      referrer_two_firstname,
      referrer_two_lastname,
      referrer_two_email,
      referrer_two_phone,
      referrer_three_firstname,
      referrer_three_lastname,
      referrer_three_email,
      referrer_three_phone,
    };

    const isAnyFieldFilled = Object.values(formObject).some(
      (field) => field !== null && field !== ""
    );

    const status = getStatus(form.data);

    if (status === "Not Filled" && isAnyFieldFilled) {
      return "In Progress";
    }

    return status;
  }
  return "Not Filled";
};

export const getI9FormStatus = (
  form: Form,
  admin: boolean
): FormattedFormStatus => {
  if (isFormValid(form)) {
    return getStatus(form.data?.i9Form);
  }
  return "Not Filled";
};

export const getEmployeeDemographicFormStatus = (
  form: Form,
  admin: boolean
): FormattedFormStatus => {
  if (isFormValid(form)) {
    if (admin) {
      return getStatus(form.data?.employeeDemographicInformation);
    }
    return getStatus(form.data);
  }
  return "Not Filled";
};

export const getTbFormStatus = (
  form: Form,
  admin: boolean
): FormattedFormStatus => {
  if (isFormValid(form)) {
    if (admin) {
      return getStatus(form.data?.tuberculosisFullForm);
    }
    return getStatus(form.data);
  }
  return "Not Filled";
};

export const getPneumococcalVaccinationFormStatus = (
  form: Form,
  admin: boolean
): FormattedFormStatus => {
  if (isFormValid(form)) {
    if (admin) {
      return getStatus(form.data?.pneumococcalVaccinationFullForm);
    }
    return getStatus(form.data);
  }
  return "Not Filled";
};

export const getHepatitisVaccinationFormStatus = (
  form: Form,
  admin: boolean
): FormattedFormStatus => {
  if (isFormValid(form)) {
    if (admin) {
      return getStatus(form.data?.hepatitisBFullForm);
    }
    return getStatus(form.data);
  }
  return "Not Filled";
};

export const getVaricellaVaccineFormStatus = (
  form: Form,
  admin: boolean
): FormattedFormStatus => {
  if (isFormValid(form)) {
    if (admin) {
      return getStatus(form.data?.varicellaFullForm);
    }
    return getStatus(form.data);
  }
  return "Not Filled";
};

export const getMmrVaccineFormStatus = (
  form: Form,
  admin: boolean
): FormattedFormStatus => {
  if (isFormValid(form)) {
    if (admin) {
      return getStatus(form.data?.mmrFullForm);
    }
    return getStatus(form.data);
  }
  return "Not Filled";
};

export const getFluVaccineFormStatus = (
  form: Form,
  admin: boolean
): FormattedFormStatus => {
  if (isFormValid(form)) {
    if (admin) {
      return getStatus(form.data?.fluFullForm);
    }
    return getStatus(form.data);
  }
  return "Not Filled";
};

export const getCJISFormStatus = (
  form: Form,
  admin: boolean
): FormattedFormStatus => {
  if (isFormValid(form)) {
    if (admin) {
      return getStatus(form.data?.cjisFullForm);
    }
    return getStatus(form.data?.cjisForm);
  }
  return "Not Filled";
};
