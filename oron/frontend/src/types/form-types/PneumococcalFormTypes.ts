export type PneumococcalEmployeeInformation = {
  created_at: string;
  date_of_filling_form: string;
  deleted_at: string | null;
  first_name: string;
  id: string;
  job_title: string;
  last_name: string;
  updated_at: string;
  user_id: string;
};

export type PneumococcalVaccination = {
  created_at: string;
  declined_pneumococcal_vaccination: boolean;
  deleted_at: string | null;
  had_pneumococcal_vaccination: boolean | null;
  id: string;
  medical_contraindication: string | null;
  other: string;
  received_pneumococcal_vaccination: string | null;
  religious_beliefs: string | null;
  updated_at: string;
  user_id: string;
};

export type PneumococcalVaccinationFullForm = {
  created_at: string;
  deleted_at: string | null;
  employee_information_id: string;
  id: string;
  pneumococcal_signature_id: string;
  pneumococcal_vaccination_form_id: string;
  status: string;
  updated_at: string;
  user_id: string;
  review_notes: string;
};

export type PneumococcalSignature = {
  created_at: string;
  deleted_at: string | null;
  id: string;
  pneumococcal_form_id: string | null;
  signature_data: string;
  signed_by: string;
  updated_at: string;
};

export type PneumococcalVaccinationForm = {
  data: {
    employeeInformation: PneumococcalEmployeeInformation;
    pneumococcalVaccinationForm: PneumococcalVaccination;
    pneumococcalVaccinationFullForm: PneumococcalVaccinationFullForm;
    signature: PneumococcalSignature;
    status: string;
  };
  status: string;
  message: string;
};
