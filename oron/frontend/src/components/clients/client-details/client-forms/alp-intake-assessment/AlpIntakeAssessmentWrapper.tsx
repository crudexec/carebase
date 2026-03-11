"use client";

import SideNavigation from "@/components/forms/SideNavigation";
import { Progress } from "@/components/ui/progress";
import { ALP_INTAKE_ASSESSMENT_SIDEBAR } from "./constant";
import Loader from "@/components/Loader";
import BreadCrumb from "@/components/BreadCrumb";
import { useQuery } from "@tanstack/react-query";
import { retrieveClientById } from "@/use-cases/clients";
import { capitalizeFirstLetter } from "@/utils";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import AlpIntakeAssessmentIntroduction from "./AlpIntakeAssessmentIntroduction";
import AlpIntakeAssessmentSelfAdvocacy from "./AlpIntakeAssessmentSelfAdvocacy";
import AlpIntakeAssessmentSelfDirections from "./AlpIntakeAssessmentSelfDirections";
import AlpIntakeAssessmentCommunication from "./AlpIntakeAssessmentCommunication";
import AlpIntakeAssessmentHomeLiving from "./AlpIntakeAssessmentHomeLiving";

interface Props {
  clientId: string;
  formId: string | null;
  admin?: boolean;
}

const AlpIntakeAssessmentWrapper = ({ clientId, formId, admin }: Props) => {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );

  const token = localStorage.getItem("token") as string;
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

  const TOTAL_SECTIONS = 5;
  const completedPercentage = Math.floor(
    (completedSections.size / TOTAL_SECTIONS) * 100
  );

  const handleChangeIndex = (newIndex: number) => {
    setCurrentIndex(newIndex);
    router.push("#");
  };

  const handleNewCompletedSection = useCallback((newSection: number) => {
    setCompletedSections((prevSections) => {
      const uniqueSections = new Set(prevSections);
      uniqueSections.add(newSection);
      return uniqueSections;
    });
    router.push("#");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDisplayForm = () => {
    switch (currentIndex) {
      case 1:
        return (
          <AlpIntakeAssessmentIntroduction
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            isViewing={false}
            isEditing={true}
            username={username}
          />
        );
      case 2:
        return (
          <AlpIntakeAssessmentSelfAdvocacy
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            isViewing={false}
            isEditing={true}
          />
        );
      case 3:
        return (
          <AlpIntakeAssessmentSelfDirections
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            isViewing={false}
            isEditing={true}
          />
        );
      case 4:
        return (
          <AlpIntakeAssessmentCommunication
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            isViewing={false}
            isEditing={true}
          />
        );
      case 5:
        return (
          <AlpIntakeAssessmentHomeLiving
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            isViewing={false}
            isEditing={true}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
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
              name: "ALP Assessment",
              route: "#",
            },
            {
              name: "Initial Intake Assessment",
              route: admin
                ? `/admin/clients/${clientId}/forms/alp-intake-assessment`
                : `/clients/${clientId}/forms/alp-intake-assessment`,
            },
          ]}
          fixed={true}
        />

        <div className="w-full flex flex-col">
          <div className="lg:fixed lg:mt-5 text-[30px] lg:z-[500] w-full xl:w-[80%] pr-10 bg-white font-[600] text-[#101828] xl:py-5 flex flex-col lg:flex-row lg:justify-between flex-wrap lg:items-center gap-5">
            <span data-testid="intake-assessment-header">
              ALP Initial Intake Assessment
            </span>

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

      <section className="relative w-full flex flex-col lg:flex-row lg:mt-0 xl:mt-[60px] mt-0">
        <SideNavigation
          formSidebar={ALP_INTAKE_ASSESSMENT_SIDEBAR}
          currentIndex={currentIndex}
          handleChangeIndex={handleChangeIndex}
          completedSections={completedSections}
        />
        <div className="flex flex-col gap-5 lg:ml-[250px] flex-1">
          {handleDisplayForm()}
        </div>
      </section>
    </div>
  );
};

export default AlpIntakeAssessmentWrapper;
