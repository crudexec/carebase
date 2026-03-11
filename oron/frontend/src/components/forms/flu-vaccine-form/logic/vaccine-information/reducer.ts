import { ErrorState } from "@/types/GeneralTypes";

export type FluVaccineVaccineInformationType = {
  have_received_flu_vaccine: boolean;
  date_received_flu_vaccine: string;
  received_flu_vaccine_elsewhere: boolean;
  medical_contraindication_to_receiving_vaccine: boolean;
  personal_or_religious_beliefs_preventing_vaccination: boolean;
  allergic_to_vaccine_components: boolean;
  declined_flu_vaccine: boolean;
  concerns_about_vaccine_safety: boolean;
  other?: string | null;
  selectedOption?: "yes" | "no";
  selectedOther?: boolean;
};

// Define types
export type InitialStateType = {
  requestMethod: "POST" | "PATCH";
  isFormDisabled: boolean;
  error: ErrorState;
  formData: FluVaccineVaccineInformationType;
};

const enum REDUCER_ACTION_TYPE {
  SET_REQUEST_METHOD,
  SET_IS_FORM_DISABLED,
  SET_ERROR,
  SET_FORM_DATA,
  SET_VACCINATION_DATE,
  SET_SELECTED_OPTION,
  SET_SELECTED_OTHER,
  SET_OTHER,
}

export type ReducerAction = {
  type: REDUCER_ACTION_TYPE;
  payload?: {
    requestMethod?: "POST" | "PATCH";
    isFormDisabled?: boolean;
    error?: ErrorState;
    formData?: FluVaccineVaccineInformationType;
    vaccinationDate?: string;
    selectedOption?: "yes" | "no";
    selectedOther?: boolean;
    other?: string;
  };
};

// Define initial state
const initialState: InitialStateType = {
  requestMethod: "POST",
  isFormDisabled: false,
  error: {
    field: [],
    message: [],
  },
  formData: {
    have_received_flu_vaccine: false,
    date_received_flu_vaccine: "",
    received_flu_vaccine_elsewhere: false,
    medical_contraindication_to_receiving_vaccine: false,
    personal_or_religious_beliefs_preventing_vaccination: false,
    allergic_to_vaccine_components: false,
    declined_flu_vaccine: false,
    concerns_about_vaccine_safety: false,
    other: null,
    selectedOption: undefined,
    selectedOther: undefined,
  },
};

const reducer = (
  state: InitialStateType,
  action: ReducerAction
): InitialStateType => {
  switch (action.type) {
    case REDUCER_ACTION_TYPE.SET_REQUEST_METHOD:
      return {
        ...state,
        requestMethod: action.payload?.requestMethod as "POST" | "PATCH",
      };

    case REDUCER_ACTION_TYPE.SET_IS_FORM_DISABLED:
      return {
        ...state,
        isFormDisabled: action.payload?.isFormDisabled ?? state.isFormDisabled,
      };

    case REDUCER_ACTION_TYPE.SET_ERROR:
      return {
        ...state,
        error: action.payload?.error ?? state.error,
      };

    case REDUCER_ACTION_TYPE.SET_FORM_DATA:
      return {
        ...state,
        formData: action.payload?.formData as FluVaccineVaccineInformationType,
      };

    case REDUCER_ACTION_TYPE.SET_VACCINATION_DATE:
      return {
        ...state,
        formData: {
          ...state.formData,
          date_received_flu_vaccine: action.payload?.vaccinationDate as string,
        },
      };

    case REDUCER_ACTION_TYPE.SET_SELECTED_OPTION:
      return {
        ...state,
        formData: {
          ...state.formData,
          selectedOption: action.payload?.selectedOption,
        },
      };

    case REDUCER_ACTION_TYPE.SET_SELECTED_OTHER:
      return {
        ...state,
        formData: {
          ...state.formData,
          selectedOther: action.payload?.selectedOther,
        },
      };

    case REDUCER_ACTION_TYPE.SET_OTHER:
      return {
        ...state,
        formData: {
          ...state.formData,
          other: action.payload?.other as string,
        },
      };

    default:
      return state;
  }
};

export { initialState, REDUCER_ACTION_TYPE, reducer };
