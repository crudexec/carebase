"use client";

// Import custom hooks and services
import { useToast } from "@/components/ui/use-toast";

// Import types and utilities
import { validationEngine, validateForm } from "@/utils/validators";
import {
  BiodataFormData as BiodataFormType,
  BiodataSchema,
} from "@/utils/schemas";
import { REDUCER_ACTION_TYPE, ReducerAction } from "./reducer";
import { INCOMPLETE_FIELD_MESSAGE } from "@/constants";
import { revertFormattedPhoneNumber } from "@/utils/helpers";

const useValidation = (dispatch: (value: ReducerAction) => void) => {
  const { toast } = useToast();

  // Handle form validation
  const handleFormValidation = (
    formData: FormData
  ): { isFormValid: boolean; data: BiodataFormType } => {
    // Extract form data
    const lastName = formData.get("lastName") as string;
    const firstName = formData.get("firstName") as string;
    const middleName = formData.get("middleName") as string;
    const otherLastName = formData.get("otherLastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phoneNumber") as string;
    const address = formData.get("address") as string;
    const apartmentNumber = formData.get("apartmentNumber") as string;
    const cityOrTown = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zipCode = formData.get("zipCode") as string;
    const ssn = formData.get("socialSecurityNumber") as string;

    const socialSecurityNumber = ssn.replace(/-/g, "");
    const phoneNumber = revertFormattedPhoneNumber(phone);

    // Construct form data object
    const data: BiodataFormType = {
      lastName,
      firstName,
      middleName: middleName ?? "",
      otherLastName: otherLastName ?? "",
      email,
      phoneNumber,
      address,
      apartmentNumber: apartmentNumber ?? "",
      cityOrTown: cityOrTown ?? "",
      state: state ?? "",
      zipCode,
      socialSecurityNumber,
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
      BiodataSchema
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
