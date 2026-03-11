"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import SideNavigation from "@/components/forms/SideNavigation";
import { RESPIRE_FORM_SIDEBAR } from "./constant";
import BreadCrumb from "@/components/BreadCrumb";
import { useQuery } from "@tanstack/react-query";
import { retrieveClientById } from "@/use-cases/clients";
import { capitalizeFirstLetter } from "@/utils";
import Loader from "@/components/Loader";
import RespiteSessionHighlights from "./RespiteSessionHighlights";
import RespiteConcernsAndChallenges from "./RespiteConcernsAndChallenges";
import RespiteSelfManagement from "./RespiteSelfManagement";
import RespiteBehaviourManagement from "./RespiteBehaviourManagement";
import RespiteCommunication from "./RespiteCommunication";
import RespiteSnackMealTime from "./RespiteSnackMealTime";
import RespiteDomesticSkillTraining from "./RespiteDomesticSkillTraining";
import RespitePlayLeisure from "./RespitePlayLeisure";
import RespitePersonalWorkReading from "./RespitePersonalWorkReading";
import RespitePersonalCare from "./RespitePersonalCare";
import RespiteSensoryNeeds from "./RespiteSensoryNeeds";
import RespiteSocialization from "./RespiteSocialization";
import RespiteSafetySurvivalSkills from "./RespiteSafetySurvivalSkills";
import RespiteUtilizationOfMoney from "./RespiteUtilizationOfMoney";
import { retrieveSingleRespiteForm } from "@/use-cases/respite";
import { SingleRespiteForm } from "@/types/Respite";

interface RespiteFormWrapperProps {
  formId: string;
  admin?: boolean;
  clientId: string;
}

