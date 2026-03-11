"use client";

// Import custom hooks and services
import { useToast } from "@/components/ui/use-toast";

// Import types and utilities
import {
  ReducerAction,
  InitialStateType,
  REDUCER_ACTION_TYPE,
} from "./reducer";
import useCustomMutation from "@/hooks/useCustomMutation";
import useValidation from "./useValidation";
import {
  handleHepatitisAttestationSubmission,
  handleHepatitisInformationSubmission,
} from "@/actions/forms";
import { formatDateToUTCString } from "@/utils/date-utils";
import { validateForm, validationEngine } from "@/utils/validators";
import { pneumococcalVaccinationEmployeeInformationSchema } from "@/utils/schemas";
import { INCOMPLETE_FIELD_MESSAGE } from "@/constants";

const useSubmission = (
  refetch: any,
  dispatch: (value: ReducerAction) => void,
  handleNewCompletedSection: (newSection: number) => void,
  currentIndex: number,
  handleChangeIndex: (newIndex: number) => void,
  methods: {
    informationMethod: "POST" | "PATCH";
    attestationMethod: "POST" | "PATCH";
  },
  state: InitialStateType
) => {
  const { toast } = useToast();

  const { handleFormValidation } = useValidation(dispatch);

  // Handle form submission
  const handleFormSubmit = async (formData: FormData) => {
    if (state.isFormDisabled) {
      handleChangeIndex(currentIndex + 1);
      return;
    }

    const lastName = formData.get("lastName") as string;
    const firstName = formData.get("firstName") as string;
    const jobTitle = "";

    const { isFormValid, data } = handleFormValidation(formData);

    if (!isFormValid) return;

    const informationData = {
      lastName,
      firstName,
      jobTitle,
      todayDate: formatDateToUTCString(new Date()),
    };

    const validationResult = validationEngine(
      informationData,
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
      return;
    }

    try {
      // Submit form data
      const token = localStorage.getItem("token") as string;

      const attestationResponse = await handleHepatitisAttestationSubmission(
        data,
        token,
        methods.attestationMethod
      );

      const informationResponse = await handleHepatitisInformationSubmission(
        informationData,
        token,
        methods.informationMethod
      );

      refetch();

      // Handle submission response
      if (!attestationResponse.status) {
        toast({
          variant: "destructive",
          description: attestationResponse.errorMessage,
        });
        return;
      }

      if (!informationResponse.status) {
        toast({
          variant: "destructive",
          description: informationResponse.errorMessage,
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
    ["hepatitisForm", "formData", "offerLetter"]
  );

  return { handleFormSubmit, mutate };
};

export default useSubmission;
