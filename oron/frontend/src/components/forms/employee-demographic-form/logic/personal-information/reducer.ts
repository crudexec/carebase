// Import types and utilities
import { ErrorState } from "@/types/GeneralTypes";
import { EmployeeDemographicPersonalInformationFormData as EmployeeDemographicPersonalInformationType } from "@/utils/schemas";

// Define types
export type InitialStateType = {
  requestMethod: "POST" | "PATCH";
  isFormDisabled: boolean;
  error: ErrorState;
  formData: EmployeeDemographicPersonalInformationType;
};

const enum REDUCER_ACTION_TYPE {
  SET_REQUEST_METHOD,
  SET_IS_FORM_DISABLED,
  SET_ERROR,
  SET_FORM_DATA,
  SET_DATE_OF_BIRTH,
  SET_SOCIAL_SECURITY_NUMBER,
}

export type ReducerAction = {
  type: REDUCER_ACTION_TYPE;
  payload?: {
    requestMethod?: "POST" | "PATCH";
    isFormDisabled?: boolean;
    error?: ErrorState;
    formData?: EmployeeDemographicPersonalInformationType;
    dateOfBirth?: string;
    socialSecurityNumber?: string;
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
    lastName: "",
    firstName: "",
    socialSecurityNumber: "",
    dateOfBirth: "",
    cellPhoneNumber: "",
    homePhoneNumber: "",
    address: "",
    cityOrTown: "",
    state: "",
    zipCode: "",
    race: "",
    gender: "",
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
        formData: action.payload
          ?.formData as EmployeeDemographicPersonalInformationType,
      };

    case REDUCER_ACTION_TYPE.SET_DATE_OF_BIRTH:
      return {
        ...state,
        formData: {
          ...state.formData,
          dateOfBirth: action.payload?.dateOfBirth as string,
        },
      };

    case REDUCER_ACTION_TYPE.SET_SOCIAL_SECURITY_NUMBER:
      return {
        ...state,
        formData: {
          ...state.formData,
          socialSecurityNumber: action.payload?.socialSecurityNumber as string,
        },
      };

    default:
      return state;
  }
};

export { initialState, REDUCER_ACTION_TYPE, reducer };
