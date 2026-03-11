"use client";

import { useState, useEffect, useCallback } from "react";
import SideNavigation from "../../SideNavigation";
import { Progress } from "@/components/ui/progress";
import { PNEUMOCOCCAL_FORM_SIDEBAR } from "@/constants";
import EmployeeInformation from "./EmployeeInformation";
import Loader from "@/components/Loader";
import VaccinationInformation from "./VaccinationInformation";
import ReviewAndSign from "./ReviewAndSign";
import { retrievePneumococcalVaccinationForm } from "@/use-cases/forms";
import { PneumococcalVaccinationForm } from "@/types/form-types/PneumococcalFormTypes";
import FormBadge from "@/components/badge/FormBadge";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { useRouter } from "next/navigation";
import { setsAreEqual } from "@/utils";
import useUser from "@/hooks/useUser";
import useCustomQuery from "@/hooks/useCustomQuery";
import useForms from "@/hooks/forms/useForms";
import FormDisabledModal from "../../FormDisabledModal";
import FormApprovedModal from "../../FormApprovedModal";
import BreadCrumb from "@/components/BreadCrumb";

type MethodState = {
  employeeInformation: "POST" | "PATCH";
  vaccinationInformation: "POST" | "PATCH";
  signature: "POST" | "PATCH";
};

const PneumococcalVaccinationFormPageWrapper = () => {
  const router = useRouter();
  const {
    data: formInfo,
    isLoading: formInfoLoading,
    refetch,
  } = useCustomQuery<PneumococcalVaccinationForm | undefined>(
    "pneumococcalForm",
    retrievePneumococcalVaccinationForm
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
    employeeInformation: "POST",
    vaccinationInformation: "POST",
    signature: "POST",
  });
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
    if (formStatusData && typeof formStatusData !== "boolean") {
      setStatus(formStatusData?.pneumococcalVaccination);
    }
  }, [formStatusData]);

  useEffect(() => {
    if (!formInfoLoading && formInfo && typeof formInfo !== "boolean") {
      const employeeInformation = formInfo.data.employeeInformation;
      const vaccinationInformation = formInfo.data.pneumococcalVaccinationForm;
      const signature = formInfo.data.signature;

      const updatedSections = new Set(completedSections);

      if (employeeInformation && Object.keys(employeeInformation).length > 0) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          employeeInformation: "PATCH",
        }));
        updatedSections.add(1);
      }

      if (
        vaccinationInformation &&
        Object.keys(vaccinationInformation).length > 0
      ) {
        setMethod((prevMethod) => ({
          ...prevMethod,
          vaccinationInformation: "PATCH",
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

  const totalSections = 3;
  const completedPercentage = Math.floor(
    (completedSections.size / totalSections) * 100
  );

  let reviewNote: string = "";

  if (typeof formInfo === "boolean") {
    reviewNote = "";
  } else {
    reviewNote =
      formInfo?.data.pneumococcalVaccinationFullForm.review_notes ?? "";
  }

  const handleDisplayedComponent = () => {
    switch (currentIndex) {
      case 1:
        return (
          <EmployeeInformation
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            handleNewCompletedSection={handleNewCompletedSection}
            user={user!}
            method={method.employeeInformation}
            formInfo={formInfo}
            refetch={refetch}
            formCompleted={completedSections.size === 3}
            status={status}
            reviewNote={reviewNote}
          />
        );
      case 2:
        return (
          <VaccinationInformation
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            handleNewCompletedSection={handleNewCompletedSection}
            user={user!}
            method={method.vaccinationInformation}
            formInfo={formInfo}
            refetch={refetch}
          />
        );
      case 3:
        return (
          <ReviewAndSign
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            handleNewCompletedSection={handleNewCompletedSection}
            method={method.signature}
            user={user!}
            formInfo={formInfo}
            refetch={refetch}
            signatureDisabled={
              !completedSections.has(1) || !completedSections.has(2)
            }
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

  if (formInfoLoading || userDataLoading || formDataLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full flex flex-col gap-5 relative">
      {status === "Awaiting Approval" && !suggestionOpen && (
        <FormDisabledModal />
      )}

      {status === "Approved" && (
        <FormApprovedModal formName="Pneumococcal Vaccination Form" />
      )}

      <div className="flex flex-col gap-5 bg-white">
        <BreadCrumb
          links={[
            {
              name: "Forms",
              route: "/onboarding/form",
            },
            {
              name: "Pneumococcal Vaccination Form",
              route: "/onboarding/form/pneumococcal-vaccination-form",
            },
          ]}
          fixed={true}
        />

        <div className="w-full flex flex-col">
          <div className="lg:fixed lg:mt-5 text-[30px] lg:z-[500] w-full xl:w-[80%] pr-10 bg-white font-[600] text-[#101828] xl:py-5 flex flex-col lg:flex-row lg:justify-between flex-wrap lg:items-center gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
              <span>Pneumococcal Vaccination Form</span>
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
          formSidebar={PNEUMOCOCCAL_FORM_SIDEBAR}
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

export default PneumococcalVaccinationFormPageWrapper;
