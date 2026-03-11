"use client";

// Import React hooks and types
import { useReducer } from "react";
import { reducer, initialState } from "./reducer";
import useReferenceFormValidation from "./useReferenceFormValidation";
import useReferenceFormSubmission from "./useReferenceFormSubmission";
import { handleReferenceFormSubmission } from "./reference-form";
import { ReferenceFormData } from "@/utils/schemas";

// Custom hook for Reference form logic
const useReferenceFormLogic = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Custom hooks and utilities
  const { handleFormValidation } = useReferenceFormValidation(dispatch);
  const { handleFormSubmit, mutate } = useReferenceFormSubmission(
    state,
    "DUMMY_REFETCH",
    dispatch
  );

  const handleRefFormDraft = async (FormData: ReferenceFormData) => {
    const token = localStorage.getItem("token") as string;

    await handleReferenceFormSubmission(FormData, token, "POST");
  };

  return {
    state,
    dispatch,
    handleFormValidation,
    handleFormSubmit,
    mutate,
    handleRefFormDraft,
  };
};

export default useReferenceFormLogic;
