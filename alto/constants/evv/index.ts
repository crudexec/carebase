export * from "./unscheduled-visit";
import { ColType } from "@/types";

export const evvColumns: ColType[] = [
  {
    key: "patientName",
    label: "Patient",
    visible: true,
  },
  {
    key: "date",
    label: "Date Time",
    visible: true,
  },
  {
    key: "linkedToScheduler",
    label: "Linked to Scheduler",
    visible: true,
  },
  {
    key: "patSigned",
    label: "Pat. Signed",
    visible: true,
  },
];

export const insuranceColumns: ColType[] = [
  {
    key: "payerResponsibility",
    label: "Responsibility",
    visible: true,
  },
  {
    key: "payerName",
    label: "Payer",
    visible: true,
  },
  {
    key: "startDate",
    label: "Effective From",
    visible: true,
  },
  {
    key: "endDate",
    label: "Effective Through",
    visible: true,
  },
];

export const frequencyColumns: ColType[] = [
  {
    key: "disciplineName",
    label: "Discipline",
    visible: true,
  },
  {
    key: "visit",
    label: "Visits",
    visible: true,
  },
  {
    key: "startDate",
    label: "Effective From",
    visible: true,
  },
  {
    key: "endDate",
    label: "Effective Through",
    visible: true,
  },
  {
    key: "comment",
    label: "Comment",
    visible: true,
  },
];

export const priorAuthorizationColumns: ColType[] = [
  {
    key: "disciplineName",
    label: "Discipline",
    visible: true,
  },
  {
    key: "authCode",
    label: "Auth Code",
    visible: true,
  },
  {
    key: "startDate",
    label: "Eff From",
    visible: true,
  },
  {
    key: "endDate",
    label: "Eff Thru",
    visible: true,
  },
  {
    key: "visitAuth",
    label: "Visits Auth",
    visible: true,
  },
  {
    key: "hoursAuth",
    label: "Hours Auth",
    visible: true,
  },
  {
    key: "units",
    label: "Units",
    visible: true,
  },
  {
    key: "notes",
    label: "Notes",
    visible: true,
  },
  {
    key: "status",
    label: "Status",
    visible: true,
  },
];
