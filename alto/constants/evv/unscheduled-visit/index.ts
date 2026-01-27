import { ColType } from "@/types";

export const unscheduledVisitColumns: ColType[] = [
  {
    key: "client",
    label: "Client",
    visible: true,
  },
  {
    key: "visitTime",
    label: "Visit Time",
    visible: true,
  },
  {
    key: "status",
    label: "Status",
    visible: true,
  },
  {
    key: "startDate",
    label: "Start Time",
    visible: true,
  },

  {
    key: "endDate",
    label: "End Time",
    visible: true,
  },
  {
    key: "linkedToScheduler",
    label: "Linked To Scheduler",
    visible: true,
  },
  {
    key: "patSigned",
    label: "Pat. Signed",
    visible: true,
  },
  {
    key: "cgSigned",
    label: "CG Signed",
    visible: true,
  },
  {
    key: "billingCode",
    label: "Billing Code",
    visible: true,
  },
];

export const interventionSummaryColumns: ColType[] = [
  {
    key: "startDate",
    label: "Effective Date",
    visible: true,
  },
  {
    key: "goals",
    label: "Associated Goals",
    visible: true,
  },
  {
    key: "orders",
    label: "Order Information",
    visible: true,
  },
  {
    key: "interventions",
    label: "Intervention",
    visible: true,
  },
  {
    key: "bodySystem",
    label: "Body System",
    visible: true,
  },
];
