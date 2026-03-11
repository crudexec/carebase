"use client";

// Import custom hooks and services
import { useToast } from "@/components/ui/use-toast";

// Import types and utilities
import { validationEngine, validateForm } from "@/utils/validators";
import { ReferenceFormSchema, ReferenceFormData } from "@/utils/schemas";
import { REDUCER_ACTION_TYPE, ReducerAction } from "./reducer";
import { INCOMPLETE_FIELD_MESSAGE } from "./constant";

export const exposeRefFormData = (formData: FormData): ReferenceFormData => {
  const referrer_one_firstname = formData.get(
    "referrer_one_firstname"
  ) as string;
  const referrer_one_lastname = formData.get("referrer_one_lastname") as string;
  const referrer_one_email = formData.get("referrer_one_email") as string;
  const referrer_one_phone = formData.get("referrer_one_phone") as string;

  const referrer_two_firstname = formData.get(
    "referrer_two_firstname"
  ) as string;
  const referrer_two_lastname = formData.get("referrer_two_lastname") as string;
  const referrer_two_email = formData.get("referrer_two_email") as string;
  const referrer_two_phone = formData.get("referrer_two_phone") as string;

  const referrer_three_firstname = formData.get(
    "referrer_three_firstname"
  ) as string;
  const referrer_three_lastname = formData.get(
    "referrer_three_lastname"
  ) as string;
  const referrer_three_email = formData.get("referrer_three_email") as string;
  const referrer_three_phone = formData.get("referrer_three_phone") as string;

  const data: ReferenceFormData = {
    referrer_one_firstname,
    referrer_one_lastname,
    referrer_one_email,
    referrer_one_phone,
    referrer_two_firstname,
    referrer_two_lastname,
    referrer_two_email,
    referrer_two_phone,
    referrer_three_firstname,
    referrer_three_lastname,
    referrer_three_email,
    referrer_three_phone,
  };

  return data;
};
const useReferenceFormValidation = (
  dispatch: (value: ReducerAction) => void
) => {
  const { toast } = useToast();

  // Handle form validation
  const handleFormValidation = (
    formData: FormData
  ): { isFormValid: boolean; data: ReferenceFormData } => {
    const data = exposeRefFormData(formData);

    // const {}

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
      ReferenceFormSchema
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

export const useSuduReferenceFormValidation = (dispatch: any) => {
  const { toast } = useToast();

  const handleFormValidation = (
    formData: any
  ): { isFormValid: boolean; data: any } => {
    const data = formData;

    const validationResult = validationEngine(
      data,
      validateForm,
      ReferenceFormSchema
    );

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

export default useReferenceFormValidation;
