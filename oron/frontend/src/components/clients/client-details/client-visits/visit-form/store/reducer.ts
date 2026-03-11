import { ErrorState } from "@/types/GeneralTypes";
import { StepThreeTableType } from "../view/step-three/Columns";
import { convertGoals } from "@/utils/helpers";
import { FullIntakeType, IntakeType } from "@/types/IntakeForm";

export type FormMethod = "POST" | "PATCH";
export type BEHAVIOUR_MANAGEMENT = {
  behavior_type: string;
  behavior_description: string;
  what_time_did_behavior_occur: string;
  antecedent: string;
  consequence: string;
  setting: string;
  how_many_times_did_behavior_occur: string;
  for_how_long_did_behavior_occur: string;
  severity: string;
  other_crisis_intervention: string;
  other_specific_description?: string;
  id?: string;
};

export type STEP_ONE_FORM = {
  id?: string;
  participant_last_name: string;
  participant_first_name: string;
  participant_age: string;
  participant_gender: string;
  date_of_session?: null | Date;
  location: string;
  level_of_compliance: string;
  injury_to_self: string;
  aggression_to_others: string;
  client_hospitalized_in_care_today: string | boolean | null;
  session_highlight_id: string;
  client_placed_themselves_in_harm_by_leaving_my_care?: string | boolean | null;
  was_there_any_concerns_or_challenges?: string | "yes" | "no" | boolean | null;
  supervisor_to_contact_during_session?: string | boolean | null;
  self_management_response: SELF_MANAGEMENT;
  behaviour_management: BEHAVIOUR_MANAGEMENT[];
  communication: COMMUNICATION;
  describe_circumstances_involved?: string | undefined;
  concern_and_challenges_id: string;
  self_management_id?: string;
  communication_id?: string;
};
export type SESSION_HIGHLIGHT_FORM = Pick<
  STEP_ONE_FORM,
  | "location"
  | "level_of_compliance"
  | "injury_to_self"
  | "client_hospitalized_in_care_today"
  | "client_placed_themselves_in_harm_by_leaving_my_care"
> & {
  id?: string;
};

export type CONCERN_AND_CHALLENGES = Pick<
  STEP_ONE_FORM,
  | "was_there_any_concerns_or_challenges"
  | "describe_circumstances_involved"
  | "supervisor_to_contact_during_session"
> & {
  id?: string;
};

export type SELF_MANAGEMENT = {
  id?: string;
  responses: Record<string, boolean>;
  other: string;
};

export type COMMUNICATION = {
  id?: string;
  responses: Record<string, boolean>;
  other: string;
};
export type CHECKBOXES = {
  id?: string;
  responses: Record<string, boolean>;
  other: string;
};

export type DOMESTIC_TRAINING = {
  id?: string;
  responses: Record<string, boolean>;
  other: string;
  specify_other?: string | null | undefined;
};

export type PLAY_LEISURE_FORM = DOMESTIC_TRAINING;

export type PERSONAL_WORK_FORM = {
  id?: string;
  assisted: DOMESTIC_TRAINING;
  i_read_a_book_to_client: boolean;
};

export type PERSONAL_CARE = {
  id?: string;
  client_name_used_bathroom_without_assistance: boolean;
  bathroom: CHECKBOXES;
  personal: CHECKBOXES;
};

export type SENSORY_NEEDS = {
  id?: string;
  development: CHECKBOXES;
  devSkill: CHECKBOXES;
};

export type SOCIALIZATION = {
  id?: string;
  setting: CHECKBOXES;
  recreation: CHECKBOXES;
  community_integration: CHECKBOXES;
};
export type SAFETY = CHECKBOXES;

export type UTILIZATION = CHECKBOXES;

export type MEAL_TIME_FORM = {
  id?: string;
  ate_all_meal_or_snack?: boolean;
  ate_some_meal_or_snack?: boolean;
  refused_all_meal_or_snack?: boolean;
  drank_a_lot_of_water?: boolean;
  drank_some_water?: boolean;
  refused_all_water?: boolean;
  drank_a_lot_of_juice?: boolean;
  drank_some_juice?: boolean;
  refused_all_juice?: boolean;
  specify_what_snack_or_meal_provided?: string;
  prepared_snack_or_meal?: boolean;
  served_snack_or_meal?: boolean;
  assisted_with_feeding?: boolean;
  clean_up_after_snack_or_meal?: boolean;
  other?: boolean;
  specify_other?: string;
  client_helped_to_clean_up_and_put_away_dishes?: boolean;
};

