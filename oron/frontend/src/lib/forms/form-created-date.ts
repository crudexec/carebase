type Form = Record<string, any>;

const isFormValid = (form: Form): form is Record<string, any> =>
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

export const getFormCreatedDate = (form: Form, path: string[]): string =>
  isFormValid(form) ? getNestedProperty(form.data, path) ?? "-" : "-";

export const getBiodataFormCreatedDate = (form: Form, admin: boolean): string =>
  getFormCreatedDate(form, ["created_at"]);

export const getReferenceFormCreatedDate = (
  form: Form,
  admin: boolean
): string => getFormCreatedDate(form, ["created_at"]);

export const getI9FormCreatedDate = (form: Form, admin: boolean): string =>
  isFormValid(form) &&
  typeof form?.data?.i9Form === "object" &&
  Object.keys(form?.data?.i9Form).length > 1
    ? form?.data?.i9Form?.created_at
    : "-";

export const getEmployeeDemographicFormCreatedDate = (
  form: Form,
  admin: boolean
): string =>
  getFormCreatedDate(form, ["employeeDemographicInformation", "created_at"]);

export const getTbFormCreatedDate = (form: Form, admin: boolean): string =>
  getFormCreatedDate(
    form,
    admin
      ? ["tuberculosisMantouxForm", "created_at"]
      : ["tuberculosisMantouxRiskAssessmentForm", "created_at"]
  );

export const getPneumococcalVaccinationFormCreatedDate = (
  form: Form,
  admin: boolean
): string => getFormCreatedDate(form, ["employeeInformation", "created_at"]);

export const getHepatitisVaccinationFormCreatedDate = (
  form: Form,
  admin: boolean
): string =>
  getFormCreatedDate(
    form,
    admin
      ? ["hepatitisBAttestationForm", "created_at"]
      : ["attestationInformation", "created_at"]
  );

export const getVaricellaVaccineFormCreatedDate = (
  form: Form,
  admin: boolean
): string =>
  getFormCreatedDate(form, ["varicellaAttestationForm", "created_at"]);

export const getMmrVaccineFormCreatedDate = (
  form: Form,
  admin: boolean
): string => getFormCreatedDate(form, ["mmrAttestationForm", "created_at"]);

export const getFluVaccineFormCreatedDate = (
  form: Form,
  admin: boolean
): string => getFormCreatedDate(form, ["fluEmployeeInformation", "created_at"]);

export const getCJISFormCreatedDate = (form: Form, admin: boolean): string =>
  getFormCreatedDate(
    form,
    admin
      ? ["cjisEmployeeInformation", "created_at"]
      : ["employeeInformation", "created_at"]
  );
