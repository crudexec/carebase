type Form = Record<string, any>;

const isFormValid = (form: Form): form is Record<string, any> =>
  typeof form === "object" && form !== null && "data" in form;

const getFormID = (form: Form, path: string[]): string =>
  isFormValid(form)
    ? (path.reduce<unknown>(
        (acc, key) =>
          acc && typeof acc === "object"
            ? (acc as Record<string, any>)[key]
            : undefined,
        form.data
      ) as string) ?? "-"
    : "-";

export const getBiodataFormID = (form: Form, admin: boolean): string =>
  getFormID(form, ["id"]);

export const getReferenceFormID = (form: Form, admin: boolean): string =>
  getFormID(form, ["id"]);

export const getI9FormID = (form: Form, admin: boolean): string => {
  if (isFormValid(form)) {
    return admin
      ? form.data?.i9Form?.id ?? "-"
      : form.data?.id?.i9Form?.id ?? "-";
  }
  return "-";
};

export const getEmployeeDemographicFormID = (
  form: Form,
  admin: boolean
): string => {
  if (isFormValid(form)) {
    return admin
      ? form.data?.employeeDemographicInformation?.id ?? "-"
      : form.data?.id ?? "-";
  }
  return "-";
};

export const getTbFormID = (form: Form, admin: boolean): string => {
  if (isFormValid(form)) {
    return admin
      ? form.data?.tuberculosisFullForm?.id ?? "-"
      : form.data?.id ?? "-";
  }
  return "-";
};

export const getPneumococcalVaccinationFormID = (
  form: Form,
  admin: boolean
): string => {
  if (isFormValid(form)) {
    return admin
      ? form.data?.pneumococcalVaccinationFullForm?.id ?? "-"
      : form.data?.id ?? "-";
  }
  return "-";
};

export const getHepatitisVaccinationFormID = (
  form: Form,
  admin: boolean
): string => {
  if (isFormValid(form)) {
    return admin
      ? form.data?.hepatitisBFullForm?.id ?? "-"
      : form.data?.id ?? "-";
  }
  return "-";
};

export const getVaricellaVaccineFormID = (
  form: Form,
  admin: boolean
): string => {
  if (isFormValid(form)) {
    return admin
      ? form.data?.varicellaFullForm?.id ?? "-"
      : form.data?.id ?? "-";
  }
  return "-";
};

export const getMmrVaccineFormID = (form: Form, admin: boolean): string => {
  if (isFormValid(form)) {
    return admin ? form.data?.mmrFullForm?.id ?? "-" : form.data?.id ?? "-";
  }
  return "-";
};

export const getFluVaccineFormID = (form: Form, admin: boolean): string => {
  if (isFormValid(form)) {
    return admin ? form.data?.fluFullForm?.id ?? "-" : form.data?.id ?? "-";
  }
  return "-";
};

export const getCJISFormID = (form: Form, admin: boolean): string => {
  if (isFormValid(form)) {
    return admin
      ? form.data?.cjisFullForm?.id ?? "-"
      : form.data?.cjisForm?.id ?? "-";
  }
  return "-";
};
