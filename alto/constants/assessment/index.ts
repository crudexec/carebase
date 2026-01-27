import { ColType } from "@/types";

export const assessmentColumns: ColType[] = [
  {
    key: "clinicalTask",
    label: "Clinical Task",
    visible: true,
  },
  {
    key: "assignedDate",
    label: "Assigned Date",
    visible: true,
  },
  {
    key: "timer",
    label: "Timer",
    visible: true,
  },
  {
    key: "evv",
    label: "EVV",
    visible: true,
  },
  {
    key: "caregiverName",
    label: "Caregiver",
    visible: true,
  },
  {
    key: "timeInOut",
    label: "Time In - Time Out",
    visible: true,
  },
  {
    key: "dateCompleted",
    label: "Completed",
    visible: true,
  },
  {
    key: "status",
    label: "Status",
    visible: true,
  },
  {
    key: "caregiverComments",
    label: "Comments",
    visible: true,
  },
];

export const speechEvaluation = [
  { value: "4", label: "4: WNL (within functional limits)" },
  { value: "3", label: "3: Mild Impairment" },
  { value: "2", label: "2: Moderate Impairment" },
  { value: "1", label: "1: Severe Impairment" },
  { value: "0", label: "0: Unable to/did not test" },
];
