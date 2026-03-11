"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setsAreEqual } from "@/utils";
import useCustomQuery from "@/hooks/useCustomQuery";
import { retrieveFluVaccineAttestationAndDeclination } from "@/use-cases/forms";
import useUser from "@/hooks/useUser";
import useForms from "@/hooks/forms/useForms";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { TOTAL_SECTIONS } from "../constant";
import { handleDisplayForm } from "./display-forms";
import { FluVaccineFormResponse } from "@/types/form-types/FluVaccineFormTypes";

export type MethodState = {
  employeeInformation: "POST" | "PATCH";
  vaccineInformation: "POST" | "PATCH";
  signature: "POST" | "PATCH";
};

const useWrapperLogic = () => {
  const router = useRouter();
  const [method, setMethod] = useState<MethodState>({
    employeeInformation: "POST",
    vaccineInformation: "POST",
    signature: "POST",
  });

  const { data: user, isLoading: userDataLoading } = useUser();
  const {
    data: formData,
    isLoading: formDataLoading,
    refetch: refetchFormStatus,
  } = useForms();

  const formStatusData = formData?.status;

  const {
    data: formInfo,
    isLoading: formInfoLoading,
    refetch,
  } = useCustomQuery<FluVaccineFormResponse | undefined>(
    "fluVaccine",
    retrieveFluVaccineAttestationAndDeclination
  );
  const [status, setStatus] = useState<FormattedFormStatus>("Not Filled");
  const [currentIndex, setCurrentIndex] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );
  const [suggestionOpen, setSuggestionOpen] = useState(false);

  const handleChangeIndex = (newIndex: number) => {
    setCurrentIndex(newIndex);
    router.push("#");
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

  useEffect(() => {
    if (!formInfoLoading && formInfo && typeof formInfo !== "boolean") {
      const employeeInformation = formInfo.data.fluEmployeeInformation;
      const vaccineInformation = formInfo.data.fluAttestationForm;
      const signature = formInfo.data.fluSignatureForm;

      const updatedSections = new Set(completedSections);

      if (employeeInformation && Object.keys(employeeInformation).length > 0) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          employeeInformation: "PATCH",
        }));
        updatedSections.add(1);
      }

      if (vaccineInformation && Object.keys(vaccineInformation).length > 0) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          vaccineInformation: "PATCH",
        }));
        updatedSections.add(2);
      }

      if (signature && Object.keys(signature).length > 0) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          signature: "PATCH",
        }));
        updatedSections.add(3);
      }

      if (!setsAreEqual(completedSections, updatedSections)) {
        setCompletedSections(updatedSections);
      }
    }
  }, [formInfoLoading, formInfo, completedSections]);

  const completedPercentage = Math.floor(
    (completedSections.size / TOTAL_SECTIONS) * 100
  );

  useEffect(() => {
    if (formStatusData && typeof formStatusData !== "boolean") {
      setStatus(formStatusData?.fluVaccine);
    }
  }, [formStatusData]);

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
      {
        handleNewCompletedSection,
        handleChangeIndex,
        refetch,
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
