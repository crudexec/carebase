"use client";

// Import React hooks and types
import { useReducer, useEffect, ChangeEvent } from "react";
import { reducer, initialState, REDUCER_ACTION_TYPE } from "./reducer";
import useValidation from "./useValidation";
import useSubmission from "./useSubmission";
import { EmployeeDemographicFormResponse } from "@/types/form-types/EmployeeDemographicFormTypes";
import { formatSSN } from "@/utils";
import { INVALID_SSN_MESSAGE } from "@/constants";
import useCustomQuery from "@/hooks/useCustomQuery";
import { BiodataFormResponse } from "@/types/form-types/FormTypes";
import { retrieveBioDataForm } from "@/use-cases/forms";

const useLogic = (
  handleNewCompletedSection: (newSection: number) => void,
  currentIndex: number,
  handleChangeIndex: (newIndex: number) => void,
  refetch: any,
  method: "POST" | "PATCH",
  personalInformation: boolean | EmployeeDemographicFormResponse | undefined
) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch biodata form data
  const { data: biodataData, isLoading: biodataLoading } =
    useCustomQuery<BiodataFormResponse | undefined>("biodata", retrieveBioDataForm);

  // Custom hooks and utilities
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
  let processedPersonalInformation: EmployeeDemographicFormResponse | undefined;
  // 2) If the data gotten from the server is boolean, then the data doesn't exist
  if (typeof personalInformation === "boolean") {
    // 3) Set the variable to undefined
    processedPersonalInformation = undefined;
  } else {
    // 4) Else set the variable to to the new data
    processedPersonalInformation = personalInformation;
  }

  // 1) Create a new variable to hold the biodata data or undefined state
  let biodata: BiodataFormResponse | undefined;
  // 2) If the data gotten from the server is boolean, then the data doesn't exist
  if (typeof biodataData === "boolean") {
    // 3) Set the variable to undefined
    biodata = undefined;
  } else {
    // 4) Else set the variable to to the new data
    biodata = biodataData;
  }

  // Prefill the social security number with the one gotten from the server
  useEffect(() => {
    dispatch({
      type: REDUCER_ACTION_TYPE.SET_SOCIAL_SECURITY_NUMBER,
      payload: {
        socialSecurityNumber: formatSSN(
          processedPersonalInformation?.data?.employeeDemographicInformation
            ?.social_security_number ?? ""
        ),
      },
    });
  }, [processedPersonalInformation]);

  // Prefill the date of birth with the one gotten from the server
  useEffect(() => {
    if (processedPersonalInformation) {
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_IS_FORM_DISABLED,
        payload: {
          isFormDisabled:
            processedPersonalInformation?.data?.status ===
              "awaiting_approval" ||
            processedPersonalInformation?.data?.status === "approved",
        },
      });

      dispatch({
        type: REDUCER_ACTION_TYPE.SET_DATE_OF_BIRTH,
        payload: {
          dateOfBirth:
            processedPersonalInformation.data.employeeDemographicInformation
              .date_of_birth,
        },
      });
    }
  }, [processedPersonalInformation]);

  // Handle Social Security Number change
  const handleSSNChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const numericValue = value.replace(/\D/g, "");
    const formattedSSN = formatSSN(numericValue);
    dispatch({
      type: REDUCER_ACTION_TYPE.SET_SOCIAL_SECURITY_NUMBER,
      payload: {
        socialSecurityNumber: formattedSSN,
      },
    });

    // Validate Social Security Number
    if (value.length > 11) {
      return;
    } else {
      const ssnRegex = /^(?!000|666|9\d{2})\d{0,3}-?\d{0,2}-?\d{0,4}$/;
      if (ssnRegex.test(numericValue)) {
        dispatch({
          type: REDUCER_ACTION_TYPE.SET_ERROR,
          payload: {
            error: {
              field: [],
              message: [],
            },
          },
        });
      } else {
        dispatch({
          type: REDUCER_ACTION_TYPE.SET_ERROR,
          payload: {
            error: {
              field: [INVALID_SSN_MESSAGE],
              message: [INVALID_SSN_MESSAGE],
            },
          },
        });
      }
    }
  };

  return {
    state,
    dispatch,
    handleFormValidation,
    handleFormSubmit,
    mutate,
    handleSSNChange,
    processedPersonalInformation,
    biodata,
    biodataLoading,
  };
};

export default useLogic;
