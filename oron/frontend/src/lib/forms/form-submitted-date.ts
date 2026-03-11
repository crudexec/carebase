type Form = Record<string, any>;

const isFormValid = (form: any): form is Record<string, any> =>
  typeof form === "object" && form !== null && "data" in form;

const getNestedProperty = (
  obj: Record<string, any>,
  path: string[]
): string | undefined =>
  path.reduce<unknown>(
    (acc, key) =>
      acc && typeof acc === "object"
        ? (acc as Record<string, any>)[key]
        : undefined,
    obj
  ) as string | undefined;

const getFormSubmittedDate = (
  form: Form,
  path: string[],
  admin: boolean = false
): string => {
  if (isFormValid(form)) {
    const submittedAt = getNestedProperty(form.data, path);
    return typeof submittedAt === "string" ? submittedAt : "-";
  }
  return "-";
};

export const getBiodataFormSubmittedDate = (
  form: Form,
  admin: boolean
): string => getFormSubmittedDate(form, ["form_completed_at"]);

export const getReferenceFormSubmittedDate = (
  form: Form,
  admin: boolean
): string => getFormSubmittedDate(form, ["submitted_at"]);

export const getI9FormSubmittedDate = (form: Form, admin: boolean): string =>
  getFormSubmittedDate(form, ["signature", "created_at"]);

export const getEmployeeDemographicFormSubmittedDate = (
  form: Form,
  admin: boolean
): string =>
  getFormSubmittedDate(form, ["emergencyContactInformation", "created_at"]);

export const getTbFormSubmittedDate = (form: Form, admin: boolean): string =>
  getFormSubmittedDate(form, ["tuberculosisSignatureForm", "created_at"]);

export const getPneumococcalVaccinationFormSubmittedDate = (
  form: Form,
  admin: boolean
): string => {
  const path = admin
    ? ["pneumococcalSignatureForm", "created_at"]
    : ["signature", "created_at"];
  return getFormSubmittedDate(form, path, admin);
};

export const getHepatitisVaccinationFormSubmittedDate = (
  form: Form,
  admin: boolean
): string => {
  const path = admin
    ? ["hepatitisBSignatureForm", "created_at"]
    : ["signatureInformation", "created_at"];
  return getFormSubmittedDate(form, path, admin);
};

export const getVaricellaVaccineFormSubmittedDate = (
  form: Form,
  admin: boolean
): string =>
  getFormSubmittedDate(form, ["varicellaSignatureForm", "created_at"]);

export const getMmrVaccineFormSubmittedDate = (
  form: Form,
  admin: boolean
): string => getFormSubmittedDate(form, ["mmrSignatureForm", "created_at"]);

export const getFluVaccineFormSubmittedDate = (
  form: Form,
  admin: boolean
): string => getFormSubmittedDate(form, ["fluSignatureForm", "created_at"]);

export const getCJISFormSubmittedDate = (
  form: Form,
  admin: boolean
): string => {
  const path = admin
    ? ["cjisFullForm", "updated_at"]
    : ["preRegistrationForm", "updated_at"];
  return getFormSubmittedDate(form, path, admin);
};
