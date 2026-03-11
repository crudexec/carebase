"use client";

import SideNavigation from "@/components/forms/SideNavigation";
import { Progress } from "@/components/ui/progress";
import useWrapperLogic from "../logic/wrapper/useWrapperLogic";
import Loader from "@/components/Loader";
import { formatDate } from "@/utils";
import { useEffect } from "react";
import { useVisitingFormContext } from "../store/visiting-form-context";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  retrieveClientById,
  retrieveClientSingleIISSVisitForm,
} from "@/use-cases/clients";
import { FullIntakeType } from "@/types/IntakeForm";
import { REDUCER_ACTION_TYPE } from "../store/reducer";
import BreadCrumb from "@/components/BreadCrumb";
import VisitApprovalActions from "./VisitApprovalActions";

interface Props {
  dateOfSession?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  formId: string;
  admin?: boolean;
}

const VisitFormPageWrapper = ({ formId, admin = false }: Props) => {
  const router = useRouter();
  const {
    params,
    username,
    currentIndex,
    completedPercentage,
    completedSections,
    handleChangeIndex,
    currentStep,
    handleChangeStep,
    handleShowSidebarForms,
    handleDisplayForm,
    isLoading,
    retrivedVisitDraft,
  } = useWrapperLogic(admin);

  const { state } = useVisitingFormContext();
  const { clientId } = useParams<{ clientId: string }>();
  const token = localStorage.getItem("token") ?? "";

  const {
    data,
    isLoading: clientLoading,
    refetch,
  } = useQuery<FullIntakeType>({
    queryKey: ["clientDetail", clientId],
    queryFn: async () => await retrieveClientById(token, clientId),
    enabled: !!clientId && clientId.length > 0,
  });
  const {
    data: visitData,
    isLoading: visitDataLoading,
    isError,
  } = useQuery({
    queryKey: ["clientVisitForm", formId],
    queryFn: async () => await retrieveClientSingleIISSVisitForm(token, formId),
    enabled: !!formId && formId?.length > 0,
  });

  const dateOfVisit = visitData?.data?.date_of_visit;

  const { dispatch } = useVisitingFormContext();

  const formattedDateOfSession = `${formatDate(dateOfVisit!)}`;

  useEffect(() => {
    retrivedVisitDraft();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({
      type: REDUCER_ACTION_TYPE.SET_USER,
      payload: {
        user: data?.data[0],
      },
    });
  }, [data]);

  if (isLoading || visitDataLoading) {
    return <Loader height="h-[80vh]" />;
  }

  if (isError) {
    router.push(
      admin
        ? `/admin/clients/${params.clientId}`
        : `/clients/${params.clientId}`
    );
  }

  const visitStatus = visitData?.data?.status;

  return (
    <>
      <div className="w-full flex flex-col gap-5 pb-32">
        <div className="flex flex-col gap-5">
          <BreadCrumb
            links={[
            { name: "Clients", route: admin ? "/admin/clients" : "/clients" },
            {
              name: username,
              route: admin
                ? `/admin/clients/${params.clientId}`
                : `/clients/${params.clientId}`,
            },
            {
              name: formattedDateOfSession,
              route: admin
                ? `/admin/clients/${params.clientId}/visits/iiss-visit?formId=${formId}`
                : `/clients/${params.clientId}/visits/iiss-visit?formId=${formId}`,
            },
            ]}
            fixed={true}
          />

        <div className="w-full flex flex-col">
          <div className="lg:fixed lg:mt-5 text-[30px] lg:z-[500] w-full xl:w-[80%] pr-10 bg-white font-[600] text-[#101828] xl:py-5 flex flex-col lg:flex-row lg:justify-between flex-wrap lg:items-center gap-5">
            <span data-testid="iiss-visit-header">
              {formattedDateOfSession}
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
          {handleDisplayForm}
        </div>
      </section>
      </div>

      {/* Admin Approval Actions - Only show for admins */}
      {admin && visitStatus && formId && (
        <VisitApprovalActions
          visitId={formId}
          visitStatus={visitStatus}
          clientId={clientId}
        />
      )}
    </>
  );
};

export default VisitFormPageWrapper;
