"use client";

// Import custom hooks and services
import { useToast } from "@/components/ui/use-toast";
// Import types and utilities
import {
  REDUCER_ACTION_TYPE,
  ReducerAction,
  HepatitisAttestationType,
} from "./reducer";
import { INCOMPLETE_FIELD_MESSAGE } from "@/components/forms/flu-vaccine-form/logic/constant";

const useValidation = (dispatch: (value: ReducerAction) => void) => {
  const { toast } = useToast();

  // Handle form validation
  const handleFormValidation = (
    formData: FormData
  ): {
    isFormValid: boolean;
    data: HepatitisAttestationType;
  } => {
    const attestation = formData.get("attestation") as string;
    const lastName = formData.get("lastName") as string;
    const firstName = formData.get("firstName") as string;
    const jobTitle = ""
    
    const data: HepatitisAttestationType = {
      had_hepatitis_b_vaccine_series_of_three: false,
      arranged_for_hepatitis_b_vaccine_series_of_three: false,
      declined_hepatitis_b_vaccine_series_of_three: false,
    };

    dispatch({
      type: REDUCER_ACTION_TYPE.SET_FORM_DATA,
      payload: {
        formData: data,
      },
    });

    if (attestation === null) {
      toast({
        variant: "destructive",
        description: INCOMPLETE_FIELD_MESSAGE,
      });

      // Update form state with validation result
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_ERROR,
        payload: {
          error: { field: ["attestation"], message: ["attestation"] },
        },
      });

      return { isFormValid: false, data };
    }

    if (attestation === "had_hepatitis_b_vaccine_series_of_three") {
      data.had_hepatitis_b_vaccine_series_of_three = true;
    } else if (
      attestation === "arranged_for_hepatitis_b_vaccine_series_of_three"
    ) {
      data.arranged_for_hepatitis_b_vaccine_series_of_three = true;
    } else if (attestation === "declined_hepatitis_b_vaccine_series_of_three") {
      data.declined_hepatitis_b_vaccine_series_of_three = true;
    }

    return { isFormValid: true, data };
  };

  return { handleFormValidation };
};

export default useValidation;
