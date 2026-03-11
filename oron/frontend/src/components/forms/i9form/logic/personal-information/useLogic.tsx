"use client";

// Import React hooks and types
import { useReducer, useEffect, ChangeEvent } from "react";

// Import custom hooks and services
import useCustomQuery from "@/hooks/useCustomQuery";
import useValidation from "./useValidation";
import useSubmission from "./useSubmission";
import { retrieveBioDataForm } from "@/use-cases/forms";

// Import types and utilities
import {
  BiodataFormResponse,
  INineFormResponse,
} from "@/types/form-types/FormTypes";
import { formatSSN } from "@/utils";
import { initialState, reducer, REDUCER_ACTION_TYPE } from "./reducer";
import { INVALID_SSN_MESSAGE, MAX_SSSN_MESSAGE } from "@/constants";
import { formatPhoneNumber } from "@/utils/helpers";

const useLogic = (
  handleNewCompletedSection: (newSection: number) => void,
  currentIndex: number,
  handleChangeIndex: (newIndex: number) => void,
  refetch: any,
  method: "POST" | "PATCH",
  data: boolean | INineFormResponse | undefined
) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch biodata form data
  const { data: biodataData, isLoading: biodataLoading } = useCustomQuery<
    BiodataFormResponse | undefined
  >("biodata", retrieveBioDataForm);

  const { handleFormValidation } = useValidation(dispatch);
  const { handleFormSubmit, mutate } = useSubmission(
    refetch,
    dispatch,
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex,
    method
  );

  // Process biodata form data
  let biodata: BiodataFormResponse | undefined;
  if (typeof biodataData === "boolean") {
    biodata = undefined;
  } else if (data) {
    biodata = biodataData;
  }

  let processedPersonalInformation: INineFormResponse | undefined;
  if (typeof data === "boolean") {
    processedPersonalInformation = undefined;
  } else {
    processedPersonalInformation = data;
  }

  // Update request method when the state changes
  useEffect(() => {
    dispatch({
      type: REDUCER_ACTION_TYPE.SET_REQUEST_METHOD,
      payload: {
        requestMethod: method,
      },
    });
  }, [method]);

  useEffect(() => {
    if (
      processedPersonalInformation &&
      Object.keys(processedPersonalInformation).length > 0 &&
      Object.keys(processedPersonalInformation.data.personalInformation)
        .length > 0
    ) {
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_SOCIAL_SECURITY_NUMBER,
        payload: {
          socialSecurityNumber:
            processedPersonalInformation?.data.personalInformation
              .social_security_number ?? "",
        },
      });

      dispatch({
        type: REDUCER_ACTION_TYPE.SET_PHONE_NUMBER,
        payload: {
          phoneNumber: formatPhoneNumber(
            processedPersonalInformation?.data?.personalInformation?.phone ?? ""
          ),
        },
      });
    } else if (biodata && Object.keys(biodata).length > 0) {
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_SOCIAL_SECURITY_NUMBER,
        payload: {
          socialSecurityNumber: biodata?.data?.social_security_number ?? "",
        },
      });

      dispatch({
        type: REDUCER_ACTION_TYPE.SET_PHONE_NUMBER,
        payload: {
          phoneNumber: formatPhoneNumber(biodata?.data?.phone ?? ""),
        },
      });
    }
  }, [processedPersonalInformation, biodata]);

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
    biodata,
    biodataLoading,
    processedPersonalInformation,
    handleSSNChange,
  };
};

export default useLogic;
