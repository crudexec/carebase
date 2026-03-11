export type HepatitisAttestationInformation = {
  arranged_for_hepatitis_b_vaccine_series_of_three: boolean;
  created_at: string;
  declined_hepatitis_b_vaccine_series_of_three: boolean;
  deleted_at: string | null;
  had_hepatitis_b_vaccine_series_of_three: boolean;
  id: string;
  updated_at: string;
  user_id: string;
};

export type HepatitisPersonalInformation = {
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

export type HepatitisSignature = {
  created_at: string;
  deleted_at: string | null;
  id: string;
  signature_data: string;
  signed_by: string;
  tb_form_id: string | null;
  updated_at: string;
};

export type HepatitisResponse = {
  data: {
    attestationInformation: HepatitisAttestationInformation;
    personalInformation: HepatitisPersonalInformation;
    signatureInformation: HepatitisSignature;
    hepatitisBFullForm: {
      review_notes: string;
    };
    status: string;
  };
  status: string;
  message: string;
};
