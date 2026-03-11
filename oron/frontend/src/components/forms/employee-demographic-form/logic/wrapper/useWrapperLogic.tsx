"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setsAreEqual } from "@/utils";
import useCustomQuery from "@/hooks/useCustomQuery";
import { EmployeeDemographicFormResponse } from "@/types/form-types/EmployeeDemographicFormTypes";
import { retrieveEmployeeDemographicForm } from "@/use-cases/forms";
import useUser from "@/hooks/useUser";
import useForms from "@/hooks/forms/useForms";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { TOTAL_SECTIONS } from "../constant";
import { handleDisplayForm } from "./display-forms";

export type MethodState = {
  personalInformation: "POST" | "PATCH";
  emergencyContactInfo: "POST" | "PATCH";
};

const useWrapperLogic = () => {
  const router = useRouter();

  const {
    data: formInfo,
    isLoading: formInfoLoading,
    refetch,
  } = useCustomQuery<EmployeeDemographicFormResponse | undefined>(
    "employeeDemographicForm",
    retrieveEmployeeDemographicForm
  );
  const { data: user, isLoading: userDataLoading } = useUser();
  const {
    data: formData,
    isLoading: formDataLoading,
    refetch: refetchFormStatus,
  } = useForms();

  const formStatusData = formData?.status;

  const [status, setStatus] = useState<FormattedFormStatus>("Not Filled");
  const [currentIndex, setCurrentIndex] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );
  const [method, setMethod] = useState<MethodState>({
    personalInformation: "POST",
    emergencyContactInfo: "POST",
  });
  const [justFilled, setJustFilled] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);

  const handleChangeIndex = (newIndex: number) => {
    setCurrentIndex(newIndex);
    router.push("#");
  };

  const handleToggleSign = (status: boolean) => {
    setJustFilled(status);
  };

  const handleNewCompletedSection = useCallback(
    (newSection: number) => {
      setCompletedSections((prevSections) => {
        const uniqueSections = new Set(prevSections);
        uniqueSections.add(newSection);
        return uniqueSections;
      });
      router.push("#");
    },
    [router]
  );

  const completedPercentage = Math.floor(
    (completedSections.size / TOTAL_SECTIONS) * 100
  );

  useEffect(() => {
    if (formStatusData && typeof formStatusData !== "boolean") {
      setStatus(formStatusData?.employeeDemographic);
    }
  }, [formStatusData]);

  useEffect(() => {
    if (!formInfoLoading && formInfo && typeof formInfo !== "boolean") {
      const personalInfo = formInfo.data.employeeDemographicInformation;
      const emergencyContactInfo = formInfo.data.emergencyContactInformation;

      const updatedSections = new Set(completedSections);

      if (personalInfo) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          personalInformation: "PATCH",
        }));
        updatedSections.add(1);
      }

      if (emergencyContactInfo) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          emergencyContactInfo: "PATCH",
        }));
        updatedSections.add(2);
      }

      if (personalInfo && emergencyContactInfo) {
        updatedSections.add(3);
      }

      if (!setsAreEqual(completedSections, updatedSections)) {
        setCompletedSections(updatedSections);
      }
    }
  }, [formInfoLoading, formInfo, completedSections]);

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
    justFilled,
    handleChangeIndex,
    handleToggleSign,
    handleNewCompletedSection,
    completedPercentage,
    handleDisplayForm: handleDisplayForm(
      currentIndex,
      user!,
      method,
      completedSections,
      formInfo,
      justFilled,
      {
        handleNewCompletedSection,
        handleChangeIndex,
        refetch,
        handleToggleSign,
        status,
        refetchFormStatus,
        suggestionOpen,
        handleToggleSuggestion,
      }
    ),
    suggestionOpen,
  };
};

export default useWrapperLogic;
