import { FormStatus } from "./FormTypes";

export type EmergencyContactInformation = {
  id: string;
  first_name: string;
  last_name: string;
  relationship_to_employee: string;
  street_address: string;
  phone: string;
  city: string;
  state: string | null;
  zip_code: string;
  user_id: string;
  employee_personal_information_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type EmployeeDemographicInformation = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  home_phone_number: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  gender: string;
  race_or_ethinicity: string;
  social_security_number: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  review_notes: string | null;
};

export type EmployeeDemographicFormResponse = {
  message: string;
  data: {
    emergencyContactInformation: EmergencyContactInformation;
    employeeDemographicInformation: EmployeeDemographicInformation;
    status: string;
  };
  status: FormStatus;
};
