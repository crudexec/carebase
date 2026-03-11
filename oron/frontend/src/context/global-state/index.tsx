// src/context/GlobalStateContext.tsx

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";

interface State {
  content: any;
  visits: any[];
  treatmentPlan: any;
  clientLoading: boolean;
  pdfDocument: Uint8Array | null;
}

interface GlobalStateProviderProps {
  children: ReactNode;
}

const initialState: State = {
  content: "",
  visits: [],
  treatmentPlan: {},
  clientLoading: false,
  pdfDocument: null,
};

export const enum GLOBAL_REDUCER_ACTION_TYPE {
  SET_CONTENT,
  SET_VISIT,
  DELETE_VISIT,
  TREATMENT_PLAN,
  SET_CLIENT_LOADING,
  SET_TREATMENT_PLAN_DOC,
}

export type GlobalReducerAction = {
  type: GLOBAL_REDUCER_ACTION_TYPE;
  payload: any;
};

const GlobalStateContext = createContext<
  | {
      state: State;
      dispatch: Dispatch<GlobalReducerAction>;
    }
  | undefined
>(undefined);

const globalStateReducer = (
  state: State,
  action: GlobalReducerAction
): State => {
  switch (action.type) {
    case GLOBAL_REDUCER_ACTION_TYPE.SET_CONTENT:
      return {
        ...state,
        content: action.payload,
      };

    case GLOBAL_REDUCER_ACTION_TYPE.SET_VISIT:
      return {
        ...state,
        visits: action.payload,
      };
    case GLOBAL_REDUCER_ACTION_TYPE.DELETE_VISIT:
      return {
        ...state,
        visits: state.visits.filter((visit) => visit.id !== action.payload),
      };

    case GLOBAL_REDUCER_ACTION_TYPE.TREATMENT_PLAN: {
      return {
        ...state,
        treatmentPlan: action.payload,
      };
    }
    case GLOBAL_REDUCER_ACTION_TYPE.SET_CLIENT_LOADING:
      return {
        ...state,
        clientLoading: action.payload,
      };

    case GLOBAL_REDUCER_ACTION_TYPE.SET_TREATMENT_PLAN_DOC:
      return {
        ...state,
        pdfDocument: action.payload,
      };

    default:
      return state;
  }
};

export const GlobalStateProvider = ({ children }: GlobalStateProviderProps) => {
  const [state, dispatch] = useReducer(globalStateReducer, initialState);

  return (
    <GlobalStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};