export type STEP_TWO_FORM = {
  // [x: string]: SetStateAction<boolean>;
  mealTime: MEAL_TIME_FORM;
  domestic: DOMESTIC_TRAINING;
  play: PLAY_LEISURE_FORM;
  personalWork: PERSONAL_WORK_FORM;
  personalCare: PERSONAL_CARE;
  sensoryNeed: SENSORY_NEEDS;
  safty: SAFETY;
  socialization: SOCIALIZATION;
  utilization: any;
};
export type ThirdFormData = {
  activityLocation: string;
  circumstanceLeadingToActivity: string;
  clientResponse: string;
  consequentlyClient: string;
  totalTime: string;
  clientReward: string;
  additionalComment?: string;

  tableData: StepThreeTableType[];

  goal_area: string;
  target_skill: string;
  short_term_objective: string;
  objective_term_steps: {
    task_analysis: string;
    baseline: string;
  }[];
  goal_status: string;
  goal_setting: string;
  number_of_trials: number;
  goal_frequency: string;
  current_skill_level: string;
  target_performance_level: string;
  goal_background: string;
  goal_statement: string;
  implementation_procedure: string;
  treatment_plan_id: string | null;
  intake_full_id: string;
};
export type STEP_THREE_FORM = ThirdFormData[];

export type FormSectionMethod = {
  basicInformationMethod: FormMethod;
  sessionHighlightMethod: FormMethod;
  concernsAndChallengesMethod: FormMethod;
  selfManagementMethod: FormMethod;
  behaviourManagementMethod: FormMethod;
  communicationMethod: FormMethod;
  snackMealMethod: FormMethod;
  domesticSkillTrainingMethod: FormMethod;
  playMethod: FormMethod;
  personalWorkMethod: FormMethod;
  personalCareMethod: FormMethod;
  sensoryNeedsMethod: FormMethod;
  socializationMethod: FormMethod;
  safetySkillsMethod: FormMethod;
  utilzationMethod: FormMethod;
  goalMethod: FormMethod;
};

export type InitialStateType = {
  formMethod: FormSectionMethod;
  formFetched: "loaded" | "unloaded" | "loaded_no_res";
  isLoading: boolean;
  isFormDisabled: boolean;
  error: ErrorState;
  step_one_form: STEP_ONE_FORM;
  step_two_form: STEP_TWO_FORM;
  step_three_form: STEP_THREE_FORM;
  user: IntakeType | null;
};

export const INITIAL_TABLE_DATA: StepThreeTableType[] = [
  {
    id: "1",
    taskAnalysis: "Model prompts independently on a bi-monthly basis",
    response: [
      { label: "No", value: "No" },
      { label: "Yes", value: "Yes" },
    ],
    promptUsed: [
      { label: "No", value: "No" },
      { label: "Yes", value: "Yes" },
    ],
    opportunities: [
      { label: "No", value: "No" },
      { label: "Yes", value: "Yes" },
    ],
    success: [
      { label: "No", value: "No" },
      { label: "Yes", value: "Yes" },
    ],
  },
];
export const initialBehaviourManagement = {
  id: "",
  antecedent: "",
  behavior_description: "",
  behavior_type: "",
  consequence: "",
  for_how_long_did_behavior_occur: "",
  how_many_times_did_behavior_occur: "",
  other_crisis_intervention: "",
  setting: "",
  severity: "",
  other_specific_description: "",
  what_time_did_behavior_occur: "",
};
export const initialStepOneForm = {
  id: "",
  participant_last_name: "",
  participant_first_name: "",
  participant_age: "",
  participant_gender: "",
  date_of_session: null,
  location: "",
  level_of_compliance: "",
  injury_to_self: "",
  aggression_to_others: "",
  client_hospitalized_in_care_today: "",
  client_placed_themselves_in_harm_by_leaving_my_care: "",
  was_there_any_concerns_or_challenges: "",
  supervisor_to_contact_during_session: "",
  self_management_response: {
    responses: {},
    other: "",
  },
  session_highlight_id: "",
  behaviour_management: [],
  communication: {
    responses: {},
    other: "",
  },
  describe_circumstances_involved: "",
  concern_and_challenges_id: "",
  self_management_id: "",
  communication_id: "",
};

