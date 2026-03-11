export type VaricellaAttestationForm = {
  chicken_pox_not_serious_disease: boolean;
  created_at: string;
  deleted_at: string | null;
  had_chicken_pox: boolean;
  id: string;
  other: null | string;
  side_effects_from_chicken_pox_vaccine: boolean;
  updated_at: string;
  user_id: string;
  will_not_contract_chicken_pox: boolean;
  will_stay_home_if_infected: boolean;
};

export type VaricellaEmployeeInformation = {
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

export type VaricellaFullForm = {
  attestation_id: string;
  created_at: string;
  deleted_at: string | null;
  id: string;
  personal_information_id: string;
  signature_id: string | null;
  status: string;
  updated_at: string;
  user_id: string;
  review_notes: string;
};

export type VaricellaSignatureForm = {
  created_at: string;
  deleted_at: string | null;
  id: string;
  signature_data: string;
  signed_by: string;
  updated_at: string;
  varicella_form_id: string | null;
};

export type VaricellaResponse = {
  data: {
    varicellaAttestationForm: VaricellaAttestationForm;
    varicellaEmployeeInformation: VaricellaEmployeeInformation;
    varicellaFullForm: VaricellaFullForm;
    varicellaSignatureForm: VaricellaSignatureForm;
    status: string;
  };
  status: string;
  message: string;
};
