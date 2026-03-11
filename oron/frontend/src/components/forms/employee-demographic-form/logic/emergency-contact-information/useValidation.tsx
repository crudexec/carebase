"use client";

// Import custom hooks and services
import { useToast } from "@/components/ui/use-toast";

// Import types and utilities
import { validationEngine, validateForm } from "@/utils/validators";
import {
  EmployeeDemographicContactInformationFormData as EmployeeDemographicContactInformationType,
  employeeDemographicContactInformationSchema,
} from "@/utils/schemas";
import { REDUCER_ACTION_TYPE, ReducerAction } from "./reducer";
import { INCOMPLETE_FIELD_MESSAGE } from "../constant";
import { revertFormattedPhoneNumber } from "@/utils/helpers";

const useValidation = (dispatch: (value: ReducerAction) => void) => {
  const { toast } = useToast();

  // Handle form validation
  const handleFormValidation = (
    formData: FormData
  ): {
    isFormValid: boolean;
    data: EmployeeDemographicContactInformationType;
  } => {
    const lastName = formData.get("lastName") as string;
    const firstName = formData.get("firstName") as string;
    const cellPhone = formData.get("cellPhoneNumber") as string;
    const relationshipToEmployee = formData.get(
      "relationshipToEmployee"
    ) as string;
    const address = formData.get("address") as string;
    const cityOrTown = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zipCode = formData.get("zipCode") as string;

    const cellPhoneNumber = revertFormattedPhoneNumber(cellPhone);

    const data: EmployeeDemographicContactInformationType = {
      lastName,
      firstName,
      cellPhoneNumber,
      relationshipToEmployee,
      address,
      cityOrTown,
      state,
      zipCode,
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
      employeeDemographicContactInformationSchema
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
