"use client";

// Import React hooks and types
import { useReducer, useEffect } from "react";
import { reducer, initialState, REDUCER_ACTION_TYPE } from "./reducer";
import useValidation from "./useValidation";
import useSubmission from "./useSubmission";
import {
  HepatitisAttestationInformation,
  HepatitisPersonalInformation,
  HepatitisResponse,
} from "@/types/form-types/HepatitisFormTypes";

const useLogic = (
  handleNewCompletedSection: (newSection: number) => void,
  currentIndex: number,
  handleChangeIndex: (newIndex: number) => void,
  refetch: any,
  methods: {
    informationMethod: "POST" | "PATCH";
    attestationMethod: "POST" | "PATCH";
  },
  data: boolean | HepatitisResponse | undefined
) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { handleFormValidation } = useValidation(dispatch);
  const { handleFormSubmit, mutate } = useSubmission(
    refetch,
    dispatch,
    handleNewCompletedSection,
    currentIndex,
    handleChangeIndex,
    methods,
    state
  );

  // 1) Create a new variable to hold the data or undefined state
  let attestation: HepatitisAttestationInformation | undefined;
  // 2) If the data gotten from the server is boolean, then the data doesn't exist
  if (typeof data === "boolean") {
    // 3) Set the variable to undefined
    attestation = undefined;
  } else {
    // 4) Else set the variable to to the new data
    attestation = data?.data.attestationInformation;
  }

  // 1) Create a new variable to hold the data or undefined state
  let information: HepatitisPersonalInformation | undefined;
  // 2) If the data gotten from the server is boolean, then the data doesn't exist
  if (typeof data === "boolean") {
    // 3) Set the variable to undefined
    information = undefined;
  } else {
    // 4) Else set the variable to to the new data
    information = data?.data.personalInformation;
  }

  useEffect(() => {
    if (typeof data !== "boolean" && data) {
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_IS_FORM_DISABLED,
        payload: {
          isFormDisabled:
            (data?.data?.status === "awaiting_approval" ||
              data?.data?.status === "approved") &&
            data?.data?.personalInformation &&
            Object.keys(data?.data?.personalInformation).length > 0,
        },
      });
    }
  }, [data]);

  // 1) Create a variable for storing the default value
  let defaultValue: string = "";

  // 2) Get each field data and store it in another variable variable
  const hadHepatitisB = attestation?.had_hepatitis_b_vaccine_series_of_three;
  const arrangedHepatitisB =
    attestation?.arranged_for_hepatitis_b_vaccine_series_of_three;
  const declinedHepatitisB =
    attestation?.declined_hepatitis_b_vaccine_series_of_three;

  // 3) If the field data is true, then set the default value to the field name
  if (hadHepatitisB) {
    defaultValue = "had_hepatitis_b_vaccine_series_of_three";
  } else if (arrangedHepatitisB) {
    defaultValue = "arranged_for_hepatitis_b_vaccine_series_of_three";
  } else if (declinedHepatitisB) {
    defaultValue = "declined_hepatitis_b_vaccine_series_of_three";
  }

  return {
    state,
    dispatch,
    handleFormValidation,
    handleFormSubmit,
    mutate,
    attestation,
    defaultValue,
    information,
  };
};

export default useLogic;
