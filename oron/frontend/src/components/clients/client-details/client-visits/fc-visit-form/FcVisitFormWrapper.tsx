"use client";

import SideNavigation from "@/components/forms/SideNavigation";
import { Progress } from "@/components/ui/progress";
import BreadCrumb from "@/components/BreadCrumb";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  retrieveClientById,
  retrieveClientSingleFcVisitForm,
} from "@/use-cases/clients";
import { capitalizeFirstLetter, formatDate } from "@/utils";
import { useCallback, useState, useEffect } from "react";
import { FC_STEP_ONE_SIDEBAR, FC_STEP_THREE_SIDEBAR } from "./constant";
import Loader from "@/components/Loader";
import FcSessionHighlights from "./FcSessionHighlights";
import FcFamilyDiscussion from "./FcFamilyDiscussion";
import FcOtherTrainings from "./FcOtherTrainings";
import FcSignature from "./FcSignature";
import FcGoals from "./FcGoals";

interface Props {
  clientId: string;
  formId: string;
  admin?: boolean;
}

const FcVisitFormWrapper = ({ clientId, formId, admin = false }: Props) => {
  const router = useRouter();
  const token = localStorage.getItem("token") as string;

  const {
    data: visitForms,
    isLoading: isFetchingVisitForms,
    refetch: refetchVisitForms,
  } = useQuery({
    queryKey: ["fcVisitForm", formId],
    queryFn: async () => retrieveClientSingleFcVisitForm(token, formId),
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [completedSections, setCompletedSections] = useState<{
    [key: number]: Set<number>;
  }>({
    1: new Set(),
    2: new Set(),
    3: new Set(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["clientDetail", clientId],
    queryFn: async () => await retrieveClientById(token, clientId),
  });

  const user = data?.data[0];
  const firstName =
    user?.clientInformation?.first_name ?? user?.first_name ?? "";
  const lastName = user?.clientInformation?.last_name ?? user?.last_name ?? "";
  const username = capitalizeFirstLetter(
    `${firstName?.toLowerCase()} ${lastName?.toLowerCase()}`
  );

  const dateOfVisit = visitForms?.data?.date_of_visit;
  const formattedDateOfSession = `${formatDate(dateOfVisit!)}`;

  const totalSections = 5;
  const totalCompleted = Object.values(completedSections).reduce(
    (acc, sections) => acc + sections.size,
    0
  );
  const completedPercentage = Math.floor(
    (totalCompleted / totalSections) * 100
  );

  const handleChangeStep = (newStep: number) => {
    setCurrentStep(newStep);
    setCurrentIndex(1);
    router.push("#");
  };

  const handleChangeIndex = (newIndex: number) => {
    setCurrentIndex(newIndex);
    router.push("#");
  };

  const handleShowSidebarForms = (): {
    id: number;
    name: string;
  }[] => {
    switch (currentStep) {
      case 1:
        return FC_STEP_ONE_SIDEBAR;
      case 3:
        return FC_STEP_THREE_SIDEBAR;
      default:
        return [];
    }
  };

  const handleNewCompletedSection = useCallback(
    (newSection: number) => {
      setCompletedSections((prevSections) => ({
        ...prevSections,
        [currentStep]: new Set(prevSections[currentStep]).add(newSection),
      }));

      router.push("#");
    },
    [currentStep, router]
  );

  useEffect(() => {
    refetchVisitForms();
  }, [currentIndex, currentStep, refetchVisitForms]);

  useEffect(() => {
    if (!visitForms) return;

    const { data } = visitForms;
    const {
      sessionHighlights,
      familyDiscussion,
      visitGoals,
      otherTraining,
      treatmentPlanSignature,
    } = data;

    const isSectionCompleted = (step: number, section: number) =>
      setCompletedSections((prevSections) => ({
        ...prevSections,
        [step]: new Set(prevSections[step]).add(section),
      }));

    if (sessionHighlights && Object.keys(sessionHighlights)?.length > 0)
      isSectionCompleted(1, 1);
    if (familyDiscussion && Object.keys(familyDiscussion)?.length > 0)
      isSectionCompleted(1, 2);
    if (visitGoals && Array.isArray(visitGoals) && visitGoals?.length > 0)
      isSectionCompleted(2, 1);
    if (otherTraining && Object.keys(otherTraining)?.length > 0)
      isSectionCompleted(3, 1);
    if (
      treatmentPlanSignature &&
      Object.keys(treatmentPlanSignature)?.length > 0
    )
      isSectionCompleted(3, 2);
  }, [visitForms]);

  const handleDisplayForm = () => {
    if (currentStep === 1) {
      switch (currentIndex) {
        case 1:
          return (
            <FcSessionHighlights
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              formId={formId}
              visitForms={visitForms}
            />
          );
        case 2:
          return (
            <FcFamilyDiscussion
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              username={username}
              handleChangeStep={handleChangeStep}
              formId={formId}
              visitForms={visitForms}
            />
          );
        default:
          return null;
      }
    } else if (currentStep === 2) {
      return (
        <FcGoals
          handleNewCompletedSection={handleNewCompletedSection}
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          username={username}
          handleChangeStep={handleChangeStep}
          formId={formId}
          visitForms={visitForms}
          clientId={clientId}
        />
      );
    } else if (currentStep === 3) {
      switch (currentIndex) {
        case 1:
          return (
            <FcOtherTrainings
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              handleChangeStep={handleChangeStep}
              formId={formId}
              visitForms={visitForms}
            />
          );
        case 2:
          return (
            <FcSignature
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              username={username}
              formId={formId}
              visitForms={visitForms}
              clientId={clientId}
              admin={admin}
              formattedDateOfSession={formattedDateOfSession}
            />
          );
        default:
          return null;
      }
    } else {
      return null;
    }
  };

  if (isLoading || isFetchingVisitForms) {
    return <Loader height="h-[80vh]" />;
  }

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        <BreadCrumb
          links={[
            { name: "Clients", route: admin ? "/admin/clients" : "/clients" },
            {
              name: username,
              route: admin
                ? `/admin/clients/${clientId}`
                : `/clients/${clientId}`,
            },
            {
              name: "FC Assesment",
              route: admin
                ? `/admin/clients/${clientId}/visits/fc-visit?formId=${formId}`
                : `/clients/${clientId}/visits/fc-visit?formId=${formId}`,
            },
            {
              name: formattedDateOfSession,
              route: admin
                ? `/admin/clients/${clientId}/visits/fc-visit?formId=${formId}`
                : `/clients/${clientId}/visits/fc-visit?formId=${formId}`,
            },
          ]}
          fixed={true}
        />

        <div className="w-full flex flex-col">
          <div className="lg:fixed lg:mt-5 text-[30px] lg:z-[500] w-full xl:w-[80%] pr-10 bg-white font-[600] text-[#101828] xl:py-5 flex flex-col lg:flex-row lg:justify-between flex-wrap lg:items-center gap-5">
            <span data-testid="fc-visit-header">{formattedDateOfSession}</span>

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

      <ul className="xl:fixed xl:z-[4000] bg-white flex-1 max-w-[90vw] lg:max-w-[65vw] xl:max-w-full xl:w-full overflow-auto border-b-[1px] border-[#EAECF0] h-[5vh] lg:mt-0 xl:mt-[100px] mt-0 xl:pl-[270px]">
        <div className="w-full xl:w-[700px] flex lg:space-x-20 items-center">
          <button
            onClick={() => handleChangeStep(1)}
            className={`mt-auto text-[16px] font-[600] w-full sm:w-[30%] md:w-full lg:w-[250px] xl:w-full ${
              currentStep === 1 && "border-b-2 border-[#2563EB] text-[#2563EB]"
            } ${currentStep !== 1 && "text-[#667085]"} `}
          >
            Step 1
          </button>
          <button
            onClick={() => handleChangeStep(2)}
            className={`mt-auto text-[16px] font-[600] w-full sm:w-[30%] md:w-full lg:w-[250px] xl:w-full ${
              currentStep === 2 && "border-b-2 border-[#2563EB] text-[#2563EB]"
            } ${currentStep !== 2 && "text-[#667085]"}`}
          >
            Step 2
          </button>
          <button
            onClick={() => handleChangeStep(3)}
            className={`mt-auto text-[16px] font-[600] w-full sm:w-[30%] md:w-full lg:w-[250px] xl:w-full ${
              currentStep === 3 && "border-b-2 border-[#2563EB] text-[#2563EB]"
            } ${currentStep !== 3 && "text-[#667085]"}`}
          >
            Step 3
          </button>
        </div>
      </ul>

      <section className="w-full flex flex-col lg:flex-row xl:mt-28 mt-0">
        {currentStep !== 2 && (
          <SideNavigation
            formSidebar={handleShowSidebarForms()}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            completedSections={completedSections[currentStep]}
            visitForm={true}
          />
        )}
        <div
          className={`flex flex-col gap-5 ${
            currentStep !== 2 && "lg:ml-[270px]"
          } flex-1 mt-10`}
        >
          {handleDisplayForm()}
        </div>
      </section>
    </div>
  );
};

export default FcVisitFormWrapper;
