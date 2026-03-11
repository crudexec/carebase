"use client";

import SideNavigation from "../../SideNavigation";
import Loader from "@/components/Loader";
import { I_NINE_FORM_SIDEBAR } from "../logic/constant";
import FormBadge from "@/components/badge/FormBadge";
import FormDisabledModal from "../../FormDisabledModal";
import useWrapperLogic from "../logic/wrapper/useWrapperLogic";
import FormApprovedModal from "../../FormApprovedModal";
import BreadCrumb from "@/components/BreadCrumb";

const INinePageWrapper = () => {
  const {
    formInfoLoading,
    userDataLoading,
    formDataLoading,
    status,
    currentIndex,
    completedSections,
    handleChangeIndex,
    handleDisplayForm,
    suggestionOpen,
  } = useWrapperLogic();

  if (formInfoLoading || userDataLoading || formDataLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full flex flex-col gap-5 relative">
      {status === "Awaiting Approval" && !suggestionOpen && (
        <FormDisabledModal />
      )}

      {status === "Approved" && <FormApprovedModal formName="i - 9 Form" />}

      <div className="flex flex-col gap-5 bg-white">
        <BreadCrumb
          links={[
            {
              name: "Forms",
              route: "/onboarding/form",
            },
            {
              name: "I - 9 Form",
              route: "/onboarding/form/i9form",
            },
          ]}
          fixed={true}
        />

        <div className="w-full flex flex-col">
          <div className="lg:fixed lg:mt-5 text-[30px] lg:z-[500] w-full xl:w-[80%] pr-10 bg-white font-[600] text-[#101828] xl:py-5 flex flex-col lg:flex-row lg:justify-between flex-wrap lg:items-center gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
              <span>i - 9 Form</span>
              <FormBadge status={status}>{status}</FormBadge>
            </div>
          </div>
        </div>
      </div>

      <section className="relative w-full flex flex-col lg:flex-row lg:mt-0 xl:mt-[90px] mt-0">
        <SideNavigation
          formSidebar={I_NINE_FORM_SIDEBAR}
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

export default INinePageWrapper;
