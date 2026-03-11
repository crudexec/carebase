"use client";

import SideNavigation from "@/components/forms/SideNavigation";
import { Progress } from "@/components/ui/progress";
import { getAlpVisitRoute, ALP_VISIT_SIDEBAR } from "./constant";
import Loader from "@/components/Loader";
import BreadCrumb from "@/components/BreadCrumb";
import { useQuery } from "@tanstack/react-query";
import { retrieveClientById } from "@/use-cases/clients";
import { capitalizeFirstLetter, formatDate } from "@/utils";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AlpVisitSessionAttendance from "./AlpVisitSessionAttendance";
import AlpVisitSignature from "./AlpVisitSignature";
import AlpVisitAssessment from "./AlpVisitAssessment";

interface Props {
  clientId: string;
  formId: string;
  visitType: "first" | "second";
  admin?: boolean;
}

const AlpVisitWrapper = ({
  clientId,
  formId,
  visitType,
  admin = false,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");

  const [currentIndex, setCurrentIndex] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );

  const token = localStorage.getItem("token") as string;
  const { data, isLoading } = useQuery({
    queryKey: ["clientDetail", clientId],
    queryFn: async () => await retrieveClientById(token, clientId),
    retry: false,
  });

  const user = data?.data[0];
  const firstName =
    user?.clientInformation?.first_name ?? user?.first_name ?? "";
  const lastName = user?.clientInformation?.last_name ?? user?.last_name ?? "";

  const username = capitalizeFirstLetter(
    `${firstName?.toLowerCase()} ${lastName?.toLowerCase()}`
  );

  const formattedDateOfSession = `${formatDate(new Date())}`;

  const TOTAL_SECTIONS = ALP_VISIT_SIDEBAR.length;
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
          <AlpVisitSessionAttendance
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            alpForm={{}}
            isViewing={false}
            username={username}
            visitType={visitType}
          />
        );
      case 2:
        return (
          <AlpVisitAssessment
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            alpForm={{}}
            isViewing={false}
            username={username}
            visitType={visitType}
          />
        );
      case 3:
        return (
          <AlpVisitSignature
            handleNewCompletedSection={handleNewCompletedSection}
            currentIndex={currentIndex}
            handleChangeIndex={handleChangeIndex}
            alpForm={{}}
            isViewing={false}
            username={username}
            visitType={visitType}
            clientId={clientId}
            admin={admin}
            formattedDateOfSession={formattedDateOfSession}
          />
        );

      default:
        return null;
    }
  };

  // if (isLoading) {
  //   return <Loader height="h-[80vh]" />;
  // }

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
              name: "ALP Assesment",
              route: admin
                ? `/admin/clients/${clientId}/visits/${getAlpVisitRoute(
                    visitType
                  )}?formId=${formId}`
                : `/clients/${clientId}/forms/${getAlpVisitRoute(
                    visitType
                  )}?formId=${formId}`,
            },
            {
              name: formattedDateOfSession,
              route: admin
                ? `/admin/clients/${clientId}/visits/${getAlpVisitRoute(
                    visitType
                  )}?formId=${formId}`
                : `/clients/${clientId}/forms/${getAlpVisitRoute(
                    visitType
                  )}?formId=${formId}`,
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
                {"11:00am - 01:30pm"}
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

      <section className="relative w-full flex flex-col lg:flex-row lg:mt-0 xl:mt-32 mt-0">
        <SideNavigation
          formSidebar={ALP_VISIT_SIDEBAR}
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

export default AlpVisitWrapper;
