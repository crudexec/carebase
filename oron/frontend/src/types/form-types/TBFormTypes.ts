export type RiskAssesmentClientDataType = {
  hasHadTb: string;
  tbDate: Date | undefined;
  hasHadPrToTb: string;
  prTbDate: Date | undefined;
  hasBeenImmunized: string;
  immunizedInformation: string | null;
  hasTakenVaccine: string;
  hasTakenSteroids: string;
  hasExposureToTb: string;
  symptoms: string[];
  spentTimeWithSick: string;
  userBornInOptions: string;
  countryOfBirth: string;
  travelledToSpeciicCountry: string;
  countryTravelledTo: string;
  householdMembers: string;
  householdCountry: string;
};

export type PPDAdministrationClientDataType = {
  hasHadTb: string;
  tbDate: Date | undefined;
  hasHadPrToTb: string;
  prTbDate: Date | undefined;
  hasBeenImmunized: string;
  immunizedInformation: string | null;
  hasTakenVaccine: string;
  hasTakenSteroids: string;
  hasExposureToTb: string;
};

export type TBFormPpdAdministration = {
  created_at: string;
  deleted_at: string | null;
  exposure_to_tb_after_last_tb_test: boolean;
  had_positive_tb_skin_test: boolean;
  had_positive_tb_skin_test_date: string | null;
  had_tb_infection: boolean;
  had_tb_infection_date: string;
  have_you_been_immunized_with_bcg_vaccine: boolean;
  id: string;
  immunization_description: string | null;
  steriod_injection_past_two_weeks: boolean;
  steriods_past_four_weeks: boolean;
  tuberculosisMantouxForm_id: string | null;
  updated_at: string;
  user_id: string;
  vaccine_past_two_weeks: boolean;
  status: string;
};

export type TBFormMantouxRiskAssessment = {
  chest_pain: boolean;
  chill_or_fever: boolean;
  coughing_blood: boolean;
  created_at: string;
  deleted_at: string | null;
  exposure_to_tb_past_two_weeks: boolean;
  had_positive_tb_skin_test: boolean;
  had_positive_tb_skin_test_date: string;
  had_tb_infection: boolean;
  had_tb_infection_date: string | null;
  have_you_been_immunized_with_bcg_vaccine: boolean;
  id: string;
  immunization_description: string | null;
  last_chest_xray_date: string;
  loss_of_appetite: boolean;
  owner: string;
  persistent_cough_last_two_weeks: boolean;
  profuse_night_sweats: boolean;
  steriod_injection_past_two_weeks: boolean;
  unexplained_weight_loss: boolean;
  updated_at: string;
  vaccine_past_two_weeks: boolean;
  spent_time_with_tb_patient_in_the_last_two_years: boolean;
  were_you_born_in_a_country_where_tb_is_common: boolean;
  country_of_birth: string;
  traveled_to_a_country_where_tb_is_common: boolean;
  country_of_travel: string;
  members_of_family_traveled_to_US_from_another_country: boolean;
  family_country_of_travel: string;
};

export type TBFormSignature = {
  created_at: string;
  deleted_at: string | null;
  id: string;
  signature_data: string;
  signed_by: string;
  tb_form_id: string | null;
  updated_at: string;
};

export type TBFormResponse = {
  data: {
    ppdAdministrationForm: TBFormPpdAdministration;
    tuberculosisMantouxRiskAssessmentForm: TBFormMantouxRiskAssessment;
    tuberculosisSignatureForm: TBFormSignature;
    status: string;
    tuberculosisFullForm: {
      review_notes: string | null;
    };
  };
  message: string;
};
