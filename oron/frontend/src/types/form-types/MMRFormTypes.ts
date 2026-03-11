export type MMRAttestationForm = {
  created_at: string;
  deleted_at: string | null;
  do_not_think_serious_disease: boolean;
  do_not_think_will_contract_mumps: boolean;
  id: string;
  other: null | string;
  side_effects_from_vaccine: boolean;
  updated_at: string;
  user_id: string;
  will_stay_home_if_infected: boolean;
};

export type MMREmployeeInformation = {
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

export type MMRFullForm = {
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

export type MMRSigatureForm = {
  created_at: string;
  deleted_at: string | null;
  id: string;
  signature_data: string;
  signed_by: string;
  tb_form_id: string | null;
  updated_at: string;
};

export type MMRFormResponse = {
  data: {
    mmrAttestationForm: MMRAttestationForm;
    mmrEmployeeInformation: MMREmployeeInformation;
    mmrFullForm: MMRFullForm;
    mmrSignatureForm: MMRSigatureForm;
    status: string;
  };
  status: string;
  message: string;
};
