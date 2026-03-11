"use client";

// Import React hooks and types
import { useReducer, useEffect } from "react";
import { reducer, initialState, REDUCER_ACTION_TYPE } from "./reducer";
import useValidation from "./useValidation";
import useSubmission from "./useSubmission";
import {
  FluVaccineFormResponse,
  FluAttestationForm,
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
  let vaccineInformation: FluAttestationForm | undefined;
  let status: string = "";
  // 2) If the data gotten from the server is boolean, then the data doesn't exist
  if (typeof data === "boolean") {
    // 3) Set the variable to undefined
    vaccineInformation = undefined;
  } else {
    // 4) Else set the variable to to the new data
    status = data?.data?.status ?? "";
    vaccineInformation = data?.data.fluAttestationForm;
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
    if (vaccineInformation && Object.keys(vaccineInformation).length > 0) {
      const {
        date_received_flu_vaccine,
        other,
        have_received_flu_vaccine,
        declined_flu_vaccine,
      } = vaccineInformation;

      if (
        typeof have_received_flu_vaccine === "boolean" &&
        have_received_flu_vaccine === true
      ) {
        dispatch({
          type: REDUCER_ACTION_TYPE.SET_SELECTED_OPTION,
          payload: {
            selectedOption: "yes",
          },
        });
      } else if (
        typeof declined_flu_vaccine === "boolean" &&
        declined_flu_vaccine === true
      ) {
        dispatch({
          type: REDUCER_ACTION_TYPE.SET_SELECTED_OPTION,
          payload: {
            selectedOption: "no",
          },
        });
      }

      dispatch({
        type: REDUCER_ACTION_TYPE.SET_SELECTED_OTHER,
        payload: {
          selectedOther: other !== null && other.length > 1,
        },
      });

      if (other !== null && other.length > 1) {
        dispatch({
          type: REDUCER_ACTION_TYPE.SET_OTHER,
          payload: {
            other: other,
          },
        });
      }

      dispatch({
        type: REDUCER_ACTION_TYPE.SET_VACCINATION_DATE,
        payload: {
          vaccinationDate: date_received_flu_vaccine ?? "",
        },
      });
    }
  }, [vaccineInformation]);

  const getDefaultValueOne = () => {
    if (
      vaccineInformation?.declined_flu_vaccine !== undefined &&
      vaccineInformation?.have_received_flu_vaccine !== undefined
    ) {
      if (vaccineInformation.declined_flu_vaccine === true) {
        return "no";
      } else if (vaccineInformation.have_received_flu_vaccine === true) {
        return "yes";
      }
    }
    return undefined;
  };

  const getDefaultValueTwo = () => {
    if (vaccineInformation) {
      const {
        received_flu_vaccine_elsewhere,
        medical_contraindication_to_receiving_vaccine,
        personal_or_religious_beliefs_preventing_vaccination,
        allergic_to_vaccine_components,
        concerns_about_vaccine_safety,
        other,
      } = vaccineInformation;

      if (received_flu_vaccine_elsewhere) {
        return "received_flu_vaccine_elsewhere";
      } else if (medical_contraindication_to_receiving_vaccine) {
        return "medical_contraindication_to_receiving_vaccine";
      } else if (personal_or_religious_beliefs_preventing_vaccination) {
        return "personal_or_religious_beliefs_preventing_vaccination";
      } else if (allergic_to_vaccine_components) {
        return "allergic_to_vaccine_components";
      } else if (concerns_about_vaccine_safety) {
        return "concerns_about_vaccine_safety";
      } else if (other && other.length > 1) {
        return "other";
      }
    }
    return undefined;
  };

  return {
    state,
    dispatch,
    handleFormValidation,
    handleFormSubmit,
    mutate,
    vaccineInformation,
    getDefaultValueOne,
    getDefaultValueTwo,
    status,
  };
};

export default useLogic;
