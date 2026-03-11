import { TreatmentPlanType } from "@/components/clients/client-details/client-forms/treatment-plan-form/TreatmentPlanWrapper";
import { TreatmentPlanFormTabOptionIdType } from "@/components/clients/client-details/ClientDetailPageWrapper";
import {
  retrieveAllClientFcVisitsById,
  retrieveAllClientIISSVisitsById,
  retrieveClientSingleFcVisitForm,
  retrieveClientSingleIISSVisitForm,
} from "@/use-cases/clients";
import pdfMake from "pdfmake/build/pdfmake";

export type TreatmentPlanEnumType =
  | "IISS_Assessment"
  | "FC_Assessment"
  | "ITI_Assessment"
  | "ALP_Assessment";

export const convertTreatmentPlanTypeToEnumType = (
  formType: TreatmentPlanType | TreatmentPlanFormTabOptionIdType | string
): TreatmentPlanEnumType => {
  switch (formType) {
    case "iiss":
    case "IISS_Assessment":
      return "IISS_Assessment";

    case "fc":
    case "FC_Assessment":
      return "FC_Assessment";

    case "ti":
    case "ITI_Assessment":
      return "ITI_Assessment";

    case "alp":
    case "ALP_Assessment":
      return "ALP_Assessment";

    default:
      return "IISS_Assessment";
  }
};

export const convertVisitTypeToName = (
  formType: TreatmentPlanFormTabOptionIdType | TreatmentPlanType | undefined
): string => {
  switch (formType) {
    case "iiss":
      return "IISS";

    case "fc":
      return "FC";

    case "ti":
      return "TI";

    case "alp":
      return "ALP";

    default:
      return "IISS";
  }
};

export const getVisitApiRouteByType = (
  formType: TreatmentPlanFormTabOptionIdType | TreatmentPlanType | undefined
): string => {
  switch (formType) {
    case "iiss":
      return "visit";

    case "fc":
      return "fcVisit";

    case "ti":
      return "visit";

    case "alp":
      return "alpVisit";

    default:
      return "visit";
  }
};

export const getTreatmentPlanFormName = (
  formTab:
    | TreatmentPlanFormTabOptionIdType
    | TreatmentPlanType
    | TreatmentPlanEnumType
): string => {
  switch (formTab) {
    case "iiss":
      return "IISS Treatment Plan";
    case "fc":
      return "FC Treatment Plan";
    case "ti":
      return "TI Treatment Plan";
    case "alp":
      return "ALP Treatment Plan";
    case "IISS_Assessment":
      return "IISS Treatment Plan";
    case "FC_Assessment":
      return "FC Treatment Plan";
    case "ITI_Assessment":
      return "TI Treatment Plan";
    case "ALP_Assessment":
      return "ALP Treatment Plan";
    default:
      return "Treatment Plan";
  }
};

export const getAlpTabFormName = (formTab: string): string => {
  switch (formTab) {
    case "intake-assessment":
      return "Intake Assessment";
    case "goal-assessment":
      return "ALP Goal Assessment";

    default:
      return "Treatment Plan";
  }
};

export const getTreatmentPlanFormTableName = (
  formTab:
    | TreatmentPlanFormTabOptionIdType
    | TreatmentPlanType
    | TreatmentPlanEnumType
): string => {
  switch (formTab) {
    case "iiss":
      return "IISS TP";
    case "fc":
      return "FC TP";
    case "ti":
      return "TI TP";
    case "alp":
      return "ALP TP";
    case "IISS_Assessment":
      return "IISS TP";
    case "FC_Assessment":
      return "FC TP";
    case "ITI_Assessment":
      return "TI TP";
    case "ALP_Assessment":
      return "ALP TP";
    default:
      return "TP";
  }
};

export const getTreatmentPlanFormRoute = (
  formTab: TreatmentPlanFormTabOptionIdType | TreatmentPlanType
): string => {
  switch (formTab) {
    case "iiss":
      return "treatment-plan";
    case "fc":
      return "fc-treatment-plan";
    case "ti":
      return "ti-treatment-plan";
    case "alp":
      return "alp-treatment-plan";
    default:
      return "treatment-plan";
  }
};

export const getVisitFormRoute = (
  formTab: TreatmentPlanFormTabOptionIdType | TreatmentPlanType | undefined
): string => {
  switch (formTab) {
    case "iiss":
      return "iiss-visit";
    case "fc":
      return "fc-visit";
    case "ti":
      return "ti-visit";
    case "alp":
      return "alp-visit";
    default:
      return "iiss-visit";
  }
};

export const getVisitRetrievalFunction = (
  formTab: TreatmentPlanFormTabOptionIdType | TreatmentPlanType
) => {
  switch (formTab) {
    case "iiss":
      return retrieveAllClientIISSVisitsById;
    case "fc":
      return retrieveAllClientFcVisitsById;
    default:
      return retrieveAllClientIISSVisitsById;
  }
};

export const getSingleVisitFormRetrievalFunction = (
  formTab: TreatmentPlanFormTabOptionIdType | TreatmentPlanType
) => {
  switch (formTab) {
    case "iiss":
      return retrieveClientSingleIISSVisitForm;
    case "fc":
      return retrieveClientSingleFcVisitForm;
    default:
      return retrieveClientSingleIISSVisitForm;
  }
};

export const getVisitQueryKey = (
  formTab: TreatmentPlanFormTabOptionIdType | TreatmentPlanType,
  clientId: string
): string[] => {
  switch (formTab) {
    case "iiss":
      return ["iissVisitData", clientId];

    case "fc":
      return ["fcVisitData", clientId];

    case "ti":
      return ["tiVisitData", clientId];

    case "alp":
      return ["alpVisitData", clientId];

    default:
      return [];
  }
};

export const getTreatmentPlanQueryKey = (
  formType:
    | TreatmentPlanType
    | TreatmentPlanFormTabOptionIdType
    | TreatmentPlanEnumType,
  clientId: string
): string[] => {
  switch (formType) {
    case "iiss":
      return ["iissTreatmentPlanDetail", clientId];

    case "fc":
      return ["fcTreatmentPlanDetail", clientId];

    case "ti":
      return ["tiTreatmentPlanDetail", clientId];

    case "alp":
      return ["alpTreatmentPlanDetail", clientId];

    case "IISS_Assessment":
      return ["iissTreatmentPlanDetail", clientId];

    case "FC_Assessment":
      return ["fcTreatmentPlanDetail", clientId];

    case "ITI_Assessment":
      return ["tiTreatmentPlanDetail", clientId];

    case "ALP_Assessment":
      return ["alpTreatmentPlanDetail", clientId];

    default:
      return [];
  }
};

export async function convertDocDefinitionToUint8Array(
  docDefinition: any
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    pdfMake.createPdf(docDefinition).getBuffer((buffer: Buffer) => {
      try {
        const uint8Array = new Uint8Array(buffer);
        resolve(uint8Array);
      } catch (error) {
        reject(error);
      }
    });
  });
}

export const visitTypeOptions = [
  {
    label: "IISS Assessment",
    value: "iiss",
  },
  {
    label: "FC Assessment",
    value: "fc",
  },
  {
    label: "TI Assessment",
    value: "ti",
  },
  // {
  //   label: "ALP Assessment",
  //   value: "alp",
  // },
];
