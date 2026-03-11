import { WaiverService } from "@/components/clients/new-intake/AdmissionInformation";
import { PersonPresentAtIntake } from "@/components/clients/new-intake/IntakeInformation";

export type AdmissionInformation = {
  id: string;
  poc_authorization_number: string;
  poc_start_date: string;
  poc_end_date: string;
  waiver_services: WaiverService[];
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ClientInformation = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  state: string;
  sex: string;
  race_or_ethinicity: string;
  country: string;
  social_security_number: string;
  medicaid_number: string;
  city: string;
  county: string;
  zip_code: string;
  address_or_street: string;
  apartment_number: string;
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ContactInformation = {
  id: string;
  first_name: string;
  last_name: string;
  relationship: string;
  email: string;
  street_number_and_house_address: string;
  country: string;
  state: string;
  city: string;
  zip_code: string;
  apartment_number: string;
  phone: string;
  home_phone_number: string;
  work_phone_number: string;
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type SchoolContactInformation = {
  id: string;
  name_of_school: string;
  school_address: string;
  phone: string;
  school_email: string;
  contact_person: string;
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type MoreAboutInformation = {
  id: string;
  things_I_can_do_by_myself: string;
  things_I_need_help_with: string;
  new_skills_I_want_to_learn: string;
  my_hobbies: string;
  favorite_food_and_snacks: string;
  what_makes_me_mad: string;
  behaviors_I_sometimes_Display: string;
  ways_my_behaviors_can_be_managed: string;
  my_house_rules: string;
  familiar_communication_modes: string[];
  can_be_transported_alone: boolean;
  toileting: string;
  cared_for_by: string;
  document_provided_during_intake: string;
  good_performance_reward: string;
  other_comments: string;
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type MedicalInformation = {
  id: string;
  diagnosis: string;
  medical_history_or_allergies: string;
  medications: string;
  other_comments: string;
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ReferralInformation = {
  id: string;
  date_of_referral: string;
  referral_source_name: string;
  referral_type: string;
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type IntakeInformation = {
  id: string;
  who_conducted_intake: string;
  date_of_intake: string;
  people_present: PersonPresentAtIntake[] | null;
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type EmergencyContactInformation = {
  id: string;
  first_name: string;
  last_name: string;
  relationship: string;
  email: string;
  street_number_and_house_address: string;
  country: string;
  state: string;
  city: string;
  zip_code: string;
  apartment_number: string;
  phone: string;
  home_phone_number: string;
  work_phone_number: string;
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ServiceCoordinator = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  fax_number: string;
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type IntakeType = {
  account_id: string | null;
  first_name: string | null;
  last_name: string | null;
  id: string;
  status:
    | "active"
    | "inactive"
    | "not_admitted"
    | "new_intake"
    | "disengage"
    | "draft"
    | "submitted"
    | "rejected"
    | "completed";
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
  registered_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  admissionInformation: AdmissionInformation;
  clientInformation: ClientInformation;
  fatherContactInformation: ContactInformation;
  motherContactInformation: ContactInformation;
  schoolContactInformation: SchoolContactInformation;
  moreAboutInformation: MoreAboutInformation;
  medicalInformation: MedicalInformation;
  referralInformation: ReferralInformation;
  intakeInformation: IntakeInformation;
  emergencyContactInformation: ContactInformation;
  serviceCoordinatorInformation: ServiceCoordinator;
  waiverService: {
    id: string;
    select_waiver_system: string;
    service_end_date: string;
    service_start_date: string;
    amount_per_day_week_month: string;
    amount_per_year: string;
    admission_information_id: string;
    registered_by: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }[];
  peoplePresent: {
    id: string;
    first_name: string;
    relationship_to_participant: string;
    registered_by: string;
    intake_information_id: string;
    created_at: string;
    updated_at: string;
  }[];
  profile_picture: string | null;
};

export type FullIntakeType = {
  message: string;
  data: IntakeType[];
};
