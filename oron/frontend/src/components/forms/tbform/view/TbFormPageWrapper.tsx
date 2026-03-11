"use client";

import { useState, useEffect, useCallback } from "react";
import SideNavigation from "../../SideNavigation";
import { Progress } from "@/components/ui/progress";
import { TB_FORM_SIDEBAR } from "@/constants";
import RiskAssessment from "./RiskAssessment";
import FormBadge from "@/components/badge/FormBadge";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { retrieveTBForm } from "@/use-cases/forms";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import ReviewAndSign from "./ReviewAndSign";
import { TBFormResponse } from "@/types/form-types/TBFormTypes";
import { setsAreEqual } from "@/utils";
import useCustomQuery from "@/hooks/useCustomQuery";
import useForms from "@/hooks/forms/useForms";
import FormDisabledModal from "../../FormDisabledModal";
import FormApprovedModal from "../../FormApprovedModal";
import BreadCrumb from "@/components/BreadCrumb";

type MethodState = {
  riskAssesment: "POST" | "PATCH";
  signature: "POST" | "PATCH";
};

const TuberculosisFormPageWrapper = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );
  const {
    data: formInfo,
    isLoading: formInfoLoading,
    refetch,
  } = useCustomQuery<TBFormResponse | undefined>("tbForm", retrieveTBForm);
  const {
    data: formData,
    isLoading: formDataLoading,
    refetch: refetchFormStatus,
  } = useForms();

  const formStatusData = formData?.status;

  const [status, setStatus] = useState<FormattedFormStatus>("Not Filled");
  const [method, setMethod] = useState<MethodState>({
    riskAssesment: "POST",
    signature: "POST",
  });
  const [suggestionOpen, setSuggestionOpen] = useState(false);

  const handleToggleSuggestion = (status: boolean) => {
    setSuggestionOpen(status);
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
      const riskAssessment =
        formInfo.data.tuberculosisMantouxRiskAssessmentForm;
      const signature = formInfo.data.tuberculosisSignatureForm;

      const updatedSections = new Set(completedSections);

      if (riskAssessment && Object.keys(riskAssessment).length > 0) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          riskAssesment: "PATCH",
        }));
        updatedSections.add(1);
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

  const totalSections = 2;
  const completedPercentage = Math.floor(
    (completedSections.size / totalSections) * 100
  );

  useEffect(() => {
    if (formStatusData && typeof formStatusData !== "boolean") {
      setStatus(formStatusData?.tbForm);
    }
  }, [formStatusData]);

  let reviewNote: string = "";
  if (typeof formInfo !== "boolean") {
    reviewNote = formInfo?.data?.tuberculosisFullForm?.review_notes ?? "";
  }

  const handleDisplayedComponent = () => {
    switch (currentIndex) {
      case 1:
        return (
          <RiskAssessment
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            handleNewCompletedSection={handleNewCompletedSection}
            method={method.riskAssesment}
            refetch={refetch}
            data={formInfo}
            status={status}
            reviewNote={reviewNote}
          />
        );
      case 2:
        return (
          <ReviewAndSign
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            handleNewCompletedSection={handleNewCompletedSection}
            data={formInfo}
            method={method.signature}
            refetch={refetch}
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

  if (formDataLoading || formInfoLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full flex flex-col gap-5 relative">
      {status === "Awaiting Approval" && !suggestionOpen && (
        <FormDisabledModal />
      )}

      {status === "Approved" && (
        <FormApprovedModal formName="Tuberculosis Screening Form" />
      )}

      <div className="flex flex-col gap-5 max-h-[12vh]">
        <BreadCrumb
          links={[
            {
              name: "Forms",
              route: "/onboarding/form",
            },
            {
              name: "Tuberculosis Screening",
              route: "/onboarding/form/tbform",
            },
          ]}
          fixed={true}
        />

        <div className="w-full flex flex-col">
          <div className="lg:fixed lg:mt-5 text-[30px] lg:z-[500] w-full xl:w-[80%] pr-10 bg-white font-[600] text-[#101828] xl:py-5 flex flex-col lg:flex-row lg:justify-between flex-wrap lg:items-center gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
              <span>Tuberculosis Screening</span>
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

      <section className="relative w-full flex flex-col lg:flex-row lg:mt-0 xl:mt-[90px] mt-[100px]">
        <SideNavigation
          formSidebar={TB_FORM_SIDEBAR}
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          completedSections={completedSections}
        />
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-5 lg:ml-[250px]">
            {handleDisplayedComponent()}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TuberculosisFormPageWrapper;
