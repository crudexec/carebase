"use client";

import SideNavigation from "../../SideNavigation";
import { Progress } from "@/components/ui/progress";
import Loader from "@/components/Loader";
import { HEPATITIS_ATTESTATION_FORM_SIDEBAR } from "../logic/constant";
import FormBadge from "@/components/badge/FormBadge";
import FormDisabledModal from "../../FormDisabledModal";
import useWrapperLogic from "../logic/wrapper/useWrapperLogic";
import FormApprovedModal from "../../FormApprovedModal";
import BreadCrumb from "@/components/BreadCrumb";

const HepatitisVaccineAttestationPageWrapper = () => {
  const {
    formInfoLoading,
    userDataLoading,
    formDataLoading,
    status,
    currentIndex,
    completedSections,
    handleChangeIndex,
    completedPercentage,
    handleDisplayForm,
    suggestionOpen,
  } = useWrapperLogic();

  if (userDataLoading || formDataLoading || formInfoLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full flex flex-col gap-5 relative">
      {status === "Awaiting Approval" && !suggestionOpen && (
        <FormDisabledModal />
      )}

      {status === "Approved" && (
        <FormApprovedModal formName="Hepatitis B Vaccination Attestation Form" />
      )}

      <div className="flex flex-col gap-5 bg-white">
        <BreadCrumb
          links={[
            {
              name: "Forms",
              route: "/onboarding/form",
            },
            {
              name: "Hepatitis B Vaccination Attestation",
              route: "/onboarding/form/hepatitis-vaccine-attestation-form",
            },
          ]}
          fixed={true}
        />

        <div className="w-full flex flex-col">
          <div className="lg:fixed lg:mt-5 text-[30px] lg:z-[500] w-full xl:w-[80%] pr-10 bg-white font-[600] text-[#101828] xl:py-5 flex flex-col lg:flex-row lg:justify-between flex-wrap lg:items-center gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
              <span>Hepatitis B Vaccination Attestation</span>
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
          formSidebar={HEPATITIS_ATTESTATION_FORM_SIDEBAR}
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          completedSections={completedSections}
        />
        <div className="flex flex-col gap-5 lg:ml-[250px] flex-1">
          {handleDisplayForm}
        </div>
      </section>
    </div>
  );
};

export default HepatitisVaccineAttestationPageWrapper;
