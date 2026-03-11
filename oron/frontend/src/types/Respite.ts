import { Staff } from "./Visit";

export type RespiteSessionHighlights = {
  id: string;
  location: string;
  level_of_compliance: string;
  injury_to_self: string; // String representation of "20+"
  aggression_to_others: string; // String representation of "7 - 20"
  client_hospitalized_in_care_today: boolean;
  client_placed_themselves_in_harm_by_leaving_my_care: boolean;
  status: string;
  account_id: string;
  treatment_plan_id: string | null;
  visit_full_form_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};
export type RespiteSelfManagement = {
  id: string;
  responding_to_others: string | null;
  sharing: string | null;
  increasing_on_task_behavior: string | null;
  initiating_interactions: string | null;
  conversing_with_others: string | null;
  increasing_play_skills: boolean;
  promoting_daily_living_skills: string | null;
  taking_turns: string | null;
  following_the_rules: string | null;
  reducing_occurence_of_interfering_behavior: boolean;
  cooperate_with_peers_in_group_activity: string | null;
  other: string | null;
  treatment_plan_id: string | null;
  visit_full_form_id: string;
  status: string;
  account_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};

export type RespiteCommunication = {
  id: string;
  gestures: string | null;
  written_words: string | null;
  picture_communication_symbols: string | null;
  objects: boolean;
  short_phrases: string | null;
  repetitive_phrases: string | null;
  icons_pictures: string | null;
  verbal_sounds: string | null;
  type_words: string | null;
  single_words: boolean;
  photographs: string | null;
  sign_language: string | null;
  an_augmentative_communication_device: string | null;
  picture_exchange_communication_system: string | null;
  other: string | null;
  other_description: string | null;
  treatment_plan_id: string | null;
  status: string;
  account_id: string;
  visit_full_form_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};

export type RespiteConcernAndChallenges = {
  id: string;
  was_there_any_concerns_or_challenges: boolean;
  supervisor_to_contact_during_session: boolean;
  describe_circumstances_involved: string | null;
  treatment_plan_id: string | null;
  status: string;
  account_id: string;
  visit_full_form_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};

export type RespiteDomesticSkillTraining = {
  id: string;
  assist_to_make_bed: boolean;
  assist_to_dust_furniture: boolean;
  assist_to_vacuum: boolean;
  assist_to_arrange_clothes: boolean;
  assist_to_laundry: boolean;
  assist_to_do_dishes: boolean;
  assist_to_remove_trash: boolean;
  assist_to_fold_clothes: boolean;
  other: boolean;
  specify_other: string | null;
  status: string;
  account_id: string;
  treatment_plan_id: string | null;
  visit_full_form_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};

export type RespitePlayLeisure = {
  id: string;
  puzzle: boolean;
  dance: boolean;
  arts_and_crafts: boolean;
  listen_to_music: boolean;
  icons_or_pictures: boolean;
  computer_games: boolean;
  short_naps: boolean;
  other: boolean;
  other_specify: string | null;
  status: string;
  account_id: string;
  treatment_plan_id: string | null;
  visit_full_form_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};

export type RespiteSnackMealTime = {
  id: string;
  ate_all_meal_or_snack: boolean | null;
  ate_some_meal_or_snack: boolean | null;
  refused_all_meal_or_snack: boolean | null;
  drank_a_lot_of_water: boolean;
  drank_some_water: boolean | null;
  refused_all_water: boolean | null;
  drank_a_lot_of_juice: boolean | null;
  drank_some_juice: boolean | null;
  refused_all_juice: boolean | null;
  specify_what_snack_or_meal_provided: string | null;
  prepared_snack_or_meal: boolean | null;
  served_snack_or_meal: boolean | null;
  assisted_with_feeding: boolean;
  clean_up_after_snack_or_meal: boolean | null;
  other: boolean | null;
  specify_other: string | null;
  client_helped_to_clean_up_and_put_away_dishes: boolean;
  treatment_plan_id: string | null;
  visit_full_form_id: string;
  status: string;
  account_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};

export type RespiteUtilizationOfMoney = {
  id: string;
  handing_bills_to_cashier: boolean;
  waiting_for_and_receiving_debit_credit_card: boolean;
  handing_coins_to_cashier: boolean;
  counting_the_change_to_make_sure_it_is_correct: boolean;
  handing_debit_credit_card_to_cashier: boolean;
  determining_and_handling_the_correct_estimated_amount: boolean;
  using_the_dollar_up_program: boolean;
  obtaining_and_reviewing_receipt_for_accuracy: boolean;
  waiting_for_and_accepting_the_change: boolean;
  this_activity_occured_at: string;
  status: string;
  account_id: string;
  treatment_plan_id: string | null;
  visit_full_form_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};

