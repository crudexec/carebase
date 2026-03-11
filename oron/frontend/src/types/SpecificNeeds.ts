export type SpecificNeedsBasicnformation = {
  id: string;
  participant_first_name: string;
  participant_last_name: string;
  participant_father_name: string;
  participant_mother_name: string;
  gender: string;
  date_of_birth: string;
  father_mobile_number: string;
  mother_mobile_number: string;
  home_address: string;
  treatment_plan_type: string;
  specific_needs_implemented_by: string;
  intake_full_id: string;
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type SpecificNeedsServiceNeeds = {
  id: string;
  iiss: boolean;
  therapeuticServices: boolean;
  respite: boolean;
  familyTraining: boolean;
  transportToSchoolMorning: boolean;
  transportFromSchoolToTI: boolean;
  transportFromTIToHome: boolean;
  transportToCommunity: boolean;
  noSupervisionNeeded: boolean;
  supervisionNeeded: boolean;
  harnessNeeded: boolean;
  hasPreferredCaregiver: boolean;
  preferredCaregiverName: string | null;
  preferredCaregiverPhone: string | null;
  preferredCaregiverPhoneCountry: string | null;
  intake_full_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CurrentNeedItem = {
  description?: string;
  specificNeeds: string[];
  recommendation: string;
  current_need_details: string;
};

export type SpecificNeedsCurrentNeeds = {
  id: string;
  current_needs: CurrentNeedItem[];
  intake_full_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type SpecificNeedsAuthorization = {
  id: string;
  creator_name: string;
  signature_confirmation: boolean;
  signature_url: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  intake_full_id: string;
};

export type IntakeFullForm = {
  id: string;
  first_name: string;
  last_name: string;
  account_id: string;
  status: string;
  admission_information_id: string;
  client_information_id: string;
  father_contact_information_id: string;
  mother_contact_information_id: string;
  school_contact_information_id: string;
  service_coordinator_information_id: string;
  more_about_information_id: string;
  medical_information_id: string;
  referral_information_id: string;
  intake_information_id: string;
  emergency_contact_information_id: string;
  profile_picture: string | null;
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type FullSpecificNeedsForm = {
  message: string;
  data: {
    id: string;
    basic_information_id: string | null;
    service_needs_id: string | null;
    current_need_or_support_id: string | null;
    authorization_id: string | null;
    intake_full_id: string;
    status: string;
    registered_by: string;
    createdAt: string;
    updatedAt: string;
    deleted_at: string | null;
    basicInformation: SpecificNeedsBasicnformation;
    serviceNeeds: SpecificNeedsServiceNeeds;
    currentNeedOrSupport: SpecificNeedsCurrentNeeds;
    authorization: SpecificNeedsAuthorization;
    intakeFullForm: IntakeFullForm;
  };
};