export const initialStepTwoForm: STEP_TWO_FORM = {
  mealTime: {
    id: "",
    ate_all_meal_or_snack: false,
    ate_some_meal_or_snack: false,
    refused_all_meal_or_snack: false,
    drank_a_lot_of_water: false,
    drank_some_water: false,
    refused_all_water: false,
    drank_a_lot_of_juice: false,
    drank_some_juice: false,
    refused_all_juice: false,
    specify_what_snack_or_meal_provided: "",
    prepared_snack_or_meal: false,
    served_snack_or_meal: false,
    assisted_with_feeding: false,
    clean_up_after_snack_or_meal: false,
    other: false,
    specify_other: "",
    client_helped_to_clean_up_and_put_away_dishes: false,
  },
  domestic: {
    id: "",
    responses: {},
    other: "",
  },
  play: {
    id: "",
    responses: {},
    other: "",
  },
  personalWork: {
    assisted: {
      id: "",
      responses: {},
      other: "",
    },
    i_read_a_book_to_client: false,
  },
  personalCare: {
    client_name_used_bathroom_without_assistance: false,
    bathroom: {
      responses: {},
      other: "",
    },
    personal: {
      responses: {},
      other: "",
    },
  },
  sensoryNeed: {
    development: {
      responses: {},
      other: "",
    },
    devSkill: {
      responses: {},
      other: "",
    },
  },
  safty: {
    responses: {},
    other: "",
  },
  socialization: {
    setting: {
      responses: {},
      other: "",
    },
    recreation: {
      responses: {},
      other: "",
    },
    community_integration: {
      responses: {},
      other: "",
    },
  },
  utilization: {
    responses: {},
    other: "",
  },
};

export const initialStepThreeForm: STEP_THREE_FORM = [
  {
    activityLocation: "",
    circumstanceLeadingToActivity: "",
    clientResponse: "",
    consequentlyClient: "",
    totalTime: "",
    clientReward: "",
    additionalComment: "",
    tableData: INITIAL_TABLE_DATA,
    goal_area: "",
    target_skill: "",
    short_term_objective: "",
    objective_term_steps: [],
    goal_status: "",
    goal_setting: "",
    number_of_trials: 0,
    goal_frequency: "",
    current_skill_level: "",
    target_performance_level: "",
    goal_background: "",
    goal_statement: "",
    implementation_procedure: "",
    treatment_plan_id: null,
    intake_full_id: "",
  },
];
const initialState: InitialStateType = {
  formFetched: "unloaded",
  isLoading: false,
  formMethod: {
    basicInformationMethod: "POST",
    sessionHighlightMethod: "POST",
    behaviourManagementMethod: "POST",
    communicationMethod: "POST",
    concernsAndChallengesMethod: "POST",
    domesticSkillTrainingMethod: "POST",
    goalMethod: "POST",
    personalCareMethod: "POST",
    personalWorkMethod: "POST",
    playMethod: "POST",
    safetySkillsMethod: "POST",
    selfManagementMethod: "POST",
    sensoryNeedsMethod: "POST",
    snackMealMethod: "POST",
    socializationMethod: "POST",
    utilzationMethod: "POST",
  },
  isFormDisabled: false,
  error: {
    field: [],
    message: [],
  },
  step_one_form: initialStepOneForm,
  step_two_form: initialStepTwoForm,
  step_three_form: initialStepThreeForm,
  user: null,
};

const enum REDUCER_ACTION_TYPE {
  SET_REQUEST_METHOD,
  SET_IS_FORM_DISABLED,
  SET_ERROR,
  UPDATE_STEP_ONE_FORM,
  UPDATE_STEP_TWO_FORM,
  UPDATE_STEP_THREE_FORM,
  SET_STEP_ONE_FORM,
  SET_STEP_TWO_FORM,
  SET_STEP_THREE_FORM,
  ADD_STEP_ONE_FIELD,
  ADD_STEP_TWO_FIELD,
  ADD_STEP_THREE_FIELD,
  DELETE_STEP_ONE_FIELD,
  DELETE_STEP_TWO_FIELD,
  DELETE_STEP_THREE_FIELD,
  RETRIEVE_STEP_ONE_DATA,
  RETRIEVE_STEP_TWO_DATA,
  RETRIEVE_STEP_THREE_DATA,
  ADD_BEHAVIOUR_MANAGEMENT,
  UPDATE_BEHAVIOUR_MANAGEMENT_FIELD,
  UPDATE_STEP_THREE_TABLE,
  RETRIEVE_GOAL_DATA,
  SET_FORM_LOADED,
  SET_LOADING,
  DELETE_FIELD,
  SET_USER,
}