const RespiteFormWrapper = ({
  formId,
  admin,
  clientId,
}: RespiteFormWrapperProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isViewing = mode === "view";
  const isEditing = mode === "edit";

  const [currentIndex, setCurrentIndex] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );

  const token = localStorage.getItem("token") as string;
  const { data: clientData, isLoading: clientLoading } = useQuery({
    queryKey: ["clientDetail", clientId],
    queryFn: async () => await retrieveClientById(token, clientId),
  });

  const {
    data: respiteData,
    isLoading: respiteLoading,
    refetch: refetchRespiteData,
  } = useQuery({
    queryKey: ["respiteForm", formId],
    queryFn: async () => await retrieveSingleRespiteForm(token, formId),
  });

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

  const TOTAL_SECTIONS = RESPIRE_FORM_SIDEBAR.length;
  const completedPercentage = Math.floor(
    (completedSections.size / TOTAL_SECTIONS) * 100
  );

  useEffect(() => {
    refetchRespiteData();
  }, [currentIndex]);

  useEffect(() => {
    if (!respiteData?.data) return;

    const data = respiteData.data;
    const isSectionCompleted = (section: number) =>
      handleNewCompletedSection(section);

    // Check each section for completion
    if (data.sessionHighlights) isSectionCompleted(1);
    if (data.concernAndChallenges) isSectionCompleted(2);
    if (data.selfManagement) isSectionCompleted(3);
    if (data.behaviorManagement?.length > 0) isSectionCompleted(4);
    if (data.communication) isSectionCompleted(5);
    if (data.snackMealTime) isSectionCompleted(6);
    if (data.domesticSkillTraining) isSectionCompleted(7);
    if (data.playLeisure) isSectionCompleted(8);
    if (data.personalWorkReading) isSectionCompleted(9);
    if (data.personalCareAndBladderControl) isSectionCompleted(10);
    if (data.sensoryNeedAndMotorDevelopment) isSectionCompleted(11);
    if (data.socialization) isSectionCompleted(12);
    if (data.safetyAndSurvivalSkills) isSectionCompleted(13);
    if (data.utilizationOfMoney) isSectionCompleted(14);
  }, [respiteData, handleNewCompletedSection]);

  const handleDisplayComponent = () => {
    switch (currentIndex) {
      case 1:
        return (
          <RespiteSessionHighlights
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            respiteForm={respiteData?.data}
            isViewing={isViewing}
            isEditing={isEditing}
            username={username}
          />
        );
      case 2:
        return (
          <RespiteConcernsAndChallenges
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            respiteForm={respiteData?.data}
            isViewing={isViewing}
            isEditing={isEditing}
            username={username}
          />
        );
      case 3:
        return (
          <RespiteSelfManagement
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            respiteForm={respiteData?.data}
            isViewing={isViewing}
            isEditing={isEditing}
            username={username}
          />
        );
      case 4:
        return (
          <RespiteBehaviourManagement
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            respiteForm={respiteData?.data}
            isViewing={isViewing}
            isEditing={isEditing}
            username={username}
            refetchRespiteData={refetchRespiteData}
          />
        );
      case 5:
        return (
          <RespiteCommunication
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            respiteForm={respiteData?.data}
            isViewing={isViewing}
            isEditing={isEditing}
            username={username}
          />
        );
      case 6:
        return (
          <RespiteSnackMealTime
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            respiteForm={respiteData?.data}
            isViewing={isViewing}
            isEditing={isEditing}
            username={username}
          />
        );
      case 7:
        return (
          <RespiteDomesticSkillTraining
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            respiteForm={respiteData?.data}
            isViewing={isViewing}
            isEditing={isEditing}
            username={username}
          />
        );
      case 8:
        return (
          <RespitePlayLeisure
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            respiteForm={respiteData?.data}
            isViewing={isViewing}
            isEditing={isEditing}
            username={username}
          />
        );
      case 9:
        return (
          <RespitePersonalWorkReading
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            respiteForm={respiteData?.data}
            isViewing={isViewing}
            isEditing={isEditing}
            username={username}
          />
        );
      case 10:
        return (
          <RespitePersonalCare
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            respiteForm={respiteData?.data}
            isViewing={isViewing}
            isEditing={isEditing}
            username={username}
          />
        );
      case 11:
        return (
          <RespiteSensoryNeeds
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            respiteForm={respiteData?.data}
            isViewing={isViewing}
            isEditing={isEditing}
            username={username}
          />
        );
      case 12:
        return (
          <RespiteSocialization
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            respiteForm={respiteData?.data}
            isViewing={isViewing}
            isEditing={isEditing}
            username={username}
          />
        );
      case 13:
        return (
          <RespiteSafetySurvivalSkills
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            respiteForm={respiteData?.data}
            isViewing={isViewing}
            isEditing={isEditing}
            username={username}
          />
        );
      case 14:
        return (
          <RespiteUtilizationOfMoney
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            respiteForm={respiteData?.data}
            clientId={clientId}
            isViewing={isViewing}
            isEditing={isEditing}
            username={username}
          />
        );
      default:
        return null;
    }
  };

  const user = clientData?.data[0];
  const firstName =
    user?.clientInformation?.first_name ?? user?.first_name ?? "";
  const lastName = user?.clientInformation?.last_name ?? user?.last_name ?? "";
  const username = capitalizeFirstLetter(
    `${firstName?.toLowerCase()} ${lastName?.toLowerCase()}`
  );

  if (clientLoading || respiteLoading) {
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
              name: "Respite Form",
              route: admin
                ? `/admin/clients/${clientId}/forms/respite?mode=${mode}&formId=${formId}`
                : `/clients/${clientId}/forms/respite?mode=${mode}&formId=${formId}`,
            },
          ]}
          fixed={true}
        />

        <div className="w-full flex flex-col">
          <div className="lg:fixed lg:mt-5 text-[30px] lg:z-[500] w-full xl:w-[80%] pr-10 bg-white font-[600] text-[#101828] xl:py-5 flex flex-col lg:flex-row lg:justify-between flex-wrap lg:items-center gap-5">
            <div className="flex items-center gap-3">
              <span>Respite</span>
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

      <section className="w-full flex flex-col lg:flex-row xl:mt-20 mt-0">
        <SideNavigation
          formSidebar={RESPIRE_FORM_SIDEBAR}
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          completedSections={completedSections}
        />
        <div className="flex flex-col gap-5 lg:ml-[250px] flex-1 mt-10">
          {handleDisplayComponent()}
        </div>
      </section>
    </div>
  );
};

export default RespiteFormWrapper;