export type RespiteSocialization = {
  id: string;
  birthday_party: boolean;
  communication_session: boolean;
  social_group: boolean;
  music_dance_group: boolean;
  other_social_setting: boolean;
  specify_other_social_setting: string | null;
  play_at_the_park: boolean;
  basketball: boolean;
  watch_movie: boolean;
  bowling: boolean;
  swimming: boolean;
  other_recreation: boolean;
  specify_other_recreation: string | null;
  visit_to_the_library: boolean;
  visit_to_the_museum: boolean;
  visit_to_the_zoo: boolean;
  visit_to_the_shopping_mall: boolean;
  visit_to_the_post_office: boolean;
  other_community_integration: boolean;
  specify_other_community_integration: string | null;
  status: string;
  account_id: string;
  treatment_plan_id: string | null;
  visit_full_form_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};

export type RespiteSafetyAndSurvivalSkills = {
  id: string;
  cross_the_street: boolean;
  awareness_of_strangers: boolean;
  fire_emergency_awareness: boolean;
  unlock_door_when_trapped_in_a_room: boolean;
  other: boolean;
  specify_other: string | null;
  status: string;
  account_id: string;
  treatment_plan_id: string | null;
  visit_full_form_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};

export type RespitePersonalCareAndBladderControl = {
  id: string;
  client_name_used_bathroom_without_assistance: boolean;
  assisted_client_with_changing_diapers: boolean;
  assisted_client_with_toileting: boolean;
  other_bowel: boolean;
  other_specify_bowel: string | null;
  supported_client_with_shampooing: boolean;
  supported_client_with_brushing_teeth: boolean;
  supported_client_with_bathing: boolean;
  supported_client_with_toweling: boolean;
  supported_client_with_showering: boolean;
  supported_client_with_menstrual_care: boolean;
  other_personal_hygiene: boolean;
  other_specify_personal_hygiene: string | null;
  status: string;
  account_id: string;
  treatment_plan_id: string | null;
  visit_full_form_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};

export type RespiteSensoryNeedAndMotorDevelopment = {
  id: string;
  paste_objects: boolean;
  copy_simple_shapes: boolean;
  turn_pages_of_book: boolean;
  button_a_shirt: boolean;
  use_of_cutlery: boolean;
  cut_simple_shapes: boolean;
  use_pencil_and_crayons_well: boolean;
  zip_a_zipper: boolean;
  handle_scissors_well: boolean;
  play_musical_instruments: boolean;
  match_simple_objects: boolean;
  complete_simple_puzzles: boolean;
  build_with_blocks: boolean;
  other_error_motor_development_skills: boolean;
  other_error_specify_motor_development_skills: string | null;
  throw_a_ball: boolean;
  kick_using_balls: boolean;
  roll_balls_with_hand_or_foot: boolean;
  skip_in_circles: boolean;
  hang_clothes: boolean;
  go_down_slides: boolean;
  climb_ladders: boolean;
  walk_a_straight_line: boolean;
  jump_rope: boolean;
  run_around_objects: boolean;
  toss_a_ball: boolean;
  walk_backwards: boolean;
  balance_on_one_foot: boolean;
  going_up_and_down_steps: boolean;
  pump_legs_on_the_swing_at_a_playground: boolean;
  other_gross_motor_skills: boolean;
  other_specify_gross_motor_skills: string | null;
  status: string;
  account_id: string;
  treatment_plan_id: string | null;
  visit_full_form_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};

export type RespitePersonalWorkReading = {
  id: string;
  grammar: boolean;
  writing_skills: boolean;
  vocabulary: boolean;
  reading_comprehension: boolean;
  algebra: boolean;
  geometry: boolean;
  measurement: boolean;
  number_operations: boolean;
  other: boolean;
  other_specify: string | null;
  i_read_a_book_to_client: boolean;
  status: string;
  account_id: string;
  treatment_plan_id: string | null;
  visit_full_form_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};

export type RespiteBehaviorManagement = {
  id: string;
  behavior_type: string;
  behavior_description: string;
  what_time_did_behavior_occur: string; // e.g., "2:00 PM"
  antecedent: string;
  consequence: string;
  setting: string;
  how_many_times_did_behavior_occur: string;
  for_how_long_did_behavior_occur: string;
  severity: string;
  other_crisis_intervention: string;
  other_specific_description: string | null;
  treatment_plan_id: string | null;
  visit_full_form_id: string;
  status: string;
  account_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};

export type RespiteGoals = {
  id: string;
  where_was_the_activity_practiced: string; // e.g., "Through telehealth"
  indicate_circumstances_leading_to_activity: string;
  client_response_or_reaction_was: string;
  consequently_client_did: string;
  total_time_spent_on_activity: string; // e.g., duration in minutes
  client_reward: string;
  goal_steps: {
    task_analysis: string;
    response: string;
    prompt_used: string;
    opportunities: string;
    success: string;
  }[];

  additional_comments: string | null;
  status: string; // e.g., "in_progress"
  account_id: string;
  treatment_plan_id: string | null;
  goal_background: string | null;
  short_term_objective: string | null;
  visit_full_form_id: string;
  registered_by: string;
  created_at: string; // ISO date format
  updated_at: string; // ISO date format
  deleted_at: string | null;
};

