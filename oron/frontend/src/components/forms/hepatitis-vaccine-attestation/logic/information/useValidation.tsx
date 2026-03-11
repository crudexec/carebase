"use client";

// Import custom hooks and services
import { useToast } from "@/components/ui/use-toast";

// Import types and utilities
import { validationEngine, validateForm } from "@/utils/validators";
import {
  PneumococcalVaccinationEmployeeInformationFormData as PneumococcalVaccinationEmployeeInformationType,
  pneumococcalVaccinationEmployeeInformationSchema,
} from "@/utils/schemas";
import {
  REDUCER_ACTION_TYPE,
  ReducerAction,
  InitialStateType,
} from "./reducer";
import { INCOMPLETE_FIELD_MESSAGE } from "@/components/forms/flu-vaccine-form/logic/constant";
import { formatDateToUTCString } from "@/utils/date-utils";

const useValidation = (dispatch: (value: ReducerAction) => void) => {
  const { toast } = useToast();

  // Handle form validation
  const handleFormValidation = (
    formData: FormData
  ): {
    isFormValid: boolean;
    data: PneumococcalVaccinationEmployeeInformationType;
  } => {
    const lastName = formData.get("lastName") as string;
    const firstName = formData.get("firstName") as string;
    const jobTitle = "";

    const data: PneumococcalVaccinationEmployeeInformationType = {
      lastName,
      firstName,
      jobTitle,
      todayDate: formatDateToUTCString(new Date()),
    };

    dispatch({
      type: REDUCER_ACTION_TYPE.SET_FORM_DATA,
      payload: {
        formData: data,
      },
    });

    // Validate form data
    const validationResult = validationEngine(
      data,
      validateForm,
      pneumococcalVaccinationEmployeeInformationSchema
    );

    // Show toast if required fields are not filled
    if (validationResult.field.length > 0) {
      toast({
        variant: "destructive",
        description: INCOMPLETE_FIELD_MESSAGE,
      });

      // Update form state with validation result
      dispatch({
        type: REDUCER_ACTION_TYPE.SET_ERROR,
        payload: {
          error: validationResult,
        },
      });

      return { isFormValid: false, data };
    }

    return { isFormValid: validationResult.field.length === 0, data };
  };

  return { handleFormValidation };
};

export default useValidation;
