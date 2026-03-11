"use client";

import { useState, useEffect, useCallback } from "react";
import SideNavigation from "../../SideNavigation";
import { Progress } from "@/components/ui/progress";
import Loader from "@/components/Loader";
import { MMR_FORM_SIDEBAR } from "@/constants";
import Attestation from "./Attestation";
import Information from "./Information";
import Signature from "./Signature";
import { retrieveVaricellaVaccineAttestationForm } from "@/use-cases/forms";
import FormBadge from "@/components/badge/FormBadge";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { useRouter } from "next/navigation";
import { VaricellaResponse } from "@/types/form-types/VaricellaFormTypes";
import { setsAreEqual } from "@/utils";
import useUser from "@/hooks/useUser";
import useCustomQuery from "@/hooks/useCustomQuery";
import useForms from "@/hooks/forms/useForms";
import FormDisabledModal from "../../FormDisabledModal";
import ReviewAndSign from "./ReviewAndSign";
import FormApprovedModal from "../../FormApprovedModal";
import BreadCrumb from "@/components/BreadCrumb";

type MethodState = {
  attestation: "POST" | "PATCH";
  information: "POST" | "PATCH";
  signature: "POST" | "PATCH";
};

const VaricellaVaccineAttestationFormPageWrapper = () => {
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
  } = useCustomQuery<VaricellaResponse | undefined>(
    "varicellaForm",
    retrieveVaricellaVaccineAttestationForm
  );
  const [status, setStatus] = useState<FormattedFormStatus>("Not Filled");
  const [currentIndex, setCurrentIndex] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );
  const [suggestionOpen, setSuggestionOpen] = useState(false);

  const handleToggleSuggestion = (status: boolean) => {
    setSuggestionOpen(status);
  };

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
      const attestation = formInfo.data.varicellaAttestationForm;
      const information = formInfo.data.varicellaEmployeeInformation;
      const signature = formInfo.data.varicellaSignatureForm;

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

  const totalSections = 2;
  const completedPercentage = Math.floor(
    (completedSections.size / totalSections) * 100
  );

  useEffect(() => {
    if (formStatusData && typeof formStatusData !== "boolean") {
      setStatus(formStatusData?.varicellaVaccine);
    }
  }, [formStatusData]);

  let reviewNote: string;
  if (typeof formInfo === "boolean") {
    reviewNote = "";
  } else {
    reviewNote = formInfo?.data.varicellaFullForm.review_notes ?? "";
  }

  const handleDisplayedComponent = () => {
    switch (currentIndex) {
      case 1:
        return (
          <Attestation
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            handleNewCompletedSection={handleNewCompletedSection}
            refetch={refetch}
            method={method.attestation}
            data={formInfo}
            formCompleted={completedSections.size === 2}
            status={status}
            reviewNote={reviewNote}
            user={user!}
            informationMethod={method.information}
          />
        );
      case 2:
        return (
          <ReviewAndSign
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            handleNewCompletedSection={handleNewCompletedSection}
            user={user!}
            refetch={refetch}
            method={method.signature}
            data={formInfo}
            signatureDisabled={!completedSections.has(1)}
            status={status}
            refetchFormStatus={refetchFormStatus}
            suggestionOpen={suggestionOpen}
            handleToggleSuggestion={handleToggleSuggestion}
          />
        );

      default:
        return null;
    }
  };

  if (userDataLoading || formDataLoading || formInfoLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full flex flex-col gap-5 relative">
      {status === "Awaiting Approval" && !suggestionOpen && (
        <FormDisabledModal />
      )}

      {status === "Approved" && (
        <FormApprovedModal formName="Varicella Vaccine Attestation Form" />
      )}

      <div className="flex flex-col gap-5 bg-white">
        <BreadCrumb
          links={[
            {
              name: "Forms",
              route: "/onboarding/form",
            },
            {
              name: "Varicella Vaccine Attestation",
              route: "/onboarding/form/varicella-vaccine-attestation-form",
            },
          ]}
          fixed={true}
        />

        <div className="w-full flex flex-col">
          <div className="lg:fixed lg:mt-5 text-[30px] lg:z-[500] w-full xl:w-[80%] pr-10 bg-white font-[600] text-[#101828] xl:py-5 flex flex-col lg:flex-row lg:justify-between flex-wrap lg:items-center gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
              <span>Varicella Vaccine Attestation</span>{" "}
              <FormBadge status={status}>{status}</FormBadge>
            </div>

            <div className="hidden xl:flex mr-[10px] gap-5 w-[300px] items-center">
              <Progress
                className="w-full lg:w-[280px] xl:z-40"
                value={completedPercentage}
              />
              <p className="text-[14px] text-[#334155] font-[500] z-40">
                {completedPercentage}%
              </p>
            </div>
          </div>

          <div className="flex gap-5 w-full lg:w-[300px] items-center lg:mt-28 xl:hidden mt-10 ml-auto">
            <Progress
              className="w-full lg:w-[280px] xl:z-40"
              value={completedPercentage}
            />
            <p className="text-[14px] text-[#334155] font-[500] z-40">
              {completedPercentage}%
            </p>
          </div>
        </div>
      </div>

      <section className="relative w-full flex flex-col lg:flex-row lg:mt-0 xl:mt-[90px] mt-0">
        <SideNavigation
          formSidebar={MMR_FORM_SIDEBAR}
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          completedSections={completedSections}
        />
        <div className="flex flex-col gap-5 lg:ml-[250px] flex-1">
          {handleDisplayedComponent()}
        </div>
      </section>
    </div>
  );
};

export default VaricellaVaccineAttestationFormPageWrapper;
