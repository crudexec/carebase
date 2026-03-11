import { ErrorState } from "@/types/GeneralTypes";
import { formatDateToUTCString } from "@/utils/date-utils";
import { PneumococcalVaccinationEmployeeInformationFormData as PneumococcalVaccinationEmployeeInformationType } from "@/utils/schemas";

// Define types
export type InitialStateType = {
  requestMethod: "POST" | "PATCH";
  isFormDisabled: boolean;
  error: ErrorState;
  formData: PneumococcalVaccinationEmployeeInformationType;
};

const enum REDUCER_ACTION_TYPE {
  SET_REQUEST_METHOD,
  SET_IS_FORM_DISABLED,
  SET_ERROR,
  SET_FORM_DATA,
  SET_TODAY_DATE,
}

export type ReducerAction = {
  type: REDUCER_ACTION_TYPE;
  payload?: {
    requestMethod?: "POST" | "PATCH";
    isFormDisabled?: boolean;
    error?: ErrorState;
    formData?: PneumococcalVaccinationEmployeeInformationType;
    todayDate?: string;
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
    jobTitle: "",
    todayDate: formatDateToUTCString(new Date()),
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
          ?.formData as PneumococcalVaccinationEmployeeInformationType,
      };

    case REDUCER_ACTION_TYPE.SET_TODAY_DATE:
      return {
        ...state,
        formData: {
          ...state.formData,
          todayDate: action.payload?.todayDate as string,
        },
      };

    default:
      return state;
  }
};

export { initialState, REDUCER_ACTION_TYPE, reducer };
