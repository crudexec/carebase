import { ErrorState } from "@/types/GeneralTypes";

export type HepatitisAttestationType = {
  had_hepatitis_b_vaccine_series_of_three: boolean;
  arranged_for_hepatitis_b_vaccine_series_of_three: boolean;
  declined_hepatitis_b_vaccine_series_of_three: boolean;
};

// Define types
export type InitialStateType = {
  requestMethod: "POST" | "PATCH";
  isFormDisabled: boolean;
  error: ErrorState;
  formData: HepatitisAttestationType;
};

const enum REDUCER_ACTION_TYPE {
  SET_REQUEST_METHOD,
  SET_IS_FORM_DISABLED,
  SET_ERROR,
  SET_FORM_DATA,
}

export type ReducerAction = {
  type: REDUCER_ACTION_TYPE;
  payload?: {
    requestMethod?: "POST" | "PATCH";
    isFormDisabled?: boolean;
    error?: ErrorState;
    formData?: HepatitisAttestationType;
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
    had_hepatitis_b_vaccine_series_of_three: false,
    arranged_for_hepatitis_b_vaccine_series_of_three: false,
    declined_hepatitis_b_vaccine_series_of_three: false,
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
        formData: action.payload?.formData as HepatitisAttestationType,
      };

    default:
      return state;
  }
};

export { initialState, REDUCER_ACTION_TYPE, reducer };
