import { ColType } from "@/types";

export const scheduleListColumns: ColType[] = [
  {
    key: "patientName",
    label: "Patient",
    visible: true,
  },
  {
    key: "caregiverName",
    label: "Caregiver",
    visible: true,
  },
  {
    key: "visitDateTime",
    label: "Visit Date Time",
    visible: true,
  },
  {
    key: "endDateTime",
    label: "End Date Time",
    visible: true,
  },
  {
    key: "billingCode",
    label: "Billing Code",
    visible: true,
  },
  {
    key: "visitStatus",
    label: "Visit Status",
    visible: true,
  },
];
