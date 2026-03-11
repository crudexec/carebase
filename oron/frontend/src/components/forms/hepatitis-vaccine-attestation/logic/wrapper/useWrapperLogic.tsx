"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setsAreEqual } from "@/utils";
import useCustomQuery from "@/hooks/useCustomQuery";
import { retrieveHepatitisVaccinationAttestation } from "@/use-cases/forms";
import useUser from "@/hooks/useUser";
import useForms from "@/hooks/forms/useForms";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { handleDisplayForm } from "./display-forms";
import { HepatitisResponse } from "@/types/form-types/HepatitisFormTypes";
import { TOTAL_SECTIONS } from "../constant";

export type MethodState = {
  attestation: "POST" | "PATCH";
  information: "POST" | "PATCH";
  signature: "POST" | "PATCH";
};

const useWrapperLogic = () => {
  const router = useRouter();
  const [method, setMethod] = useState<MethodState>({
    attestation: "POST",
    information: "POST",
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
  } = useCustomQuery<HepatitisResponse | undefined>(
    "hepatitisForm",
    retrieveHepatitisVaccinationAttestation
  );
  const [status, setStatus] = useState<FormattedFormStatus>("Not Filled");
  const [currentIndex, setCurrentIndex] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );
  const [suggestionOpen, setSuggestionOpen] = useState(false);

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
      const attestation = formInfo.data.attestationInformation;
      const information = formInfo.data.personalInformation;
      const signature = formInfo.data.signatureInformation;

      const updatedSections = new Set(completedSections);

      if (
        attestation &&
        Object.keys(attestation).length > 0 &&
        information &&
        Object.keys(information).length > 0
      ) {
        updatedSections.add(1);
      }

      if (attestation && Object.keys(attestation).length > 0) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          attestation: "PATCH",
        }));
      }

      if (information && Object.keys(information).length > 0) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          information: "PATCH",
        }));
      }

      if (signature && Object.keys(signature).length > 0) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          signature: "PATCH",
        }));

        updatedSections.add(2);
      }

      if (!setsAreEqual(completedSections, updatedSections)) {
        setCompletedSections(updatedSections);
      }
    }
  }, [formInfoLoading, formInfo, completedSections]);

  const handleChangeIndex = (newIndex: number) => {
    setCurrentIndex(newIndex);
    router.push("#");
  };

  useEffect(() => {
    if (formStatusData && typeof formStatusData !== "boolean") {
      setStatus(formStatusData?.hepatitisVaccination);
    }
  }, [formStatusData]);

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
