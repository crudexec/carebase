import { ColType } from "@/types";

export const assessmentColumns: ColType[] = [
  {
    key: "completedDate",
    label: "Completed Date",
    visible: true,
  },
  {
    key: "reason",
    label: "Reason for Assessment",
    visible: true,
  },
  {
    label: "QA Status",
    key: "status",
    visible: true,
  },
  {
    label: "Export Status",
    key: "exportStatus",
    visible: true,
  },
  {
    label: "Source",
    key: "source",
    visible: true,
  },
  {
    label: "HIPPS",
    key: "hipps",
    visible: true,
  },
  {
    label: "Payment",
    key: "payment",
    visible: true,
  },
  {
    label: "LUPA Threshold",
    key: "lupa",
    visible: true,
  },
  {
    label: "Episode",
    key: "episode",
    visible: true,
  },
  {
    label: "Corr",
    key: "corr",
    visible: true,
  },
];

export const diagnosesColumns: ColType[] = [
  {
    key: "type",
    label: "Type",
    visible: true,
  },
  {
    key: "code",
    label: "ICD-10 Code",
    visible: true,
  },
  {
    key: "description",
    label: "ICD-10 Description",
    visible: true,
  },
  {
    key: "date",
    label: "Date",
    visible: true,
  },
  {
    key: "onset",
    label: "Onset/Ex",
    visible: true,
  },
];

export const procedureColumns: ColType[] = [
  {
    key: "type",
    label: "Type",
    visible: true,
  },
  {
    key: "code",
    label: "ICD-10 Code",
    visible: true,
  },
  {
    key: "description",
    label: "ICD-10 Description",
    visible: true,
  },
  {
    key: "date",
    label: "Date",
    visible: true,
  },
];
