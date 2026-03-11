"use client";

// Import React hooks and types
import { useReducer, useEffect } from "react";
import { reducer, initialState, REDUCER_ACTION_TYPE } from "./reducer";
import useValidation from "./useValidation";
import useSubmission from "./useSubmission";
import {
  FluEmployeeInformation,
  FluVaccineFormResponse,
} from "@/types/form-types/FluVaccineFormTypes";

const useLogic = (
  handleNewCompletedSection: (newSection: number) => void,
  currentIndex: number,
  handleChangeIndex: (newIndex: number) => void,
  refetch: any,
  method: "POST" | "PATCH",
  data: boolean | FluVaccineFormResponse | undefined
) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { handleFormValidation } = useValidation(state, dispatch);
  const { handleFormSubmit, mutate } = useSubmission(
    state,
    refetch,
    dispatch,
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex,
    method
  );

  // Update request method when the state changes
  useEffect(() => {
    dispatch({
      type: REDUCER_ACTION_TYPE.SET_REQUEST_METHOD,
      payload: {
        requestMethod: method,
      },
    });
  }, [method]);

  // 1) Create a new variable to hold the data or undefined state
  let information: FluEmployeeInformation | undefined;
  // 2) If the data gotten from the server is boolean, then the data doesn't exist
  if (typeof data === "boolean") {
    // 3) Set the variable to undefined
    information = undefined;
  } else {
    // 4) Else set the variable to to the new data
    information = data?.data.fluEmployeeInformation;
  }

  useEffect(() => {
    if (typeof data !== "boolean" && data) {
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_IS_FORM_DISABLED,
        payload: {
          isFormDisabled:
            data?.data?.status === "awaiting_approval" ||
            data?.data?.status === "approved",
        },
      });
    }
  }, [data]);

  useEffect(() => {
    if (information) {
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_TODAY_DATE,
        payload: {
          todayDate: information?.date_of_filling_form,
        },
      });
    }
  }, [information]);

  return {
    state,
    dispatch,
    handleFormValidation,
    handleFormSubmit,
    mutate,
    information,
  };
};

export default useLogic;
