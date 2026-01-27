import { ColType } from "@/types";

export const clinicalPatientColumns: ColType[] = [
  {
    key: "patientName",
    label: "Patient Name",
    visible: true,
  },
  {
    key: "pan",
    label: "PAN",
    visible: true,
  },
  {
    key: "dateAdmitted",
    label: "Admit Date",
    visible: true,
  },
  {
    key: "dischargeDate",
    label: "Discharge Date",
    visible: true,
  },
  {
    key: "dateOfBirth",
    label: "DOB",
    visible: true,
  },
  {
    key: "officeName",
    label: "Office Name",
    visible: true,
  },
];

export const skilledNursingNotesColumns: ColType[] = [
  {
    key: "visitDate",
    label: "Visit Date",
    visible: true,
  },
  {
    key: "caregiverName",
    label: "Caregiver",
    visible: true,
  },
  {
    key: "status",
    label: "Status",
    visible: true,
  },
  {
    key: "nurseSigned",
    label: "Nurse Signed",
    visible: true,
  },
  {
    key: "patientSigned",
    label: "Patient Signed",
    visible: true,
  },

  {
    key: "gps",
    label: "GPS",
    visible: true,
  },
  {
    key: "snap",
    label: "SNaP",
    visible: true,
  },
];
