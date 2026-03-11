export type FluAttestationForm = {
  allergic_to_vaccine_components: null | string;
  concerns_about_vaccine_safety: null | string;
  created_at: string;
  date_received_flu_vaccine: string;
  declined_flu_vaccine: boolean;
  deleted_at: string | null;
  have_received_flu_vaccine: boolean;
  id: string;
  medical_contraindication_to_receiving_vaccine: null | string;
  other: null | string;
  personal_or_religious_beliefs_preventing_vaccination: null | string;
  received_flu_vaccine_elsewhere: null | string;
  updated_at: string;
  user_id: string;
  vaccination_site: string;
};

export type FluEmployeeInformation = {
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

export type FluSignatureForm = {
  created_at: string;
  deleted_at: string | null;
  id: string;
  signature_data: string;
  signed_by: string;
  updated_at: string;
  varicella_form_id: string | null;
};

export type FluFullForm = {
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

export type FluVaccineFormResponse = {
  data: {
    fluAttestationForm: FluAttestationForm;
    fluEmployeeInformation: FluEmployeeInformation;
    fluFullForm: FluFullForm;
    fluSignatureForm: FluSignatureForm;
    status: string;
  };
  status: string;
  message: string;
};
