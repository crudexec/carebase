"use client";

// Import custom hooks and services
import { useToast } from "@/components/ui/use-toast";
import { handleI9FormPersonalInformationSubmission } from "@/actions/forms";

// Import types and utilities
import { ReducerAction } from "./reducer";
import useCustomMutation from "@/hooks/useCustomMutation";
import useValidation from "./useValidation";
import { handleSubmitPDFInput } from "@/actions/forms/i9form";

const useSubmission = (
  refetch: any,
  dispatch: (value: ReducerAction) => void,
  handleNewCompletedSection: (newSection: number) => void,
  currentIndex: number,
  handleChangeIndex: (newIndex: number) => void,
  method: "POST" | "PATCH"
) => {
  const { toast } = useToast();

  const { handleFormValidation } = useValidation(dispatch);

  // Handle form submission
  const handleFormSubmit = async (formData: FormData) => {
    const { isFormValid, data } = handleFormValidation(formData);

    if (!isFormValid) return;

    try {
      // Submit form data
      const token = localStorage.getItem("token") as string;

      const response = await handleI9FormPersonalInformationSubmission(
        data,
        token,
        method
      );

      refetch();

      // Handle submission response
      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleNewCompletedSection(currentIndex);
      handleChangeIndex(currentIndex + 1);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const { mutate } = useCustomMutation<FormData>(
    async (formData: FormData) => await handleFormSubmit(formData),
    ["i9form", "formData", "offerLetter"]
  );

  return { handleFormSubmit, mutate };
};

export const submitPDFInputData = async ({
  filled_pdf_json_data,
  method,
}: {
  filled_pdf_json_data: string;
  method: "POST" | "PATCH";
}) => {
  try {
    const token = localStorage.getItem("token") as string;

    const res = await handleSubmitPDFInput(filled_pdf_json_data, token, method);

    return res;
  } catch (error) {
    return { status: false, errorMessage: "Something went wrong" };
  }
};

export default useSubmission;
