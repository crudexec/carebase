export enum CitizenshipStatus {
  CITIZEN = 'A citizen of the United States',
  NON_CITIZEN_AUTHORIZED_TO_WORK = 'A noncitizen national of the United States',
  LAWFUL_PERMANENT_RESIDENT = 'A lawful permanent resident',
  AUTHORIZED_FOR_WORK_ONLY = 'A non-citizen authorized to work',
}

export enum Gender {
  FEMALE = 'female',
  MALE = 'male',
  NO_PREFERENCE = 'no_preference',
}

export enum Ethnicity {
  AMERICAN_INDIAN_OR_ALASKAN_NATIVE = 'American Indian or Alaska Native',
  ASIAN = 'Asian',
  BLACK_OR_AFRICAN_AMERICAN = 'Black or African American',
  HAWAIIAN_OR_PACIFIC_ISLANDER = 'Hawaiian or Pacific Islander',
  WHITE_OR_CAUCASIAN = 'White or Caucasian',
}

export enum Status {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  AWAITING_APPROVAL = 'awaiting_approval',
  APPROVED = 'approved',
  REVIEWED = 'reviewed',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  SUBMITTED = 'submitted',
  DRAFT = 'draft',
  NOT_FILLED = 'not_filled',
  NOT_SENT = 'not_sent',
  AWAITING_SIGNATURE = 'awaiting_signature',
  SIGNED = 'signed',
}

export enum IntakeFormStatus {
  Active = 'active',
  Inactive = 'inactive',
  Disengage = 'disengage',
  Not_Admitted = 'not_admitted',
  New_Intake = 'new_intake',
  Draft = 'draft',
  Submitted = 'submitted',
}

export enum TreatmentPlanType {
  IISS_ASSESSMENT = 'IISS_Assessment',
  FC_ASSESSMENT = 'FC_Assessment',
  ITI_ASSESSMENT = 'ITI_Assessment',
  ALP_ASSESSMENT = 'ALP_Assessment',
  RESPITE = 'Respite',
}

export enum TPType {
  INITIAL = 'Initial',
  PROVISIONAL = 'Provisional',
  ANNUAL = 'Annual',
}
