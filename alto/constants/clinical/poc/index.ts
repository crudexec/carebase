import { ColType } from "@/types";

export const planOfCareColumns: ColType[] = [
  {
    key: "docType",
    label: "Doc Type",
    visible: true,
  },
  {
    key: "certFrom",
    label: "Cert From",
    visible: true,
  },
  {
    key: "certTo",
    label: "Cert Through",
    visible: true,
  },
  {
    key: "sentDate",
    label: "Sent Date",
    visible: true,
  },
  {
    key: "receivedDate",
    label: "Received Date",
    visible: true,
  },
  {
    key: "recordedDate",
    label: "Recorded Date",
    visible: true,
  },
  {
    key: "qAStatus",
    label: "Status",
    visible: true,
  },
];

export const OrdersAndGoalsColumns: ColType[] = [
  {
    key: "disciplineType",
    label: "Discipline Type",
    visible: true,
  },
  {
    key: "orderInformation",
    label: "Order Information",
    visible: true,
  },
  {
    key: "dateEffective",
    label: "Effective Date",
    visible: true,
  },
  {
    key: "goalsAndDate",
    label: "Goals Met/Ended Date",
    visible: true,
  },
  {
    key: "associatedGoals",
    label: "Associated Goals",
    visible: true,
  },
  {
    key: "bodySystem",
    label: "Section/Body System",
    visible: true,
  },
];

export const DiagnosisColumns: ColType[] = [
  {
    key: "type",
    label: "Type",
    visible: true,
  },
  {
    key: "icdCode",
    label: "ICD10 Code",
    visible: true,
  },
  {
    key: "icdDescription",
    label: "ICD10 Description",
    visible: true,
  },
  {
    key: "diagnosisDate",
    label: "Date",
    visible: true,
  },
  {
    key: "onSet",
    label: "OnSet/Ex",
    visible: true,
  },
];

export const ProcedureColumns: ColType[] = [
  {
    key: "type",
    label: "Type",
    visible: true,
  },
  {
    key: "icdCode",
    label: "ICD10 Code",
    visible: true,
  },
  {
    key: "icdDescription",
    label: "ICD10 Description",
    visible: true,
  },
  {
    key: "procedureDate",
    label: "Date",
    visible: true,
  },
];
