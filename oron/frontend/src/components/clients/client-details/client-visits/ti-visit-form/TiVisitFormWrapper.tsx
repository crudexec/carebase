"use client";

import SideNavigation from "@/components/forms/SideNavigation";
import { Progress } from "@/components/ui/progress";
import BreadCrumb from "@/components/BreadCrumb";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { retrieveClientById } from "@/use-cases/clients";
import { capitalizeFirstLetter, formatDate } from "@/utils";
import { useCallback, useState, useEffect } from "react";
import { TI_STEP_ONE_SIDEBAR, TI_STEP_TWO_SIDEBAR } from "./constant";
import Loader from "@/components/Loader";
import TIVisitSessionHighlights from "./TIVisitSessionHighlights";
import TIVisitTransportationType from "./TIVisitTransportationType";
import TIVisitConcernsAndChallenges from "./TIVisitConcernsAndChallenges";
import TIVisitSelfManagement from "./TIVisitSelfManagement";
import TIVisitBehaviourManagement from "./TIVisitBehaviourManagement";
import TIVisitCommunication from "./TIVisitCommunication";
import TIVisitSnackMealTime from "./TIVisitSnackMealTime";
import TIVisitTaskEngagement from "./TIVisitTaskEngagement";
import TIVisitPlayLeisure from "./TIVisitPlayLeisure";
import TIVisitPersonalWorkReading from "./TIVisitPersonalWorkReading";
import TIVisitPersonalCare from "./TIVisitPersonalCare";
import TIVisitSensoryNeeds from "./TIVisitSensoryNeeds";
import TIVisitSocialization from "./TIVisitSocialization";
import TIVisitSafetySkills from "./TIVisitSafetySkills";
import TIVisitUtilizationOfMoney from "./TIVisitUtilizationOfMoney";
import TIVisitGoals from "./TIVisitGoals";
import { retrieveSingleRespiteForm } from "@/use-cases/respite";

interface Props {
  clientId: string;
  formId: string;
  admin?: boolean;
}

const TiVisitFormWrapper = ({ clientId, formId, admin = false }: Props) => {
  const router = useRouter();
  const token = localStorage.getItem("token") as string;

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

  const {
    data: visitData,
    isLoading: visitLoading,
    refetch: refetchVisit,
  } = useQuery({
    queryKey: ["tiVisit", formId],
    queryFn: async () => await retrieveSingleRespiteForm(token, formId),
  });

  const user = data?.data[0];
  const firstName =
    user?.clientInformation?.first_name ?? user?.first_name ?? "";
  const lastName = user?.clientInformation?.last_name ?? user?.last_name ?? "";
  const username = capitalizeFirstLetter(
    `${firstName?.toLowerCase()} ${lastName?.toLowerCase()}`
  );

  const dateOfVisit = visitData?.data?.date_of_visit;
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

  useEffect(() => {
    refetchVisit();
  }, [currentIndex]);

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
        return TI_STEP_ONE_SIDEBAR;
      case 2:
        return TI_STEP_TWO_SIDEBAR;
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
    if (!visitData?.data) return;

    const data = visitData.data;
    const isSectionCompleted = (step: number, section: number) =>
      setCompletedSections((prevSections) => ({
        ...prevSections,
        [step]: new Set(prevSections[step]).add(section),
      }));

    // Check each section for completion
    if (data.sessionHighlights) isSectionCompleted(1, 1);
    if (data.transportationTypeAndObjectives) isSectionCompleted(1, 2);
    if (data.concernAndChallenges) isSectionCompleted(1, 3);
    if (data.selfManagement) isSectionCompleted(1, 4);
    if (data.behaviorManagement?.length > 0) isSectionCompleted(1, 5);
    if (data.communication) isSectionCompleted(1, 6);
    if (data.snackMealTime) isSectionCompleted(2, 1);

    if (data.playLeisure) isSectionCompleted(2, 3);
    if (data.personalWorkReading) isSectionCompleted(2, 4);
    if (data.personalCareAndBladderControl) isSectionCompleted(2, 5);
    if (data.sensoryNeedAndMotorDevelopment) isSectionCompleted(2, 6);
    if (data.socialization) isSectionCompleted(2, 7);
    if (data.safetyAndSurvivalSkills) isSectionCompleted(2, 8);
    if (data.utilizationOfMoney) isSectionCompleted(2, 9);
  }, [visitData, handleNewCompletedSection]);

  const handleDisplayForm = () => {
    if (currentStep === 1) {
      switch (currentIndex) {
        case 1:
          return (
            <TIVisitSessionHighlights
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
            />
          );
        case 2:
          return (
            <TIVisitTransportationType
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
            />
          );
        case 3:
          return (
            <TIVisitConcernsAndChallenges
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
            />
          );
        case 4:
          return (
            <TIVisitSelfManagement
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
            />
          );
        case 5:
          return (
            <TIVisitBehaviourManagement
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
            />
          );
        case 6:
          return (
            <TIVisitCommunication
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
              handleChangeStep={handleChangeStep}
            />
          );
        default:
          return null;
      }
    } else if (currentStep === 2) {
      switch (currentIndex) {
        case 1:
          return (
            <TIVisitSnackMealTime
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
            />
          );
        case 2:
          return (
            <TIVisitTaskEngagement
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
            />
          );
        case 3:
          return (
            <TIVisitPlayLeisure
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
            />
          );
        case 4:
          return (
            <TIVisitPersonalWorkReading
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
            />
          );
        case 5:
          return (
            <TIVisitPersonalCare
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
            />
          );
        case 6:
          return (
            <TIVisitSensoryNeeds
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
            />
          );
        case 7:
          return (
            <TIVisitSocialization
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
            />
          );
        case 8:
          return (
            <TIVisitSafetySkills
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
            />
          );
        case 9:
          return (
            <TIVisitUtilizationOfMoney
              handleNewCompletedSection={handleNewCompletedSection}
              currentIndex={currentIndex}
              handleChangeIndex={handleChangeIndex}
              tiForm={visitData?.data}
              isViewing={false}
              username={username}
              handleChangeStep={handleChangeStep}
            />
          );
        default:
          return null;
      }
    } else if (currentStep === 3) {
      return (
        <TIVisitGoals
          handleNewCompletedSection={handleNewCompletedSection}
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          tiForm={visitData?.data}
          clientId={clientId}
          admin={admin}
          isViewing={false}
          username={username}
        />
      );
    } else {
      return null;
    }
  };

  if (isLoading || visitLoading) {
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
              name: "TI Assesment",
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
            <div className="flex flex-col gap-1">
              <span data-testid="fc-visit-header">
                {formattedDateOfSession}
              </span>
              <p className="text-[16px] font-[400] text-[#475569]">
                {`${visitData?.data?.start_time} - ${visitData?.data?.end_time}`}
              </p>
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

      <ul className="xl:fixed xl:z-[4000] bg-white flex-1 max-w-[90vw] lg:max-w-[65vw] xl:max-w-full xl:w-full overflow-auto border-b-[1px] border-[#EAECF0] h-[5vh] lg:mt-0 xl:mt-[110px] mt-0 xl:pl-[270px]">
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

      <section className="w-full flex flex-col lg:flex-row xl:mt-32 mt-0">
        {currentStep !== 3 && (
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
            currentStep !== 3 && "lg:ml-[270px]"
          } flex-1 mt-10`}
        >
          {handleDisplayForm()}
        </div>
      </section>
    </div>
  );
};

export default TiVisitFormWrapper;
