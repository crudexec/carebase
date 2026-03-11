import { ErrorState } from "@/types/GeneralTypes";
import { BiodataFormData as BiodataType } from "@/utils/schemas";

// Define types
export type InitialStateType = {
  requestMethod: "POST" | "PATCH";
  socialSecurityNumber: string;
  isFormDisabled: boolean;
  error: ErrorState;
  formData: BiodataType;
  filled_pdf_json_data: string;
};

const enum REDUCER_ACTION_TYPE {
  SET_REQUEST_METHOD,
  SET_SOCIAL_SECURITY_NUMBER,
  SET_IS_FORM_DISABLED,
  SET_ERROR,
  SET_FORM_DATA,
  SET_PHONE_NUMBER,
  SET_PDF_INPUTS,
}

export type ReducerAction = {
  type: REDUCER_ACTION_TYPE;
  payload?: {
    requestMethod?: "POST" | "PATCH";
    socialSecurityNumber?: string;
    isFormDisabled?: boolean;
    error?: ErrorState;
    formData?: BiodataType;
    phoneNumber?: string;
    filled_pdf_json_data?: string;
  };
};

// Define initial state
const initialState: InitialStateType = {
  requestMethod: "POST",
  socialSecurityNumber: "",
  isFormDisabled: false,
  error: {
    field: [],
    message: [],
  },
  filled_pdf_json_data: "",
  formData: {
    lastName: "",
    firstName: "",
    email: "",
    phoneNumber: "",
    address: "",
    cityOrTown: "",
    state: "",
    zipCode: "",
    socialSecurityNumber: "",
    middleName: undefined,
    otherLastName: undefined,
    apartmentNumber: undefined,
  },
};

// Define reducer function
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

    case REDUCER_ACTION_TYPE.SET_SOCIAL_SECURITY_NUMBER:
      return {
        ...state,
        socialSecurityNumber:
          action.payload?.socialSecurityNumber ?? state.socialSecurityNumber,
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
        formData: action.payload?.formData as BiodataType,
      };

    case REDUCER_ACTION_TYPE.SET_PHONE_NUMBER:
      return {
        ...state,
        formData: {
          ...state.formData,
          phoneNumber:
            action.payload?.phoneNumber ?? state.formData.phoneNumber,
        },
      };

    case REDUCER_ACTION_TYPE.SET_PDF_INPUTS:
      return {
        ...state,
        filled_pdf_json_data: action.payload?.filled_pdf_json_data as string,
      };

    default:
      return state;
  }
};

export { initialState, REDUCER_ACTION_TYPE, reducer };