export type RespiteTransportationType = {
  id: string;

  transportation_type_details?: {
    whereWasDroppedOff?: string;
    whoDroppedOff?: string;
    transportationStartTime?: string;
    transportationEndTime?: string;
    startLocation?: string;
    endingLocation?: string;
    totalTransportationTime?: string;
  };

  transportation_safety_objectives?: {
    objective?: string;
    objective_option?: string;
  }[];

  unusual_occurrences?: {
    hasUnusualOccurrence?: boolean;
    vehiclePulledOverDueToBehavior?: boolean;
    vehiclePulledOverToAttendToNeeds?: boolean;
    trafficOnWay?: boolean;
    other?: {
      selected?: boolean;
      explanation?: string;
    };
  };

  traffic_sign_recognition?: {
    redLightIdentification: {
      identified: boolean;
      option_picked: string;
    };
    yellowLightIdentification: {
      identified: boolean;
      option_picked: string;
    };
    greenLightIdentification: {
      identified: boolean;
      option_picked: string;
    };
    pedestrianCrosswalk: {
      identified: boolean;
      option_picked: string;
    };
    pedestrianSignals: {
      identified: boolean;
      option_picked: string;
    };
  };

  directional_concepts?: {
    indicatedCorrectTurnsToMake: {
      identified: boolean;
      option_picked: string;
    };
    landmarkIdentification: {
      identified: boolean;
      option_picked: string;
    };
    streetAddressIdentification: {
      identified: boolean;
      option_picked: string;
    };
    destinationIdentification: {
      identified: boolean;
      option_picked: string;
    };
    destinationAddressRecall: {
      identified: boolean;
      option_picked: string;
    };
  };

  treatment_plan_id?: string;
  treatmentFullPlan?: any; // Replace `any` with `TreatmentFullPlan` type if available

  visit_full_form_id?: string;
  visitFullForm?: any; // Replace `any` with `VisitFullForm` type if available

  status?: string;

  account_id?: string;

  registered_by?: string;
  user?: any; // Replace with `User` type if available

  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type SingleRespiteForm = {
  message: string;
  data: {
    id: string;
    session_highlights_id: string;
    self_management_id: string;
    communication_id: string;
    behavior_management_ids: string[];
    concern_and_challenges_id: string;
    domestic_skill_training_id: string;
    play_leisure_id: string;
    snack_meal_time_id: string;
    utilization_of_money_id: string;
    socialization_id: string;
    safety_and_survival_skills_id: string;
    personal_care_and_bladder_control_id: string;
    sensory_need_and_motor_development_id: string;
    personal_work_reading_id: string;
    transportation_type_and_objectives_id: string;
    visit_goal_ids: string[];
    status: string;
    account_id: string;
    treatment_plan_id: string | null;
    registered_by: string;
    date_of_visit: string; // ISO date format
    start_time: string; // ISO time format
    intake_full_id: string;
    end_time: string; // ISO time format
    created_at: string; // ISO date format
    updated_at: string; // ISO date format
    deleted_at: string | null;
    sessionHighlights: RespiteSessionHighlights;
    selfManagement: RespiteSelfManagement;
    communication: RespiteCommunication;
    concernAndChallenges: RespiteConcernAndChallenges;
    domesticSkillTraining: RespiteDomesticSkillTraining;
    playLeisure: RespitePlayLeisure;
    snackMealTime: RespiteSnackMealTime;
    utilizationOfMoney: RespiteUtilizationOfMoney;
    socialization: RespiteSocialization;
    safetyAndSurvivalSkills: RespiteSafetyAndSurvivalSkills;
    personalCareAndBladderControl: RespitePersonalCareAndBladderControl;
    sensoryNeedAndMotorDevelopment: RespiteSensoryNeedAndMotorDevelopment;
    personalWorkReading: RespitePersonalWorkReading;
    behaviorManagement: RespiteBehaviorManagement[];
    transportationTypeAndObjectives: RespiteTransportationType;
    visitGoals: RespiteGoals[];
  };
};

export type RespiteData = {
  id: string;
  session_highlights_id: string;
  self_management_id: string;
  communication_id: string;
  behavior_management_ids: string[];
  concern_and_challenges_id: string;
  domestic_skill_training_id: string;
  play_leisure_id: string;
  snack_meal_time_id: string;
  utilization_of_money_id: string;
  socialization_id: string;
  safety_and_survival_skills_id: string;
  personal_care_and_bladder_control_id: string;
  sensory_need_and_motor_development_id: string;
  personal_work_reading_id: string;
  visit_goal_ids: string[]; // Array of strings
  status: string;
  account_id: string;
  treatment_plan_id: string | null;
  registered_by: string;
  date_of_visit: string;
  start_time: string;
  intake_full_id: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  staff: Staff;
};

export type FullRespiteForm = {
  message: string;
  data: RespiteData[];
};
