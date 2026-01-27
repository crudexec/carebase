import { parseDateString } from "@/lib";
import {
  userHistoryDefaultValues,
  UserHistoryForm,
} from "@/schema/user/history";
import { UserHistoryResponse } from "@/types";

export const getSelectedHistory = (
  obj: UserHistoryResponse | null,
): (UserHistoryForm & { id: string }) | null => {
  if (obj) {
    return {
      ...obj,
      dob: parseDateString(obj.dob),
      hireDate: parseDateString(obj.hireDate),
      lastDate: parseDateString(obj.lastDate),
      evaluationDueDate: parseDateString(obj.evaluationDueDate),
      yearlyEvaluationDueDate: parseDateString(obj.yearlyEvaluationDueDate),
      criminalCheckDueDate: parseDateString(obj.criminalCheckDueDate),
      screeningDueDate: parseDateString(obj.screeningDueDate),
      lastCPRTraining: parseDateString(obj.lastCPRTraining),
      CPRExpiration: parseDateString(obj.CPRExpiration),
      insuranceExpiration: parseDateString(obj.insuranceExpiration),
      lastAidRegistry: parseDateString(obj.lastAidRegistry),
      lastMisconductRegistry: parseDateString(obj.lastMisconductRegistry),
      greenCardExpiration: parseDateString(obj.greenCardExpiration),
      media: obj.media ?? [],
      caregiverCertifications: obj.caregiverCertifications?.length
        ? obj.caregiverCertifications?.map((item) => ({
            ...item,
            expires: parseDateString(item.expires),
          }))
        : userHistoryDefaultValues.caregiverCertifications,
      professionalLicense: {
        ...obj.professionalLicense,
        expires: parseDateString(obj.professionalLicense?.expires as Date),
      },
      driversLicense: {
        ...obj.driversLicense,
        expires: parseDateString(obj.driversLicense?.expires as Date),
      },
    };
  } else return null;
};
