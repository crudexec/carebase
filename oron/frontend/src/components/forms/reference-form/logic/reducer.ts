// Import types and utilities
import { ErrorState } from "@/types/GeneralTypes";
import { ReferenceFormData } from "@/utils/schemas";

// Define types
export type InitialStateType = {
  requestMethod: "POST" | "PATCH";
  isFormDisabled: boolean;
  error: ErrorState;
  formData: ReferenceFormData;
};

const enum REDUCER_ACTION_TYPE {
  SET_REQUEST_METHOD,
  SET_IS_FORM_DISABLED,
  SET_ERROR,
  SET_FORM_DATA,
  SET_FORM_DATA_FIELD,
}

export type ReducerAction = {
  type: REDUCER_ACTION_TYPE;
  payload?: {
    requestMethod?: "POST" | "PATCH";
    isFormDisabled?: boolean;
    error?: ErrorState;
    formData?: ReferenceFormData;
    key?: string;
    value?: string;
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
    referrer_one_firstname: "",
    referrer_one_lastname: "",
    referrer_one_email: "",
    referrer_one_phone: "",
    referrer_two_firstname: "",
    referrer_two_lastname: "",
    referrer_two_email: "",
    referrer_two_phone: "",
    referrer_three_firstname: "",
    referrer_three_lastname: "",
    referrer_three_email: "",
    referrer_three_phone: "",
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
        formData: action.payload?.formData as ReferenceFormData,
      };

    case REDUCER_ACTION_TYPE.SET_FORM_DATA_FIELD:
      if (typeof action.payload?.key === "string") {
        return {
          ...state,
          formData: {
            ...state.formData,
            [action.payload.key]: action.payload.value,
          },
        };
      }
      return state;
    default:
      return state;
  }
};

export { initialState, REDUCER_ACTION_TYPE, reducer };
