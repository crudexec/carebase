"use client";

// Import custom hooks and services
import { useToast } from "@/components/ui/use-toast";

// Import types and utilities
import { validationEngine, validateForm } from "@/utils/validators";
import {
  EmployeeDemographicPersonalInformationFormData as EmployeeDemographicPersonalInformationType,
  employeeDemographicPersonalInformationSchema,
} from "@/utils/schemas";
import {
  InitialStateType,
  REDUCER_ACTION_TYPE,
  ReducerAction,
} from "./reducer";
import { INCOMPLETE_FIELD_MESSAGE } from "../constant";
import { revertFormattedPhoneNumber } from "@/utils/helpers";

const useValidation = (
  formState: InitialStateType,
  dispatch: (value: ReducerAction) => void
) => {
  const { toast } = useToast();

  // Handle form validation
  const handleFormValidation = (
    formData: FormData
  ): {
    isFormValid: boolean;
    data: EmployeeDemographicPersonalInformationType;
  } => {
    const lastName = formData.get("lastName") as string;
    const firstName = formData.get("firstName") as string;
    const ssn = formData.get("ssn") as string;
    const cellPhone = formData.get("cellPhoneNumber") as string;
    const homePhone = formData.get("homePhoneNumber") as string;
    const address = formData.get("address") as string;
    const cityOrTown = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zipCode = formData.get("zipCode") as string;
    const race = formData.get("race") as string;
    const gender = formData.get("gender") as string;

    const socialSecurityNumber = ssn.replace(/-/g, "");
    const cellPhoneNumber = revertFormattedPhoneNumber(cellPhone);
    const homePhoneNumber = revertFormattedPhoneNumber(homePhone);

    const data: EmployeeDemographicPersonalInformationType = {
      lastName,
      firstName,
      socialSecurityNumber,
      dateOfBirth: formState.formData.dateOfBirth,
      cellPhoneNumber,
      homePhoneNumber,
      address,
      cityOrTown,
      state,
      zipCode,
      race: race ?? "",
      gender: gender ?? "",
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
      employeeDemographicPersonalInformationSchema
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
