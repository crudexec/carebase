"use client";

// Import custom hooks and services
import { useToast } from "@/components/ui/use-toast";

// Import types and utilities
import { ReducerAction, InitialStateType } from "./reducer";
import useCustomMutation from "@/hooks/useCustomMutation";
import useValidation from "./useValidation";
import { handleFluVaccineVaccinationInformationSubmission } from "@/actions/forms";

const useSubmission = (
  state: InitialStateType,
  refetch: any,
  dispatch: (value: ReducerAction) => void,
  handleNewCompletedSection: (newSection: number) => void,
  currentIndex: number,
  handleChangeIndex: (newIndex: number) => void,
  method: "POST" | "PATCH"
) => {
  const { toast } = useToast();

  const { handleFormValidation } = useValidation(state, dispatch);

  // Handle form submission
  const handleFormSubmit = async (formData: FormData) => {
    if (state.isFormDisabled) {
      handleChangeIndex(currentIndex + 1);
      return;
    }

    const { isFormValid, data } = handleFormValidation(formData);

    if (!isFormValid) return;

    try {
      // Submit form data
      const token = localStorage.getItem("token") as string;

      const response = await handleFluVaccineVaccinationInformationSubmission(
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
    ["fluVaccine", "formData", "offerLetter"]
  );

  return { handleFormSubmit, mutate };
};

export default useSubmission;
