import { MappedFormData } from "@/types/AdminTypes";

type HeadersOptions = {
  token: string;
  contentType?: string;
};

export const generateHeaders = ({
  token,
  contentType = "application/json",
}: HeadersOptions) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": contentType,
  },
});

export const validateField = (
  field: string | null | undefined,
  isDate?: boolean
) => {
  return typeof field === "string" && field.length > 1 ? field : null;
};

export const mapForms = (forms: any[]) => {
  // Creating an object to hold mapped form data
  const formInfo: MappedFormData = {
    biodata: forms[0],
    reference: forms[1],
    i9: forms[2],
    employeeDemographic: forms[3],
    tbForm: forms[4],
    pneumococcalVaccination: forms[5],
    hepatitisVaccination: forms[6],
    varicellaVaccine: forms[7],
    mmrVaccine: forms[8],
    fluVaccine: forms[9],
    cjisAttestation: forms[10],
  };

  return formInfo;
};
