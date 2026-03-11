"use client";

// Import React hooks and types
import { useReducer, useEffect } from "react";
import { reducer, initialState, REDUCER_ACTION_TYPE } from "./reducer";
import useValidation from "./useValidation";
import useSubmission from "./useSubmission";
import { EmployeeDemographicFormResponse } from "@/types/form-types/EmployeeDemographicFormTypes";
import { formatPhoneNumber } from "@/utils/helpers";

const useLogic = (
  handleNewCompletedSection: (newSection: number) => void,
  currentIndex: number,
  handleChangeIndex: (newIndex: number) => void,
  refetch: any,
  method: "POST" | "PATCH",
  contactInformation: boolean | EmployeeDemographicFormResponse | undefined,
  handleToggleSign: (status: boolean) => void
) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Custom hooks and utilities
  const { handleFormValidation } = useValidation(dispatch);
  const { handleFormSubmit, mutate } = useSubmission(
    refetch,
    dispatch,
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex,
    method,
    handleToggleSign,
    state
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
  let processedContactInformation: EmployeeDemographicFormResponse | undefined;

  // 2) If the data gotten from the server is boolean, then the data doesn't exist
  if (typeof contactInformation === "boolean") {
    // 3) Set the variable to undefined
    processedContactInformation = undefined;
  } else {
    // 4) Else set the variable to to the new data
    processedContactInformation = contactInformation;
  }

  useEffect(() => {
    if (
      processedContactInformation?.data &&
      processedContactInformation?.data?.emergencyContactInformation &&
      Object.keys(
        processedContactInformation?.data?.emergencyContactInformation
      ).length > 0
    ) {
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_IS_FORM_DISABLED,
        payload: {
          isFormDisabled:
            processedContactInformation?.data?.status === "awaiting_approval" ||
            processedContactInformation?.data?.status === "approved",
        },
      });
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_PHONE_NUMBER,
        payload: {
          phoneNumber: formatPhoneNumber(
            processedContactInformation.data.emergencyContactInformation
              .phone ?? ""
          ),
        },
      });
    }
  }, [processedContactInformation]);

  return {
    state,
    dispatch,
    handleFormValidation,
    handleFormSubmit,
    mutate,
    processedContactInformation,
  };
};

export default useLogic;
