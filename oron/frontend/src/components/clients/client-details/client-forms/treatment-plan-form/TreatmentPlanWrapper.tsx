"use client";

import SideNavigation from "@/components/forms/SideNavigation";
import { Progress } from "@/components/ui/progress";
import { getTreatmentPlanFormSidebar } from "./constant";
import Loader from "@/components/Loader";
import BreadCrumb from "@/components/BreadCrumb";
import { useQuery } from "@tanstack/react-query";
import {
  retrieveClientById,
  retrieveClientTreatmentPlan,
} from "@/use-cases/clients";
import { capitalizeFirstLetter } from "@/utils";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BasicInformation from "./BasicInformation";
import Signature from "./Signature";
import Schedule from "./Schedule";
import Goals from "./Goals";
import {
  getTreatmentPlanQueryKey,
  getTreatmentPlanFormName,
  getTreatmentPlanFormRoute,
  getTreatmentPlanFormTableName,
} from "@/utils/treatmentPlanHelpers";
import AlpSkills from "./alp-skills/AlpSkills";
import AdditionalInformation from "./AdditionalInformation";

export type TreatmentPlanType = "iiss" | "fc" | "ti" | "alp";

interface Props {
  clientId: string;
  formType: TreatmentPlanType;
  formId: string;
  admin?: boolean;
}

