// Types for the unified client/referral creation form

export interface BasicInfoData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CareNeedsData {
  primaryDiagnosis: string;
  requestedServices: string[];
  hoursRequested: string;
  urgency: "ROUTINE" | "URGENT" | "STAT";
  specialNeeds: string;
}

export interface ReferralSourceData {
  referralSourceId: string;
  referralSourceOther: string;
  referralDate: string;
  reason: string;
  assignedToId: string;
}

export interface FullProfileData {
  // Emergency Contact
  emergencyContact: string;
  emergencyPhone: string;
  emergencyRelation: string;
  // Insurance
  medicaidId: string;
  medicaidPayerId: string;
  secondaryInsuranceId: string;
  secondaryPayerId: string;
  insuranceInfo: string;
  // PCP Information
  physicianName: string;
  physicianNpi: string;
  physicianPhone: string;
  physicianFax: string;
  physicianAddress: string;
  // Medical Notes
  medicalNotes: string;
  // Assigned Carer
  assignedCarerId: string;
}

export interface UnifiedFormData extends BasicInfoData, CareNeedsData, ReferralSourceData, FullProfileData {}

export interface StepProps {
  data: UnifiedFormData;
  onChange: (updates: Partial<UnifiedFormData>) => void;
  errors?: Record<string, string>;
}

export interface ReferralSource {
  id: string;
  name: string;
  type: string;
}

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
}

export interface CarerData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
}

export const SERVICE_OPTIONS = [
  "Personal Care",
  "Bathing Assistance",
  "Dressing Assistance",
  "Toileting Assistance",
  "Meal Preparation",
  "Medication Reminders",
  "Light Housekeeping",
  "Companionship",
  "Transportation",
  "Respite Care",
] as const;

export const US_STATES = [
  { value: "MD", label: "Maryland" },
  { value: "DC", label: "District of Columbia" },
  { value: "VA", label: "Virginia" },
  { value: "PA", label: "Pennsylvania" },
  { value: "DE", label: "Delaware" },
  { value: "WV", label: "West Virginia" },
] as const;

export const URGENCY_OPTIONS = [
  { value: "ROUTINE", label: "Routine" },
  { value: "URGENT", label: "Urgent" },
  { value: "STAT", label: "STAT (Immediate)" },
] as const;

export const DEFAULT_FORM_DATA: UnifiedFormData = {
  // Basic Info
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  phone: "",
  address: "",
  city: "",
  state: "MD",
  zipCode: "",
  // Care Needs
  primaryDiagnosis: "",
  requestedServices: [],
  hoursRequested: "",
  urgency: "ROUTINE",
  specialNeeds: "",
  // Referral Source
  referralSourceId: "",
  referralSourceOther: "",
  referralDate: new Date().toISOString().split("T")[0],
  reason: "",
  assignedToId: "",
  // Full Profile
  emergencyContact: "",
  emergencyPhone: "",
  emergencyRelation: "",
  medicaidId: "",
  medicaidPayerId: "",
  secondaryInsuranceId: "",
  secondaryPayerId: "",
  insuranceInfo: "",
  physicianName: "",
  physicianNpi: "",
  physicianPhone: "",
  physicianFax: "",
  physicianAddress: "",
  medicalNotes: "",
  assignedCarerId: "",
};
