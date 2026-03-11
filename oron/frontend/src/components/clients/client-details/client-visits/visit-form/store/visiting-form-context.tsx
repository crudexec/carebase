"use client";
import { ReactNode, createContext, useContext, useReducer } from "react";
import {
  InitialStateType,
  initialState,
  reducer,
  ReducerAction,
} from "./reducer";
import useWrapperLogic from "../logic/wrapper/useWrapperLogic";

const VisitingFormContext = createContext<{
  state: InitialStateType;
  dispatch: React.Dispatch<ReducerAction>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

export const VisitingFormProvider = ({
  children,
  admin = false,
}: {
  children: ReactNode;
  admin?: boolean;
}) => {
  const wrapperLogic = useWrapperLogic();
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <VisitingFormContext.Provider value={{ state, dispatch, ...wrapperLogic }}>
      {children}
    </VisitingFormContext.Provider>
  );
};

export const useVisitingFormContext = () => useContext(VisitingFormContext);
