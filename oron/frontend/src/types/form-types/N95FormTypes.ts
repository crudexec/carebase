export type N95SignatureForm = {
  created_at: string;
  date_of_filling_form: string;
  deleted_at: string | null;
  full_name: string;
  id: string;
  n95_form_id: string | null;
  signature_data: string;
  signed_by: string;
  updated_at: string;
};

export type N95AttestationForm = {
  created_at: string;
  deleted_at: string | null;
  id: string;
  status_received_n95_fit_testing: boolean;
  updated_at: string;
  user_id: string;
};

export type N95FullForm = {
  attestation_id: string;
  created_at: string;
  deleted_at: string | null;
  id: string;
  signature_id: string;
  status: string;
  updated_at: string;
  user_id: string;
};

export type N95FormResponse = {
  message: string;
  status: string;
  data: {
    signatureForm: N95SignatureForm;
    fullForm: N95FullForm;
    attestationForm: N95AttestationForm;
  };
};
