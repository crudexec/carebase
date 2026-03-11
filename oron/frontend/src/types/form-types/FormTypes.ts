export type BiodataFormResponse = {
  message: string;
  data: {
    cityOrTown: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    socialSecurityNumber: string;
    zipCode: string;
    apartmentNumber: string | undefined;
    middleName: string | undefined;
    otherLastName: string | undefined;
    id: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    other_last_name: string | null;
    email: string;
    phone: string;
    address: string;
    apartment_number: string | null;
    city: string;
    state: string;
    zip_code: string;
    social_security_number: string | null;
    user_id: string;
    form_completed: boolean;
    form_completed_by: string | null;
    form_filled_by: string | null;
    form_completed_at: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    review_notes: string;
    status: FormStatus;
    npi: string | null;
    lba: string | null;
  };
  status: FormStatus;
};

export type CitizenshipRequest = {
  citizenship_status: string;
  uscis_number?: string;
  work_license_expiry_date?: string;
  i_94_number?: string;
  foreign_passport_number?: string;
  foreign_passport_issuing_country?: string;
};

export type DocumentUploadRequest = {
  title: string;
  issuing_authority: string;
  document_number?: string;
  file_url: string;
  expiration_date?: string;
};

export type PersonalInformation = {
  id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  other_last_name: string | null;
  email: string;
  phone: string;
  address: string;
  apartment_number: string | null;
  city: string;
  state: string;
  zip_code: string;
  social_security_number: string | null;
  user_id: string;
  form_completed: boolean;
  form_completed_by: string | null;
  form_filled_by: string | null;
  form_completed_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Citizenship = {
  id: string;
  citizenship_status: string;
  uscis_number: string;
  work_license_expiry_date: string;
  i_94_number: string;
  foreign_passport_number: string;
  foreign_passport_issuing_country: string;
  owner: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Signature = {
  id: string;
  signature_data: string;
  signed_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Document = {
  id: string;
  title: string;
  issuing_authority: string;
  document_number: string;
  file_url: string;
  expiration_date: string;
  owner: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type INineFormResponse = {
  message: string;
  data: {
    personalInformation: PersonalInformation;
    citizenship: Citizenship;
    signature: Signature;
    documents: Document | Document[];
    review_notes: string;
    i9Form: {
      id: string;
      review_notes: string;
      filled_pdf_json_data: string;
    };
  };
  status: FormStatus;
};

export type FormStatus =
  | "not_started"
  | "in_progress"
  | "awaiting_approval"
  | "approved"
  | "reviewed";

export type FormattedFormStatus =
  | "In Progress"
  | "Awaiting Approval"
  | "Approved"
  | "Correction Required"
  | "Not Filled";

export type GeneratedFormStatus = {
  biodata: FormattedFormStatus;
  refForm: FormattedFormStatus;
  i9: FormattedFormStatus;
  employeeDemographic: FormattedFormStatus;
  tbForm: FormattedFormStatus;
  pneumococcalVaccination: FormattedFormStatus;
  hepatitisVaccination: FormattedFormStatus;
  varicellaVaccine: FormattedFormStatus;
  mmrVaccine: FormattedFormStatus;
  fluVaccine: FormattedFormStatus;
  cjisAttestation: FormattedFormStatus;
};

export type GeneratedFormDate = {
  biodata: string;
  refForm: string;
  i9: string;
  employeeDemographic: string;
  tbForm: string;
  pneumococcalVaccination: string;
  hepatitisVaccination: string;
  varicellaVaccine: string;
  mmrVaccine: string;
  fluVaccine: string;
  cjisAttestation: string;
};

export type GeneratedFormType = {
  status: GeneratedFormStatus;
  createdDate: GeneratedFormDate;
  submittedDate: GeneratedFormDate;
  progress: GeneratedFormDate;
  completedForms: any;
};

export type GeneratedFormStatusWithIndex = {
  [key: string]: FormattedFormStatus;
};

export type GeneratedFormDateWithIndex = {
  [key: string]: string;
};
