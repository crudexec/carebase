"use client";

// Import custom hooks and services
import { useToast } from "@/components/ui/use-toast";
// Import types and utilities
import {
  REDUCER_ACTION_TYPE,
  ReducerAction,
  InitialStateType,
  FluVaccineVaccineInformationType,
} from "./reducer";
import { INCOMPLETE_FIELD_MESSAGE } from "@/components/forms/flu-vaccine-form/logic/constant";

const useValidation = (
  state: InitialStateType,
  dispatch: (value: ReducerAction) => void
) => {
  const { toast } = useToast();

  // Handle form validation
  const handleFormValidation = (
    formData: FormData
  ): {
    isFormValid: boolean;
    data: FluVaccineVaccineInformationType;
  } => {
    const vaccineStatus = formData.get("vaccine_status") as string;
    const declineReason = formData.get("decline_reasons") as string;
    const other = formData.get("other") as string;

    const data: FluVaccineVaccineInformationType = {
      have_received_flu_vaccine: false,
      date_received_flu_vaccine: state.formData.date_received_flu_vaccine,
      received_flu_vaccine_elsewhere: false,
      medical_contraindication_to_receiving_vaccine: false,
      personal_or_religious_beliefs_preventing_vaccination: false,
      allergic_to_vaccine_components: false,
      declined_flu_vaccine: false,
      concerns_about_vaccine_safety: false,
      other: null,
    };

    dispatch({
      type: REDUCER_ACTION_TYPE.SET_FORM_DATA,
      payload: {
        formData: {
          ...state.formData,
          ...data,
        },
      },
    });

    if (vaccineStatus === null) {
      toast({
        variant: "destructive",
        description: INCOMPLETE_FIELD_MESSAGE,
      });

      // Update form state with validation result
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_ERROR,
        payload: {
          error: { field: ["yes", "no"], message: ["yes", "no"] },
        },
      });
    }

    if (vaccineStatus === "yes" && !state.formData?.date_received_flu_vaccine) {
      toast({
        variant: "destructive",
        description: INCOMPLETE_FIELD_MESSAGE,
      });

      // Update form state with validation result
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_ERROR,
        payload: {
          error: {
            field: ["date"],
            message: ["Please choose the Date Of Vaccination"],
          },
        },
      });

      return { isFormValid: false, data };
    }

    if (vaccineStatus === "no" && declineReason === null) {
      toast({
        variant: "destructive",
        description: INCOMPLETE_FIELD_MESSAGE,
      });

      // Update form state with validation result
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_ERROR,
        payload: {
          error: {
            field: ["reason"],
            message: ["reason"],
          },
        },
      });

      return { isFormValid: false, data };
    }

    if (declineReason === "other" && other.length < 1) {
      toast({
        variant: "destructive",
        description: INCOMPLETE_FIELD_MESSAGE,
      });

      // Update form state with validation result
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_ERROR,
        payload: {
          error: {
            field: ["other"],
            message: ["Please input your reason"],
          },
        },
      });

      return { isFormValid: false, data };
    }

    if (vaccineStatus === "yes") {
      data.have_received_flu_vaccine = true;
    }
    if (vaccineStatus === "no") {
      data.declined_flu_vaccine = true;
    }
    if (declineReason === "received_flu_vaccine_elsewhere") {
      data.received_flu_vaccine_elsewhere = true;
    } else if (
      declineReason === "medical_contraindication_to_receiving_vaccine"
    ) {
      data.medical_contraindication_to_receiving_vaccine = true;
    } else if (
      declineReason === "personal_or_religious_beliefs_preventing_vaccination"
    ) {
      data.personal_or_religious_beliefs_preventing_vaccination = true;
    } else if (declineReason === "allergic_to_vaccine_components") {
      data.allergic_to_vaccine_components = true;
    } else if (declineReason === "concerns_about_vaccine_safety") {
      data.concerns_about_vaccine_safety = true;
    } else if (vaccineStatus === "no" && declineReason === "other") {
      data.other = other;
    }
    return { isFormValid: true, data };
  };

  return { handleFormValidation };
};

export default useValidation;