const TreatmentPlanWrapper = ({ clientId, formType, formId, admin }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");

  const [currentIndex, setCurrentIndex] = useState(1);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );

  const {
    data: treatmentPlanData,
    isLoading: isFetchingTreatmentPlan,
    refetch: refetchTreatmentPlan,
  } = useQuery({
    queryKey: getTreatmentPlanQueryKey(formType, clientId),
    queryFn: async () =>
      await retrieveClientTreatmentPlan(token, clientId, formType),
    staleTime: 0,
    retry: false,
  });

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

  const TOTAL_SECTIONS = getTreatmentPlanFormSidebar(formType).length;
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

  useEffect(() => {
    refetchTreatmentPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  useEffect(() => {
    if (!treatmentPlanData) return;

    const treatmentPlanArray = treatmentPlanData.data.treatmentPlans;
    const data = treatmentPlanArray.find((item) => item.id === formId)!;

    const {
      basicInformation,
      treatmentGoal,
      treatmentSchedule,
      treatmentGoalSignature,
    } = data;

    const isSectionCompleted = (section: number) =>
      handleNewCompletedSection(section);

    if (basicInformation) isSectionCompleted(1);
    if (treatmentGoal?.length > 0) isSectionCompleted(2);
    if (treatmentSchedule?.[0]) isSectionCompleted(3);
    if (
      treatmentGoalSignature &&
      Object.keys(treatmentGoalSignature).length > 0
    )
      isSectionCompleted(4);

    const hasCompletedTreatmentPlan =
      basicInformation &&
      treatmentSchedule?.[0] &&
      treatmentGoal?.length > 0 &&
      treatmentGoalSignature;

    if (hasCompletedTreatmentPlan && action === "send_treatment_plan") {
      setCurrentIndex(4);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treatmentPlanData, action]);

  const handleDisplayForm = () => {
    switch (formType) {
      case "alp":
        switch (currentIndex) {
          case 1:
            return (
              <BasicInformation
                handleNewCompletedSection={handleNewCompletedSection}
                currentIndex={currentIndex}
                handleChangeIndex={handleChangeIndex}
                user={user}
                treatmentPlanData={treatmentPlanData}
                username={username}
                clientId={clientId}
                formType={formType}
                formId={formId}
                refetchTreatmentPlan={refetchTreatmentPlan}
              />
            );
          case 2:
            return (
              <AlpSkills
                handleNewCompletedSection={handleNewCompletedSection}
                currentIndex={currentIndex}
                handleChangeIndex={handleChangeIndex}
                user={user}
                treatmentPlanData={treatmentPlanData}
                username={username}
                clientId={clientId}
                formType={formType}
                formId={formId}
                refetchTreatmentPlan={refetchTreatmentPlan}
              />
            );
          case 3:
            return (
              <AdditionalInformation
                handleNewCompletedSection={handleNewCompletedSection}
                currentIndex={currentIndex}
                handleChangeIndex={handleChangeIndex}
                user={user}
                treatmentPlanData={treatmentPlanData}
                username={username}
                clientId={clientId}
                formType={formType}
                formId={formId}
                refetchTreatmentPlan={refetchTreatmentPlan}
              />
            );
          case 4:
            return (
              <Schedule
                handleNewCompletedSection={handleNewCompletedSection}
                currentIndex={currentIndex}
                handleChangeIndex={handleChangeIndex}
                treatmentPlanData={treatmentPlanData}
                clientId={clientId}
                refetchTreatmentPlan={refetchTreatmentPlan}
                formType={formType}
                formId={formId}
              />
            );
          case 5:
            return (
              <Signature
                handleNewCompletedSection={handleNewCompletedSection}
                currentIndex={currentIndex}
                handleChangeIndex={handleChangeIndex}
                treatmentPlanData={treatmentPlanData}
                clientId={clientId}
                refetchTreatmentPlan={refetchTreatmentPlan}
                username={username}
                formType={formType}
                formId={formId}
              />
            );

          default:
            return null;
        }

      default:
        switch (currentIndex) {
          case 1:
            return (
              <BasicInformation
                handleNewCompletedSection={handleNewCompletedSection}
                currentIndex={currentIndex}
                handleChangeIndex={handleChangeIndex}
                user={user}
                treatmentPlanData={treatmentPlanData}
                username={username}
                clientId={clientId}
                formType={formType}
                formId={formId}
                refetchTreatmentPlan={refetchTreatmentPlan}
              />
            );
          case 2:
            return (
              <Goals
                handleNewCompletedSection={handleNewCompletedSection}
                currentIndex={currentIndex}
                handleChangeIndex={handleChangeIndex}
                treatmentPlanData={treatmentPlanData}
                clientId={clientId}
                formType={formType}
                username={username}
                refetchTreatmentPlan={refetchTreatmentPlan}
                formId={formId}
              />
            );
          case 3:
            return (
              <Schedule
                handleNewCompletedSection={handleNewCompletedSection}
                currentIndex={currentIndex}
                handleChangeIndex={handleChangeIndex}
                treatmentPlanData={treatmentPlanData}
                clientId={clientId}
                refetchTreatmentPlan={refetchTreatmentPlan}
                formType={formType}
                formId={formId}
              />
            );
          case 4:
            return (
              <Signature
                handleNewCompletedSection={handleNewCompletedSection}
                currentIndex={currentIndex}
                handleChangeIndex={handleChangeIndex}
                treatmentPlanData={treatmentPlanData}
                clientId={clientId}
                refetchTreatmentPlan={refetchTreatmentPlan}
                username={username}
                formType={formType}
                formId={formId}
              />
            );

          default:
            return null;
        }
    }
  };

  if (isLoading || isFetchingTreatmentPlan) {
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
              name: getTreatmentPlanFormName(formType),
              route: admin
                ? `/admin/clients/${clientId}/forms/${getTreatmentPlanFormRoute(
                    formType
                  )}?formId=${formId}`
                : `/clients/${clientId}/forms/${getTreatmentPlanFormRoute(
                    formType
                  )}?formId=${formId}`,
            },
          ]}
          fixed={true}
        />

        <div className="w-full flex flex-col">
          <div className="lg:fixed lg:mt-5 text-[30px] lg:z-[500] w-full xl:w-[80%] pr-10 bg-white font-[600] text-[#101828] xl:py-5 flex flex-col lg:flex-row lg:justify-between flex-wrap lg:items-center gap-5">
            <span data-testid="treatment-plan-header">
              {`${getTreatmentPlanFormTableName(formType)} ${
                (treatmentPlanData?.data?.treatmentPlans?.length ?? 0) -
                (treatmentPlanData?.data?.treatmentPlans?.findIndex(
                  (plan) => plan.id === formId
                ) ?? 0)
              } (${
                treatmentPlanData?.data?.treatmentPlans?.find(
                  (plan) => plan.id === formId
                )?.basicInformation?.implementation_start_date
                  ? new Date(
                      treatmentPlanData.data.treatmentPlans.find(
                        (plan) => plan.id === formId
                      )!.basicInformation.implementation_start_date
                    ).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : "-"
              } - ${
                treatmentPlanData?.data?.treatmentPlans?.find(
                  (plan) => plan.id === formId
                )?.basicInformation?.implementation_stop_date
                  ? new Date(
                      treatmentPlanData.data.treatmentPlans.find(
                        (plan) => plan.id === formId
                      )!.basicInformation.implementation_stop_date
                    ).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : "-"
              })`}
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
          formSidebar={getTreatmentPlanFormSidebar(formType)}
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

export default TreatmentPlanWrapper;
