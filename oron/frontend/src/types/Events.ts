import { TreatmentPlanEnumType } from "@/utils/treatmentPlanHelpers";

export type AllClientsIntake = {
  message: string;
  data: {
    account_id: string;
    admission_information_id: string | null;
    client_information_id: string | null;
    created_at: string;
    deleted_at: string | null;
    emergency_contact_information_id: string | null;
    father_contact_information_id: string | null;
    first_name: string;
    id: string;
    intake_information_id: string | null;
    last_name: string;
    medical_information_id: string | null;
    more_about_information_id: string | null;
    mother_contact_information_id: string | null;
    profile_picture: string | null;
    referral_information_id: string | null;
    registered_by: string;
    school_contact_information_id: string | null;
    service_coordinator_information_id: string | null;
    status: string;
    updated_at: string;
    treatment_plan_exists: boolean;
  }[];
};

export type AllEmployeesForSchedule = {
  message: string;
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    account_id?: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    role?: string;
  }[];
};

export type Event = {
  account_id: string;
  client_intake_id: string;
  client_name: string;
  created_at: string;
  declination_date: string | null;
  declination_reason: string | null;
  deleted_at: string | null;
  employee_or_staff_name: string;
  end_time: string;
  event_date: string;
  id: string;
  notes: string;
  scheduled_by: string;
  should_repeat: boolean;
  start_time: string;
  updated_at: string;
  employee_or_staff_id: string;
  was_rescheduled: boolean;
  event_approved?: boolean;
};

export type AllEvents = {
  data: Event[];
  message: string;
};

export type Request = {
  account_id: string;
  client_intake_id: string | null;
  created_at: string;
  deleted_at: string | null;
  end_time: string | null;
  events: null | {
    account_id: string;
    client_intake_id: string;
    client_name: string;
    created_at: string;
    declination_date: string | null;
    declination_reason: string | null;
    deleted_at: string | null;
    employee_or_staff_id: string;
    employee_or_staff_name: string;
    end_time: string;
    event_date: string;
    id: string;
    notes: string;
    scheduled_by: string;
    should_repeat: boolean;
    start_time: string;
    updated_at: string;
    was_rescheduled: boolean;
  };
  former_event_id: string;
  id: string;
  new_rescheduled_event_date: string;
  notes: string | null;
  reason_for_rescheduling: string;
  reschedule_approved: boolean;
  rescheduled_by: string;
  should_repeat: boolean;
  start_time: string | null;
  updated_at: string;
};

export type AllRequests = {
  data: Request[];
  message: string;
};

export type SingleEvent = {};

export type FilteredEvent = {
  data: Event[];
  message: string;
};

export type TimeSlot = {
  day_of_week: string;
  start_time: string;
  end_time: string;
  checked: boolean;
};

export type ClientSchedule = {
  created_at: string;
  deleted_at: string | null;
  end_date: string;
  google_calendar_event_id: string | null;
  id: string;
  intake_full_id: string;
  registered_by: string;
  start_date: string;
  time_slot: TimeSlot[];
  updated_at: string;
};

export type TreatmentPlanBasicInformation = {
  id: string;
  participant_first_name: string;
  participant_last_name: string;
  participant_father_name: string;
  participant_mother_name: string;
  father_mobile_number: string;
  mother_mobile_number: string;
  address_street_information: string;
  country: string;
  state: string;
  city: string;
  county: string | null;
  apartment_number: string;
  zip_code: string;
  tp_implemented_by: string;
  tp_type: string;
  implementation_start_date: string; // ISO 8601 date string
  implementation_stop_date: string; // ISO 8601 date string
  participant_background_information: string;
  behavior_intervention_protocol: string;
  transport_requirements_and_recommendations: string;
  phone: string | null;
  statement_of_family_strength_and_resources: string;
  intake_full_id: string;
  registered_by: string;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  deleted_at: string | null;
};

export type TreatmentPlanGoal = {
  id: string;
  goal_area: string;
  target_skill: string;
  short_term_objective: string;
  objective_term_steps: TreatmentPlanObjectiveTermStep[]; // Array to represent multiple steps
  goal_status: string;
  goal_setting: string;
  number_of_trials: number;
  goal_frequency: string;
  current_skill_level: string;
  present_level: string;
  target_level: string;
  target_performance_level: string;
  goal_background: string;
  goal_statement: string;
  implementation_procedure: string;
  evaluating_progress: string[];
  reinforcers: string[];
  materials: string[];
  progress_monitoring: string;
  mastery_towards_goal_achievement: string;
  expected_outcome: string;
  goal_comment: string | null;
  consequences: string[];
  treatment_plan_id: string | null; // nullable field
  intake_full_id: string;
  registered_by: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  deleted_at: string | null; // nullable field
};

export type TreatmentPlanObjectiveTermStep = {
  task_analysis: string;
  baseline: string;
};

export type TreatmentPlanSignature = {
  id: string;
  full_name: string;
  signature_url: string;
  intake_full_id: string;
  treatment_full_id: string;
  signed_by: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  deleted_at: string | null; // nullable field
  date_parent_signed: string | null;
  parent_signed: boolean;
  parent_signature_url: string | null;
};

export type TreatmentPlanDocuments = {
  id: string;
  document_name: string;
  description: string;
  document_url: string;
  intake_full_id: string;
  uploaded_by: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  deleted_at: string | null; // ISO date string or null
};

export type SingleTreatmentPlan = {
  id: string;
  basic_information_id: string | null;
  treatment_goal_ids: string | null;
  treatment_schedule_id: string;
  status: string;
  intake_full_id: string;
  registered_by: string;
  parent_name: string | null;
  parent_email: string | null;
  relation_to_participant: string | null;
  parent_email_sent: boolean;
  created_at: string; // You can use Date type if you prefer
  updated_at: string; // You can use Date type if you prefer
  deleted_at: string | null;
  basicInformation: TreatmentPlanBasicInformation;
  treatmentSchedule: ClientSchedule[];
  treatmentGoalSignature?: TreatmentPlanSignature;
  treatmentGoal: TreatmentPlanGoal[];
  treatmentDocuments: TreatmentPlanDocuments[];
  active_treatment: boolean;
  treatment_plan_type: TreatmentPlanEnumType;
};

export type TreatmentPlan = {
  data: {
    treatmentPlans: SingleTreatmentPlan[];
    treatmentDocuments: TreatmentPlanDocuments[];
  };
  message: string;
};

export type ParentTreatmentPlan = {
  data: SingleTreatmentPlan;
  message: string;
};
