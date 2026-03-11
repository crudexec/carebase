"use client";

// Import React hooks and types
import { useRouter } from "next/navigation";

// Import custom hooks and services
import { useToast } from "@/components/ui/use-toast";

// Import types and utilities
import { InitialStateType, ReducerAction } from "./reducer";
import useCustomMutation from "@/hooks/useCustomMutation";
import useReferenceFormValidation from "./useReferenceFormValidation";
import {
  REFERENCE_FORM_SERVER_ERROR_MESSAGE,
  REFERENCE_FORM_SUCCESS_MESSAGE,
} from "./constant";
import { handleReferenceFormFinalSubmission } from "./reference-form";

const useReferenceFormSubmission = (
  state: InitialStateType,
  refetch: any,
  dispatch: (value: ReducerAction) => void
) => {
  const { toast } = useToast();
  const router = useRouter();

  const { handleFormValidation } = useReferenceFormValidation(dispatch);

  // Handle form submission
  const handleFormSubmit = async (formData: FormData) => {
    const { isFormValid, data } = handleFormValidation(formData);

    if (!isFormValid) return;

    try {
      // Submit form data
      const token = localStorage.getItem("token") as string;
      const response = await handleReferenceFormFinalSubmission(
        formData,
        token
      );

      if (!response) {
        toast({
          variant: "destructive",
          description: REFERENCE_FORM_SERVER_ERROR_MESSAGE,
        });
        return;
      }

      toast({
        variant: "success",
        description: REFERENCE_FORM_SUCCESS_MESSAGE,
      });

      router.push("/onboarding/form");
    } catch (error: any) {
      throw new Error(error);
    }
  };

  // Custom mutation hook for form submission
  const { mutate } = useCustomMutation<FormData>(
    async (formData: FormData) => await handleFormSubmit(formData),
    ["referenceForm", "formData", "offerLetter"]
  );

  return { handleFormSubmit, mutate };
};

export const useReferenceDraftFormSubmission = (
  state: InitialStateType,
  refetch: any,
  dispatch: (value: ReducerAction) => void
) => {
  const { toast } = useToast();
  const router = useRouter();

  // const { handleFormValidation } = useReferenceFormValidation(dispatch);

  // Handle form submission
  const handleFormSubmit = async (formData: FormData) => {
    const { isFormValid, data } = handleFormValidation(formData);

    if (!isFormValid) return;

    try {
      // Submit form data
      const token = localStorage.getItem("token") as string;
      const response = handleReferenceFormFinalSubmission(formData, token);

      if (!response) {
        toast({
          variant: "destructive",
          description: REFERENCE_FORM_SERVER_ERROR_MESSAGE,
        });
        return;
      }

      toast({
        variant: "success",
        description: REFERENCE_FORM_SUCCESS_MESSAGE,
      });

      // router.push("/onboarding/form");
    } catch (error: any) {
      throw new Error(error);
    }
  };

  // Custom mutation hook for form submission
  const { mutate } = useCustomMutation<FormData>(
    async (formData: FormData) => await handleFormSubmit(formData),
    ["referenceForm", "formData", "offerLetter"]
  );

  return { handleFormSubmit, mutate };
};

export default useReferenceFormSubmission;
function handleFormValidation(formData: FormData): {
  isFormValid: any;
  data: any;
} {
  throw new Error("Function not implemented.");
}