export type ReducerAction = {
  type: REDUCER_ACTION_TYPE;

  payload?: {
    formSectionMethod?: keyof FormSectionMethod;
    method?: FormMethod;
    isFormDisabled?: boolean;
    field?: string;
    index?: number;
    behaviourField?: keyof BEHAVIOUR_MANAGEMENT;
    value?: string;
    error?: ErrorState;
    stepThreeField?: keyof STEP_THREE_FORM;
    tableData?: StepThreeTableType[];
    sessionHighlights?: SESSION_HIGHLIGHT_FORM;
    concernAndChallenges?: CONCERN_AND_CHALLENGES;
    selfManagement?: SELF_MANAGEMENT;
    behaviorManagement?: BEHAVIOUR_MANAGEMENT;
    defBehaviorManagement?: BEHAVIOUR_MANAGEMENT[];
    communication?: COMMUNICATION;
    form_one_id?: string;
    domesticSkillTraining?: DOMESTIC_TRAINING;
    playLeisure?: PLAY_LEISURE_FORM;
    personalCareAndBladderControl?: PERSONAL_CARE;
    personalWorkReading?: PERSONAL_WORK_FORM;
    sensoryNeedAndMotorDevelopment?: SENSORY_NEEDS;
    socialization?: SOCIALIZATION;
    safetyAndSurvivalSkills?: SAFETY;
    utilizationOfMoney?: UTILIZATION;
    snackMealTime?: MEAL_TIME_FORM;
    RetrieveGoalData?: STEP_THREE_FORM;
    loadingState?: boolean;
    loaded?: "unloaded" | "loaded";
    user?: IntakeType;
  };
};
const reducer = (
  state: InitialStateType,
  action: ReducerAction
): InitialStateType => {
  switch (action.type) {
    case REDUCER_ACTION_TYPE.SET_USER: {
      if (action.payload?.user) {
        return {
          ...state,
          user: action.payload.user,
        };
      }
      return state;
    }

    case REDUCER_ACTION_TYPE.SET_REQUEST_METHOD:
      if (action.payload?.formSectionMethod) {
        return {
          ...state,
          [action.payload.formSectionMethod]: action.payload.method,
        };
      }
      return state;

    case REDUCER_ACTION_TYPE.ADD_BEHAVIOUR_MANAGEMENT:
      return {
        ...state,
        step_one_form: {
          ...state.step_one_form,
          behaviour_management: [
            ...state.step_one_form.behaviour_management,
            initialBehaviourManagement,
          ],
        },
      };

    case REDUCER_ACTION_TYPE.SET_IS_FORM_DISABLED:
      if (action.payload?.isFormDisabled) {
        return {
          ...state,
          isFormDisabled: action.payload.isFormDisabled,
        };
      }
      return state;

    case REDUCER_ACTION_TYPE.SET_ERROR:
      return {
        ...state,
        error: action.payload?.error ?? state.error,
      };

    case REDUCER_ACTION_TYPE.UPDATE_STEP_ONE_FORM:
      if (action.payload?.field && action.payload.value) {
        return {
          ...state,
          step_one_form: {
            ...state.step_one_form,
            [action.payload.field]: action.payload.value,
          },
        };
      }
      return state;

    case REDUCER_ACTION_TYPE.UPDATE_STEP_TWO_FORM:
      if (action.payload?.field) {
        return {
          ...state,
          step_two_form: {
            ...state.step_two_form,
            [action.payload.field]: action.payload.value,
          },
        };
      }
      return state;

    case REDUCER_ACTION_TYPE.UPDATE_BEHAVIOUR_MANAGEMENT_FIELD:
      if (
        action.payload?.index !== undefined &&
        action.payload.behaviourField &&
        action.payload.value !== undefined
      ) {
        const updatedBehaviourManagement = [
          ...state.step_one_form.behaviour_management,
        ];
        updatedBehaviourManagement[action.payload.index] = {
          ...updatedBehaviourManagement[action.payload.index],
          [action.payload.behaviourField]: action.payload.value,
        };
        return {
          ...state,
          step_one_form: {
            ...state.step_one_form,
            behaviour_management: updatedBehaviourManagement,
          },
        };
      }
      return state;

    case REDUCER_ACTION_TYPE.UPDATE_STEP_THREE_FORM:
      if (
        action.payload &&
        action.payload?.field &&
        typeof action.payload.field === "string" &&
        action.payload.value !== undefined
      ) {
        const updated = state.step_three_form.map((item, i) => {
          if (i === action.payload?.index) {
            return {
              ...item,
              [action.payload.field as string]: action.payload.value,
            };
          }
          return item;
        });
        return {
          ...state,
          step_three_form: updated,
        };
      }
      return state;

    case REDUCER_ACTION_TYPE.RETRIEVE_STEP_ONE_DATA:
      let updatedState = { ...state };

      if (action.payload?.sessionHighlights) {
        updatedState = {
          ...updatedState,
          formMethod: {
            ...updatedState.formMethod,
            sessionHighlightMethod: "PATCH",
          },
          step_one_form: {
            ...updatedState.step_one_form,
            ...action.payload.sessionHighlights,
            ...(action.payload.sessionHighlights &&
              action.payload.sessionHighlights?.id &&
              action.payload.sessionHighlights.id !== "" && {
                session_highlight_id: action.payload.sessionHighlights
                  ?.id as any,
              }),
          },
        };
      }

      if (action.payload?.concernAndChallenges) {
        updatedState = {
          ...updatedState,
          formMethod: {
            ...updatedState.formMethod,
            concernsAndChallengesMethod: "PATCH",
          },
          step_one_form: {
            ...updatedState.step_one_form,
            ...action.payload.concernAndChallenges,
            ...(action.payload.concernAndChallenges &&
              action.payload.concernAndChallenges?.id &&
              action.payload.concernAndChallenges.id !== "" && {
                concern_and_challenges_id: action.payload.concernAndChallenges
                  ?.id as any,
              }),
          },
        };
      }

      if (action.payload?.selfManagement) {
        updatedState = {
          ...updatedState,
          formMethod: {
            ...updatedState.formMethod,
            selfManagementMethod: "PATCH",
          },
          step_one_form: {
            ...updatedState.step_one_form,
            self_management_response: action.payload.selfManagement,
            ...(action.payload.selfManagement &&
              action.payload.selfManagement?.id &&
              action.payload.selfManagement.id !== "" && {
                self_management_id: action.payload.selfManagement?.id as any,
              }),
          },
        };
      }

      if (
        action.payload?.defBehaviorManagement &&
        action.payload.defBehaviorManagement.length > 0
      ) {
        updatedState = {
          ...updatedState,
          formMethod: {
            ...updatedState.formMethod,
            behaviourManagementMethod: "PATCH",
          },
          step_one_form: {
            ...updatedState.step_one_form,
            behaviour_management: action.payload.defBehaviorManagement,
          },
        };
      }

      if (action.payload?.communication) {
        updatedState = {
          ...updatedState,
          formMethod: {
            ...updatedState.formMethod,
            communicationMethod: "PATCH",
          },
          step_one_form: {
            ...updatedState.step_one_form,
            communication: action.payload.communication,

            ...(action.payload.communication &&
              action.payload.communication?.id &&
              action.payload.communication.id !== "" && {
                communication_id: action.payload.communication?.id as any,
              }),
          },
        };
      }
      if (action.payload?.form_one_id) {
        updatedState = {
          ...updatedState,
          step_one_form: {
            ...updatedState.step_one_form,
            id: action.payload.form_one_id,
          },
        };
      }
      if (action.payload?.snackMealTime) {
        updatedState = {
          ...updatedState,
          formMethod: {
            ...updatedState.formMethod,
            snackMealMethod: "PATCH",
          },
          step_two_form: {
            ...updatedState.step_two_form,
            mealTime: {
              ...action.payload.snackMealTime,

              ...(action.payload.snackMealTime &&
              action.payload.snackMealTime?.id &&
              action.payload.snackMealTime.id !== null &&
              action.payload.snackMealTime.id !== ""
                ? {
                    id: action.payload.snackMealTime?.id as any,
                  }
                : {
                    id: state.step_two_form.mealTime.id,
                  }),
            },
          },
        };
      }

      if (action.payload?.domesticSkillTraining) {
        updatedState = {
          ...updatedState,
          formMethod: {
            ...updatedState.formMethod,
            domesticSkillTrainingMethod: "PATCH",
          },
          step_two_form: {
            ...updatedState.step_two_form,
            domestic: {
              ...action.payload.domesticSkillTraining,

              ...(action.payload.domesticSkillTraining &&
              action.payload.domesticSkillTraining?.id &&
              action.payload.domesticSkillTraining.id !== null &&
              action.payload.domesticSkillTraining.id !== ""
                ? {
                    id: action.payload.domesticSkillTraining?.id as any,
                  }
                : {
                    id: state.step_two_form.domestic.id,
                  }),
            },
          },
        };
      }

      if (action.payload?.playLeisure) {
        updatedState = {
          ...updatedState,
          formMethod: {
            ...updatedState.formMethod,
            playMethod: "PATCH",
          },
          step_two_form: {
            ...updatedState.step_two_form,
            play: {
              ...action.payload.playLeisure,
              ...(action.payload.playLeisure &&
              action.payload.playLeisure?.id &&
              action.payload.playLeisure.id !== null &&
              action.payload.playLeisure.id !== ""
                ? {
                    id: action.payload.playLeisure?.id as any,
                  }
                : {
                    id: state.step_two_form.play.id,
                  }),
            },
          },
        };
      }

      if (action.payload?.personalWorkReading) {
        updatedState = {
          ...updatedState,
          formMethod: {
            ...updatedState.formMethod,
            personalWorkMethod: "PATCH",
          },
          step_two_form: {
            ...updatedState.step_two_form,
            personalWork: {
              ...action.payload.personalWorkReading,

              ...(action.payload.personalWorkReading &&
              action.payload.personalWorkReading?.id &&
              action.payload.personalWorkReading.id !== null &&
              action.payload.personalWorkReading.id !== ""
                ? {
                    id: action.payload.personalWorkReading?.id as any,
                  }
                : {
                    id: state.step_two_form.personalWork.id,
                  }),
            },
          },
        };
      }

      if (action.payload?.personalCareAndBladderControl) {
        updatedState = {
          ...updatedState,
          formMethod: {
            ...updatedState.formMethod,
            personalCareMethod: "PATCH",
          },
          step_two_form: {
            ...updatedState.step_two_form,
            personalCare: {
              ...action.payload.personalCareAndBladderControl,

              ...(action.payload.personalCareAndBladderControl &&
              action.payload.personalCareAndBladderControl?.id &&
              action.payload.personalCareAndBladderControl.id !== null &&
              action.payload.personalCareAndBladderControl.id !== ""
                ? {
                    id: action.payload.personalCareAndBladderControl?.id as any,
                  }
                : {
                    id: state.step_two_form.personalCare.id,
                  }),
            },
          },
        };
      }

      if (action.payload?.sensoryNeedAndMotorDevelopment) {
        updatedState = {
          ...updatedState,
          formMethod: {
            ...updatedState.formMethod,
            sensoryNeedsMethod: "PATCH",
          },
          step_two_form: {
            ...updatedState.step_two_form,
            sensoryNeed: {
              ...action.payload.sensoryNeedAndMotorDevelopment,

              ...(action.payload.sensoryNeedAndMotorDevelopment &&
              action.payload.sensoryNeedAndMotorDevelopment?.id &&
              action.payload.sensoryNeedAndMotorDevelopment.id !== null &&
              action.payload.sensoryNeedAndMotorDevelopment.id !== ""
                ? {
                    id: action.payload.sensoryNeedAndMotorDevelopment
                      ?.id as any,
                  }
                : {
                    id: state.step_two_form.sensoryNeed.id,
                  }),
            },
          },
        };
      }

      if (action.payload?.socialization) {
        updatedState = {
          ...updatedState,
          formMethod: {
            ...updatedState.formMethod,
            socializationMethod: "PATCH",
          },
          step_two_form: {
            ...updatedState.step_two_form,
            socialization: {
              ...action.payload.socialization,

              ...(action.payload.socialization &&
              action.payload.socialization?.id &&
              action.payload.socialization.id !== null &&
              action.payload.socialization.id !== ""
                ? {
                    id: action.payload.socialization?.id as any,
                  }
                : {
                    id: state.step_two_form.socialization.id,
                  }),
            },
          },
        };
      }

      if (action.payload?.safetyAndSurvivalSkills) {
        updatedState = {
          ...updatedState,
          formMethod: {
            ...updatedState.formMethod,
            safetySkillsMethod: "PATCH",
          },
          step_two_form: {
            ...updatedState.step_two_form,
            safty: {
              ...action.payload.safetyAndSurvivalSkills,

              ...(action.payload.safetyAndSurvivalSkills &&
              action.payload.safetyAndSurvivalSkills?.id &&
              action.payload.safetyAndSurvivalSkills.id !== null &&
              action.payload.safetyAndSurvivalSkills.id !== ""
                ? {
                    id: action.payload.safetyAndSurvivalSkills?.id as any,
                  }
                : {
                    id: state.step_two_form.safty.id,
                  }),
            },
          },
        };
      }

      if (action.payload?.utilizationOfMoney) {
        updatedState = {
          ...updatedState,
          formMethod: {
            ...updatedState.formMethod,
            utilzationMethod: "PATCH",
          },
          step_two_form: {
            ...updatedState.step_two_form,
            utilization: {
              ...action.payload.utilizationOfMoney,
              ...(action.payload.utilizationOfMoney &&
              action.payload.utilizationOfMoney?.id &&
              action.payload.utilizationOfMoney.id !== null &&
              action.payload.utilizationOfMoney.id !== ""
                ? {
                    id: action.payload.utilizationOfMoney?.id as any,
                  }
                : {
                    id: state.step_two_form.utilization.id,
                  }),
            },
          },
        };
      }

      if (action.payload?.RetrieveGoalData) {
        if (action.payload.RetrieveGoalData.length > 0) {
          const convertedData = convertGoals(action.payload.RetrieveGoalData);

          updatedState = {
            ...updatedState,

            formFetched: "loaded",
            formMethod: {
              ...updatedState.formMethod,
              goalMethod: "PATCH",
            },
            step_three_form: convertedData,
          };
        } else {
          updatedState = {
            ...updatedState,
            formFetched: "loaded_no_res",
          };
        }
      }
      return updatedState;
    case REDUCER_ACTION_TYPE.UPDATE_STEP_THREE_TABLE:
      if (
        action.payload &&
        typeof action.payload.index === "number" &&
        Array.isArray(action.payload.tableData)
      ) {
        const updated = state.step_three_form.map((item, i) => {
          if (i === action.payload?.index) {
            return {
              ...item,
              tableData: action.payload.tableData,
            };
          }
          return item;
        });
        return {
          ...state,
          step_three_form: updated as STEP_THREE_FORM,
        };
      }
      return state;

    case REDUCER_ACTION_TYPE.RETRIEVE_GOAL_DATA:
      if (action.payload?.RetrieveGoalData) {
        return {
          ...state,
          step_three_form: action.payload.RetrieveGoalData,
        };
      }
      return state;

    case REDUCER_ACTION_TYPE.SET_LOADING:
      if (action.payload?.loadingState)
        return { ...state, isLoading: action.payload?.loadingState };

    case REDUCER_ACTION_TYPE.SET_FORM_LOADED:
      if (action.payload?.loaded) {
        return { ...state, formFetched: action.payload?.loaded };
      }

    case REDUCER_ACTION_TYPE.DELETE_FIELD:
      if (typeof action.payload?.index === "number") {
        const updatedFormData = state.step_one_form.behaviour_management.filter(
          (_, idx) => idx !== action.payload?.index
        );
        return {
          ...state,
          step_one_form: {
            ...state.step_one_form,
            behaviour_management: updatedFormData,
          },
        };
      }
      return state;
    default:
      return state;
  }
};

export { initialState, reducer, REDUCER_ACTION_TYPE };
