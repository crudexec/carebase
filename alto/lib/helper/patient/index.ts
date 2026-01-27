import { PayerType } from "@prisma/client";

import { formatDate, getFullName } from "@/lib";
import { ObjectData, PatientResponse } from "@/types";

export const getPayerLabel = (item: PayerType | null) => {
  switch (item) {
    case PayerType.MEDICARE_PATIENT:
      return "Medicare Patients Only (UB04)";
    case PayerType.MEDICARE_ADV:
      return "Medicare Adv/HMO/VA/Pediatrics (UB04)";
    case PayerType.MANAGED_CARE:
      return "Managed Care/Psych/Private Pay (UB04)";
    case PayerType.PROF:
      return "Prof/PHC/SHC/Medicaid/modifiers and auths (1500)";
    case PayerType.HOSPICE:
      return "Hospice/Palliative (UB04)";
    default:
      return "";
  }
};

export const prepareTableData = (data: PatientResponse[]) => {
  return data?.map((item) => {
    const patientAuthorization = item?.patientAuthorization?.[0];
    const excludedKeys = [
      "id",
      "startDate",
      "endDate",
      "status",
      "insurance",
      "number",
      "visitsAuthorized",
      "comment",
      "patientId",
    ];
    const disciplines = patientAuthorization
      ? Object.keys(patientAuthorization).reduce((acc: string[], key) => {
          const value = (patientAuthorization as ObjectData)[key];
          if (
            typeof value === "string" &&
            value &&
            !excludedKeys.includes(key)
          ) {
            acc.push(key);
          }
          return acc;
        }, [])
      : [];

    return {
      ...item,
      actionByUser: `${item?.patientAdmission[0].actionBy?.firstName ?? ""} ${item?.patientAdmission[0].actionBy?.lastName ?? ""}`,
      payer: getPayerLabel(item.patientAdmission[0]?.payer),

      soc: item?.admissionSOC ? formatDate(item?.admissionSOC as Date) : "-",
      dischargeDate:
        item.patientAdmission[0]?.status === "DISCHARGED"
          ? item.patientAdmission[0]?.actionDate
            ? formatDate(item.patientAdmission[0]?.actionDate as Date)
            : "-"
          : "-",
      address: `${item.address1 ?? "-"}`,
      insurance: item.patientInsurance?.[0]?.insuredId ?? "-",
      patientId: `\n ${item.patientCommercial?.payId ?? ""} ${item?.dob ? "\n DOB: " + formatDate(item?.dob as Date) : "-"}`,
      patient: `${item.firstName ?? ""} ${item.lastName ?? ""} \n ${item?.controlNumber ?? ""} \n ${item?.phone ?? ""}`,
      diagnosis: item.patientReferralSource?.diagnosis ?? "-",
      doctor: `${getFullName(item.physician?.lastName, item.physician?.firstName, "") ?? ""} \n ${item.physician?.npi ?? "-"}`,
      disciplines: disciplines.join(", ") || "-",
      // certPeriod: `${item.patientAdmission[0]?.certStartDate} - ${item.patientAdmission[0]?.certEndDate}`,
    };
  });
};
