import {
  EmergencyContactInformation,
  EmployeeDemographicInformation,
} from "./form-types/EmployeeDemographicFormTypes";
import {
  FluAttestationForm,
  FluEmployeeInformation,
  FluFullForm,
  FluSignatureForm,
} from "./form-types/FluVaccineFormTypes";
import {
  Citizenship,
  Document,
  GeneratedFormType,
  GeneratedFormDate,
  PersonalInformation,
  Signature,
} from "./form-types/FormTypes";
import {
  HepatitisAttestationInformation,
  HepatitisPersonalInformation,
  HepatitisSignature,
} from "./form-types/HepatitisFormTypes";
import {
  MMRAttestationForm,
  MMREmployeeInformation,
  MMRFullForm,
  MMRSigatureForm,
} from "./form-types/MMRFormTypes";
import {
  PneumococcalEmployeeInformation,
  PneumococcalSignature,
  PneumococcalVaccination,
  PneumococcalVaccinationFullForm,
} from "./form-types/PneumococcalFormTypes";
import {
  TBFormMantouxRiskAssessment,
  TBFormPpdAdministration,
  TBFormSignature,
} from "./form-types/TBFormTypes";
import {
  VaricellaAttestationForm,
  VaricellaEmployeeInformation,
  VaricellaFullForm,
  VaricellaSignatureForm,
} from "./form-types/VaricellaFormTypes";

export type SingleUser = {
  account_id: string;
  approved: number;
  awaiting_approval: number;
  created_at: string;
  deleted_at: string | null;
  email: string;
  first_name: string;
  id: string;
  in_progress: number;
  last_name: string;
  not_started: number;
  password: string;
  role: "STANDARD" | "ADMINISTRATOR" | "CLIENT_MANAGER" | "EMPLOYEE_MANAGER";
  status?: "ACTIVE" | "INACTIVE" | "DISENGAGED";
  updated_at: string;
};

export type AllUsersResponse = {
  message: string;
  data: {
    page: number;
    size: number;
    total: number;
    usersData: SingleUser[];
  };
};

export type TransformUserResponse = {
  data: {
    usersData: SingleUser[];
  };
};

