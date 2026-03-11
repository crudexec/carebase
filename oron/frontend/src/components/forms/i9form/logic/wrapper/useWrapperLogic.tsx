"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setsAreEqual } from "@/utils";
import useCustomQuery from "@/hooks/useCustomQuery";
import { retrieveI9Form } from "@/use-cases/forms";
import useUser from "@/hooks/useUser";
import useForms from "@/hooks/forms/useForms";
import {
  FormattedFormStatus,
  INineFormResponse,
} from "@/types/form-types/FormTypes";
import { handleDisplayForm } from "./display-forms";
import { TOTAL_SECTIONS } from "../constant";

export type MethodState = {
  stepOne: "POST" | "PATCH";
  stepTwo: "POST" | "PATCH";
  stepThree: "POST" | "PATCH";
};

const useWrapperLogic = () => {
  const router = useRouter();
  const {
    data: formInfo,
    isLoading: formInfoLoading,
    refetch,
  } = useCustomQuery<INineFormResponse | undefined>("i9form", retrieveI9Form);
  const {
    data: formData,
    isLoading: formDataLoading,
    refetch: refetchFormStatus,
  } = useForms();
  const { data: user, isLoading: userDataLoading } = useUser();

  const formStatusData = formData?.status;

  const [currentIndex, setCurrentIndex] = useState(1);
  const [status, setStatus] = useState<FormattedFormStatus>("Not Filled");
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );
  const [method, setMethod] = useState<MethodState>({
    stepOne: "POST",
    stepTwo: "POST",
    stepThree: "POST",
  });
  const [suggestionOpen, setSuggestionOpen] = useState(false);

  const handleNewCompletedSection = useCallback(
    (newSection: number) => {
      setCompletedSections((prevSections) => {
        const uniqueSections = new Set(prevSections);
        uniqueSections.add(newSection);
        return uniqueSections;
      });
      refetchFormStatus();
      router.push("#");
    },
    [router, refetchFormStatus]
  );

  const updateMethodAndSections = (
    fieldInfo: any,
    fieldName: string,
    sectionNumber: number
  ) => {
    if (fieldInfo && Object.keys(fieldInfo).length > 0) {
      setMethod((prevMethod) => ({
        ...prevMethod,
        [fieldName]: "PATCH",
      }));
      return sectionNumber;
    }
    return null;
  };

  useEffect(() => {
    if (formInfo && typeof formInfo !== "boolean") {
      const { i9Form, signature, documents } = formInfo.data;
      const updatedSections = new Set(completedSections);

      if (i9Form?.id) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          stepOne: "PATCH",
        }));
        updatedSections.add(1);
      }

      if (documents) {
        if (Array.isArray(documents) && documents.length > 0) {
          setMethod((prevMethod) => ({
            ...prevMethod,
            stepThree: "PATCH",
          }));
          updatedSections.add(3);
        } else if (
          typeof documents === "object" &&
          Object.keys(documents).length > 0
        ) {
          setMethod((prevMethod) => ({
            ...prevMethod,
            stepThree: "PATCH",
          }));
          updatedSections.add(3);
        }
      }

      if (signature && Object.keys(signature)?.length > 0) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          stepTwo: "PATCH",
        }));
        updatedSections.add(4);
      }

      if (!setsAreEqual(completedSections, updatedSections)) {
        setCompletedSections(updatedSections);
      }
    }
  }, [formInfo, completedSections]);

  useEffect(() => {
    refetchFormStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formStatusData && typeof formStatusData !== "boolean") {
      setStatus(formStatusData.i9);
    }
  }, [formStatusData]);

  const handleChangeIndex = (newIndex: number) => {
    setCurrentIndex(newIndex);
    refetchFormStatus();
    router.push("#");
  };

  const completedPercentage = Math.floor(
    (completedSections.size / TOTAL_SECTIONS) * 100
  );

  const handleToggleSuggestion = (status: boolean) => {
    setSuggestionOpen(status);
  };

  return {
    formInfo,
    formInfoLoading,
    user,
    userDataLoading,
    formDataLoading,
    status,
    currentIndex,
    completedSections,
    method,
    handleChangeIndex,
    handleNewCompletedSection,
    completedPercentage,
    handleDisplayForm: handleDisplayForm(
      currentIndex,
      user!,
      method,
      completedSections,
      formInfo,
      status,
      {
        handleNewCompletedSection,
        handleChangeIndex,
        refetch,
        refetchFormStatus,
        suggestionOpen,
        handleToggleSuggestion,
      }
    ),
    suggestionOpen,
  };
};

export default useWrapperLogic;
