export type ClientInformationResponseType = {
  data: {
    country: string;
    created_at: string;
    date_of_birth: string;
    deleted_at: string | null;
    first_name: string;
    id: string;
    last_name: string;
    medicaid_number: string;
    race_or_ethinicity: string;
    sex: string;
    social_security_number: string;
    state: string;
    updated_at: string;
    user_id: string;
  };
  message: string;
};

export type ReferralInformationResponseType = {
  data: {
    created_at: string;
    date_of_referral: string;
    deleted_at: string | null;
    referral_type: string;
    id: string;
    referral_source_name: string;
    updated_at: string;
    user_id: string;
  };
  message: string;
};

export type IntakeInformationResponseType = {
  data: {
    id: string;
    who_conducted_intake: string;
    date_of_intake: string;
    people_present:
      | null
      | { first_name: string; relationship_to_participant: string }[];
    user_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  message: string;
};

export type ServiceCordinatorResponseType = {
  data: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    country: string;
    fax_number: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  message: string;
};

export type MedicalResponseType = {
  data: {
    id: string;
    diagnosis: string;
    medical_history_or_allergies: string;
    medications: string;
    other_comments: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  message: string;
};

export type AdmissionInformationType = {
  data: {
    admissionInformation: {
      id: string;
      poc_authorization_number: string;
      poc_start_date: string;
      poc_end_date: string;
      waiver_services: string | null;
      user_id: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    waiverServices: {
      id: string;
      select_waiver_system: string;
      service_start_date: string;
      service_end_date: string;
      amount_per_day_week_month: string;
      amount_per_year: string;
      admission_information_id: string;
      user_id: string;
      created_at: string;
      updated_at: string;
      deleted_at?: string | null;
    }[];
  };
  message: string;
};

export type MoreAboutClientResponseType = {
  data: {
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
    user_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  message: string;
};

export type ContactInformationType = {
  id: string;
  first_name: string;
  last_name: string;
  relationship: string | null;
  email: string | null;
  street_number_and_house_address: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  zip_code: string | null;
  apartment_number: string | null;
  phone: string | null;
  home_phone_number: string | null;
  work_phone_number: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type SchoolInformation = {
  id: string;
  name_of_school: string;
  school_address: string;
  phone: string;
  school_email: string;
  contact_person: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ContactResponseType = {
  data: {
    father: ContactInformationType;
    mother: ContactInformationType;
    emergency: ContactInformationType;
    school: SchoolInformation;
  };
  message: string;
};