export type UserFormData = {
  user: SingleUser;
  userBioDataForm: {
    userBioData: Record<string, any>;
  };
  referenceForm: {
    referenceForm: Record<string, any>;
  };
  employeeDemographicForm: {
    emergencyContactInformation: Record<string, any>;
    employeeDemographicInformation: Record<string, any>;
  };
  fluForm: {
    fluFullForm: Record<string, any>;
    fluEmployeeInformation: Record<string, any>;
    fluAttestationForm: Record<string, any>;
    fluSignatureForm: Record<string, any>;
  };
  hepatitisBForm: {
    hepatitisBAttestationForm: {
      id: string;
      had_hepatitis_b_vaccine_series_of_three: boolean;
      arranged_for_hepatitis_b_vaccine_series_of_three: boolean;
      declined_hepatitis_b_vaccine_series_of_three: boolean;
      user_id: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    hepatitisBFullForm: {
      id: string;
      personal_information_id: string | null;
      attestation_id: string;
      signature_id: string | null;
      status: string;
      user_id: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    personalInformationHepatitisBForm: Record<string, any>;
    hepatitisBSignatureForm: Record<string, any>;
  };
  i9Form: {
    citizenshipForm: Record<string, any>;
    documents: Record<string, any>;
    i9Form: Record<string, any>;
    personalInformation: Record<string, any>;
    signature: Record<string, any>;
  };

  mmrForm: {
    mmrFullForm: Record<string, any>;
    mmrSignatureForm: Record<string, any>;
    mmrAttestationForm: Record<string, any>;
    mmrEmployeeInformation: Record<string, any>;
  };

  pneumococcalForm: {
    employeeInformation: Record<string, any>;
    pneumococcalSignatureForm: Record<string, any>;
    pneumococcalVaccinationFullForm: Record<string, any>;
    pneumococcalVaccinationForm: Record<string, any>;
  };
  tuberculosisForm: {
    ppdAdministrationForm: Record<string, any>;
    tuberculosisSignatureForm: Record<string, any>;
    tuberculosisFullForm: Record<string, any>;
    tuberculosisMantouxForm: Record<string, any>;
  };
  varicellaForm: {
    varicellaSignatureForm: Record<string, any>;
    varicellaFullForm: Record<string, any>;
    varicellaAttestationForm: Record<string, any>;
    varicellaEmployeeInformation: Record<string, any>;
  };
  cjisForm: any;
};

export type MappedFormData = {
  biodata: {
    data: {
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
      review_notes: string | null;
    };
  };
  reference: {
    data: {
      created_at: string | null;
      deleted_at: string | null;
      id: string;
      referrer_one_email: string;
      referrer_one_firstname: string;
      referrer_one_lastname: string;
      referrer_one_phone: string;
      referrer_three_email: string;
      referrer_three_firstname: string;
      referrer_three_lastname: string;
      referrer_three_phone: string;
      referrer_two_email: string;
      referrer_two_firstname: string;
      referrer_two_lastname: string;
      referrer_two_phone: string;
      review_notes: string | null;
      status: string;
      submitted_at: string | null;
      updated_at: string | null;
      user_id: string;
    };
  };
  i9: {
    data: {
      citizenshipForm: Citizenship;
      documents: Document | Document[];
      i9Form: {
        citizenship_form_id: string;
        created_at: string;
        deleted_at: string | null;
        document_id: string;
        id: string;
        filled_pdf_json_data: string;
        owner: string;
        personal_information_id: string | null;
        signature_id: string;
        status: string;
        updated_at: string;
        review_notes: string | null;
      };
      personalInformation: PersonalInformation;
      signature: Signature;
    };
  };
  employeeDemographic: {
    data: {
      emergencyContactInformation: EmergencyContactInformation;
      employeeDemographicInformation: EmployeeDemographicInformation;
    };
  };
  fluVaccine: {
    data: {
      fluAttestationForm: FluAttestationForm;
      fluEmployeeInformation: FluEmployeeInformation;
      fluFullForm: FluFullForm;
      fluSignatureForm: FluSignatureForm;
    };
  };
  hepatitisVaccination: {
    data: {
      hepatitisBAttestationForm: HepatitisAttestationInformation;
      hepatitisBFullForm: {
        id: string;
        personal_information_id: string;
        attestation_id: string;
        signature_id: string;
        status: string;
        review_notes: string | null;
        user_id: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      };
      hepatitisBSignatureForm: HepatitisSignature;
      personalInformationHepatitisBForm: HepatitisPersonalInformation;
    };
  };

  mmrVaccine: {
    data: {
      mmrAttestationForm: MMRAttestationForm;
      mmrEmployeeInformation: MMREmployeeInformation;
      mmrFullForm: MMRFullForm;
      mmrSignatureForm: MMRSigatureForm;
    };
  };
  pneumococcalVaccination: {
    data: {
      employeeInformation: PneumococcalEmployeeInformation;
      pneumococcalSignatureForm: PneumococcalSignature;
      pneumococcalVaccinationForm: PneumococcalVaccination;
      pneumococcalVaccinationFullForm: PneumococcalVaccinationFullForm;
    };
  };
  tbForm: {
    data: {
      ppdAdministrationForm: TBFormPpdAdministration;
      tuberculosisFullForm: {
        id: string;
        ppd_administration_form_id: string | null;
        tuberculosis_testing_form_id: string;
        tb_signature_id: string;
        status: any;
        review_notes: string | null;
        owner: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      };
      tuberculosisMantouxForm: TBFormMantouxRiskAssessment;
      tuberculosisSignatureForm: TBFormSignature;
    };
  };
  varicellaVaccine: {
    data: {
      varicellaAttestationForm: VaricellaAttestationForm;
      varicellaEmployeeInformation: VaricellaEmployeeInformation;
      varicellaFullForm: VaricellaFullForm;
      varicellaSignatureForm: VaricellaSignatureForm;
    };
  };
  cjisAttestation: any;
};

export type UserFormDataResponse = {
  message: string;
  data: UserFormData;
};

export type UserFormInfo = GeneratedFormType & {
  formIds: GeneratedFormDate;
  forms: MappedFormData;
};

export type UserFormStatusTotalResponse = {
  message: string;
  data: {
    user: SingleUser;
    formsData: any;
    total: number;
  };
};

export type UserDocument = {
  created_at: string;
  deleted_at: string | null;
  document_title: string;
  document_url: string;
  id: string;
  owner: string;
  review_notes: string | null;
  status: string;
  updated_at: string;
};

export type AdmimUserDocument = {
  data: UserDocument[];
  message: string;
};

export type IntakeClientDetails = {
  account_id: string;
  admission_information_id: string;
  client_information_id: string;
  created_at: string;
  deleted_at: string | null;
  emergency_contact_information_id: string;
  father_contact_information_id: string;
  first_name: string;
  id: string;
  intake_information_id: string;
  last_name: string;
  medical_information_id: string;
  more_about_information_id: string;
  mother_contact_information_id: string;
  profile_picture: string;
  referral_information_id: string;
  registered_by: string;
  school_contact_information_id: string;
  service_coordinator_information_id: string;
  status: string;
  updated_at: string;
};

export type VisitLog = {
  id: string;
  intake_client_details: IntakeClientDetails;
  intake_full_id: string;
  date_of_visit: string; // ISO 8601 format
  start_time: string;
  end_time: string;
  status: string;
  treatment_plan_id: string | null;
  account_id: string;
  behavior_management_ids: string[];
  communication_id: string;
  concern_and_challenges_id: string;
  created_at: string; // ISO 8601 format
  deleted_at: string | null;
  domestic_skill_training_id: string;
  personal_care_and_bladder_control_id: string;
  personal_work_reading_id: string;
  play_leisure_id: string;
  registered_by: string;
  safety_and_survival_skills_id: string;
  self_management_id: string;
  sensory_need_and_motor_development_id: string;
  session_highlights_id: string;
  snack_meal_time_id: string;
  socialization_id: string;
  utilization_of_money_id: string;
  visit_goal_ids: string[];
  staff: Staff;
  updated_at: string; // ISO 8601 format
};

export type Staff = {
  id: string;
  account_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  password: string;
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
  deleted_at: string | null;
};

export type VisitExportApiResponse = {
  message: string;
  data: VisitLog[];
};
