"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChangeEvent, useState, useEffect } from "react";
import Button from "@/components/button/Button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Search } from "lucide-react";
import { TreatmentPlan } from "@/types/Events";
import ClientVisitWrapper, {
  transformVisitsToClientVisitTypes,
} from "./ClientVisitWrapper";
import ClientFormWrapper from "./ClientFormWrapper";
import { ClientTreatmentPlanTableTypes } from "./ClientFormColumns";
import { DatePickerWithRange } from "@/components/calendar/DatePickerWithRange";
import { ClientVisitTypes } from "./ClientVisitColumns";
import { useQuery } from "@tanstack/react-query";
import { VisitData } from "@/types/Visit";
import { DateRange } from "react-day-picker";
import { TreatmentPlanFormTabOptionIdType } from "../../ClientDetailPageWrapper";
import LogVisitDialog from "../../LogVisitDialog";
import {
  getAlpTabFormName,
  getTreatmentPlanFormName,
  getTreatmentPlanFormRoute,
  getTreatmentPlanFormTableName,
  getVisitQueryKey,
  getVisitRetrievalFunction,
} from "@/utils/treatmentPlanHelpers";
import Loader from "@/components/Loader";
import { formatDate } from "@/utils";
import { formatLastModified } from "@/utils/helpers";
import { formatTreatmentPlanStatus } from "@/components/clients/TreatmentPreviewModal";
import NewTreatmentPlanModal from "./NewTreatmentPlanModal";
import GoalAssessmentWrapper from "./GoalAssessmentWrapper";
import { GoalAssessmentTableTypes } from "./GoalAssessmentColumns";
import NewGoalAssessmentModal from "./NewGoalAssessmentModal";
import { IntakeType } from "@/types/IntakeForm";

interface Props {
  admin?: boolean;
  clientManager?: boolean;
  clientId: string;
  username: string;
  treatmentPlanData: TreatmentPlan | undefined;
  formTab: TreatmentPlanFormTabOptionIdType;
  isFetchingTreatmentPlan: boolean;
  refetchTreatmentPlan: any;
  user: IntakeType | undefined;
}

const AssesmentTab = ({
  admin,
  clientManager,
  clientId,
  username,
  treatmentPlanData,
  formTab,
  isFetchingTreatmentPlan,
  refetchTreatmentPlan,
  user,
}: Props) => {
  const [openModal, setOpenModal] = useState(false);
  const [openNewTreatmentPlanModal, setOpenNewTreatmentPlanModal] =
    useState(false);
  const [openNewGoalAssessmentModal, setOpenNewGoalAssessmentModal] =
    useState(false);
  const token = localStorage.getItem("token") ?? "";

  const [tab, setTab] = useState(admin ? "treatment-plan" : "visits");
  const [clientForms, setClientForms] = useState<
    ClientTreatmentPlanTableTypes[]
  >([]);
  const [goalAssessments, setGoalAssessments] = useState<
    GoalAssessmentTableTypes[]
  >([]);
  const [filteredGoalAssessments, setFilteredGoalAssessments] = useState<
    GoalAssessmentTableTypes[]
  >([]);

  useEffect(() => {
    if (
      Array.isArray(treatmentPlanData?.data?.treatmentPlans) &&
      treatmentPlanData?.data?.treatmentPlans.length > 0
    ) {
      const formattedData: ClientTreatmentPlanTableTypes[] =
        treatmentPlanData?.data?.treatmentPlans
          ?.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          ?.map((item, index) => {
            const calculateTreatmentPlanProgress = (): number => {
              const totalSections = 4;
              const completedSections = new Set();

              if (item?.basicInformation?.id) completedSections.add(1);
              if (item?.treatmentGoal[0]?.id) completedSections.add(2);
              if (item?.treatmentSchedule[0]?.id) completedSections.add(3);
              if (item?.treatmentGoalSignature?.id) completedSections.add(4);

              return Math.floor((completedSections.size / totalSections) * 100);
            };

            const formattedImplementationStartDate = item?.basicInformation
              ?.implementation_start_date
              ? new Date(
                  item.basicInformation.implementation_start_date
                ).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                })
              : "-";

            const formattedImplementationStopDate = item?.basicInformation
              ?.implementation_stop_date
              ? new Date(
                  item.basicInformation.implementation_stop_date
                ).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                })
              : "-";

            return {
              id: item.id,
              document: `${getTreatmentPlanFormTableName(formTab)} ${
                treatmentPlanData?.data?.treatmentPlans?.length - index
              } (${formattedImplementationStartDate} - ${formattedImplementationStopDate})`,
              progress: calculateTreatmentPlanProgress(),
              dateCreated: item?.created_at
                ? formatDate(new Date(item.created_at))
                : "-",
              lastModified: item?.updated_at
                ? formatLastModified(item.updated_at)
                : "-",
              route: clientManager
                ? `/client-manager/clients/${clientId}/forms/${getTreatmentPlanFormRoute(
                    formTab
                  )}?mode=edit&formId=${item.id}`
                : admin
                ? `/admin/clients/${clientId}/forms/${getTreatmentPlanFormRoute(
                    formTab
                  )}?mode=edit&formId=${item.id}`
                : `/clients/${clientId}/forms/${getTreatmentPlanFormRoute(
                    formTab
                  )}?mode=edit&formId=${item.id}`,
              formId: item.id,
              tpType: item?.basicInformation?.tp_type ?? "-",
              downloadLink: clientManager
                ? `/client-manager/clients/${clientId}/forms/${getTreatmentPlanFormRoute(
                    formTab
                  )}?mode=view&formId=${item.id}`
                : admin
                ? `/admin/clients/${clientId}/forms/${getTreatmentPlanFormRoute(
                    formTab
                  )}?mode=view&formId=${item.id}`
                : `/clients/${clientId}/forms/${getTreatmentPlanFormRoute(
                    formTab
                  )}?mode=view&formId=${item.id}`,
              admin: admin!,
              status: formatTreatmentPlanStatus(item?.status ?? "not_started"),
              treatmentData: {
                ...item,
                basicInformation: {
                  ...item.basicInformation,
                  participant_first_name:
                    item?.basicInformation?.participant_first_name ??
                    user?.first_name ??
                    "-",
                  participant_last_name:
                    item?.basicInformation?.participant_last_name ??
                    user?.last_name ??
                    "-",
                },
              },
            };
          });

      setClientForms(formattedData);
    } else {
      setClientForms([]);
    }
  }, [formTab, treatmentPlanData, admin, clientManager, clientId]);

  const [filteredData, setFilteredData] =
    useState<ClientTreatmentPlanTableTypes[]>(clientForms);

  useEffect(() => {
    setFilteredData(clientForms);
  }, [clientForms]);

  const {
    data: visitData,
    isLoading: isFetchingVisitData,
    refetch: refetchVisit,
  } = useQuery({
    queryKey: getVisitQueryKey(formTab, clientId),
    queryFn: async () => {
      const retrieveVisitsFunction = getVisitRetrievalFunction(formTab);
      return await retrieveVisitsFunction(token, clientId, formTab);
    },
  });

  const [originalVisitData, setOriginalVisitData] = useState<VisitData[]>([]);
  const [filteredVisitData, setFilteredVisitData] = useState<
    ClientVisitTypes[]
  >([]);

  useEffect(() => {
    refetchVisit();
  }, [formTab, tab, refetchVisit]);

  useEffect(() => {
    if (isFetchingVisitData) {
      setOriginalVisitData([]);
      setFilteredVisitData([]);
      return;
    }

    if (
      visitData &&
      visitData.data &&
      Array.isArray(visitData.data) &&
      visitData.data.length > 0
    ) {
      const visits: any[] = admin
        ? visitData.data.filter(
            (visit) =>
              visit.staff.role === "ADMINISTRATOR" ||
              visit.status === "completed"
          )
        : visitData.data;

      // Transform visits to ClientVisitTypes[]
      const formattedVisits = transformVisitsToClientVisitTypes(
        visits,
        admin ?? false,
        clientId,
        formTab
      );
      setOriginalVisitData(visits);
      setFilteredVisitData(formattedVisits);
    }
  }, [visitData, admin, clientId, formTab, isFetchingVisitData]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();

    const updatedFilteredData = clientForms.filter((form) =>
      form.document.toLowerCase().includes(query)
    );

    setFilteredData(updatedFilteredData);
  };

  const handleVisitSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();

    const updatedFilteredData = originalVisitData
      .map(
        (data) =>
          transformVisitsToClientVisitTypes(
            [data],
            admin ?? false,
            clientId,
            formTab
          )[0]
      )
      .filter(
        (visit) =>
          visit.staff.toLowerCase().includes(query) ||
          visit.date.toLowerCase().includes(query)
      );

    setFilteredVisitData(updatedFilteredData);
  };

  const filterVisits = (query: string, range: DateRange) => {
    const updatedFilteredData = originalVisitData
      .map(
        (data) =>
          transformVisitsToClientVisitTypes(
            [data],
            admin ?? false,
            clientId,
            formTab
          )[0]
      )
      .filter((visit) => {
        const dateOfVisit = new Date(visit.date_of_visit);
        const withinDateRange =
          (range.from ? dateOfVisit >= range.from : true) &&
          (range.to ? dateOfVisit <= range.to : true);
        return (
          (visit.staff.toLowerCase().includes(query) ||
            visit.date.toLowerCase().includes(query)) &&
          withinDateRange
        );
      });

    setFilteredVisitData(updatedFilteredData);
  };

  const filterByDateRange = (range: DateRange) => {
    if (
      !range ||
      range === undefined ||
      range === null ||
      (!range.from && !range.to)
    ) {
      const formattedVisits = transformVisitsToClientVisitTypes(
        originalVisitData,
        admin ?? false,
        clientId,
        formTab
      );
      setFilteredVisitData(formattedVisits);
      return;
    }

    // Otherwise, filter by date range
    filterVisits("", range);
  };

  // useEffect(() => {
  //   if (
  //     Array.isArray(treatmentPlanData?.data?.goalAssessments) &&
  //     treatmentPlanData?.data?.goalAssessments.length > 0
  //   ) {
  //     const formattedData: GoalAssessmentTableTypes[] =
  //       treatmentPlanData?.data?.goalAssessments
  //         ?.sort(
  //           (a, b) =>
  //             new Date(b.created_at).getTime() -
  //             new Date(a.created_at).getTime()
  //         )
  //         ?.map((item, index) => ({
  //           id: item.id,
  //           document: `Goal Assessment ${index + 1} (TP ${
  //             item.treatment_plan_id
  //           })`,
  //           treatmentPlan: `ALP TP ${item.treatment_plan_id}`,
  //           status: item.status || "draft",
  //           dateCreated: item?.created_at
  //             ? formatDate(new Date(item.created_at))
  //             : "-",
  //           lastModified: item?.updated_at
  //             ? formatLastModified(item.updated_at)
  //             : "-",
  //           route: admin
  //             ? `/admin/clients/${clientId}/goal-assessment/${item.id}`
  //             : `/clients/${clientId}/goal-assessment/${item.id}`,
  //         }));

  //     setGoalAssessments(formattedData);
  //     setFilteredGoalAssessments(formattedData);
  //   } else {
  //     setGoalAssessments([]);
  //     setFilteredGoalAssessments([]);
  //   }
  // }, [treatmentPlanData, admin, clientId]);

  const handleGoalAssessmentSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    const updatedFilteredData = goalAssessments.filter((assessment) =>
      assessment.document.toLowerCase().includes(query)
    );
    setFilteredGoalAssessments(updatedFilteredData);
  };

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full relative">
      <div className="w-full flex justify-between flex-wrap gap-3 items-center">
        {formTab === "alp" && (
          <TabsList className="md:grid w-fit md:grid-cols-4 overflow-auto flex gap-5 md:py-0 items-center">
            <div className="w-full flex justify-between flex-wrap gap-3">
              <TabsTrigger
                data-testid="intake-assessment-tab"
                value="intake-assessment"
              >
                Intake Assessment
              </TabsTrigger>
            </div>

            <div className="w-full flex justify-between flex-wrap gap-3">
              <TabsTrigger
                data-testid="goal-assessment-tab"
                value="goal-assessment"
              >
                Goal Assessment
              </TabsTrigger>
            </div>

            <div className="w-full flex justify-between flex-wrap gap-3">
              <TabsTrigger
                data-testid="treatment-plan-tab"
                value="treatment-plan"
              >
                Treatment Plans
              </TabsTrigger>
            </div>

            <TabsTrigger data-testid="visit-tab" value="visits">
              Visits
            </TabsTrigger>
          </TabsList>
        )}

        {formTab !== "alp" && (
          <TabsList className="md:grid w-fit md:grid-cols-2 overflow-auto flex gap-5 md:py-0 items-center">
            <div className="w-full flex justify-between flex-wrap gap-3">
              <TabsTrigger
                data-testid="treatment-plan-tab"
                value="treatment-plan"
              >
                Treatment Plans
              </TabsTrigger>
            </div>

            <TabsTrigger data-testid="visit-tab" value="visits">
              Visits
            </TabsTrigger>
          </TabsList>
        )}

        {tab !== "visits" && (
          <div className="w-fit flex flex-wrap gap-3">
            <div className="md:w-fit w-full relative flex items-center">
              <div className="absolute left-0 pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-[#94A3B8]" />
              </div>
              <Input
                onChange={
                  tab === "goal-assessment"
                    ? handleGoalAssessmentSearch
                    : handleSearchChange
                }
                placeholder="Search"
                className="pl-10 pr-5 border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black xl:w-[336px] outline-none focus:border-none"
              />
            </div>

            <Button
              onClick={() => {
                if (tab === "treatment-plan") {
                  setOpenNewTreatmentPlanModal(true);
                } else if (tab === "goal-assessment") {
                  setOpenNewGoalAssessmentModal(true);
                }
              }}
              className="md:w-fit w-full"
              type="button"
              data-testid={`new-${tab}-${formTab}`}
            >
              <PlusIcon className="text-white w-5 h-5" />
              New{" "}
              {tab === "treatment-plan"
                ? getTreatmentPlanFormName(formTab)
                : getAlpTabFormName(tab)}
            </Button>
          </div>
        )}

        {tab === "visits" && (
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-5">
            <div className="md:w-fit w-full relative flex items-center">
              <div className="absolute left-0 pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-[#94A3B8]" />
              </div>
              <Input
                placeholder="Search visits"
                className="pl-10 pr-5 border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black w-full lg:w-[336px] outline-none focus:border-none"
                onChange={handleVisitSearchChange}
              />
            </div>
            <DatePickerWithRange getDate={filterByDateRange} />
            <Button
              data-testid="log-new-visit-button"
              type="button"
              onClick={() => setOpenModal(true)}
            >
              <PlusIcon className="text-white w-5 h-5" />
              Log New Visit
            </Button>
          </div>
        )}
      </div>

      <LogVisitDialog
        openModal={openModal}
        closeModal={() => setOpenModal(false)}
        username={username}
        clientId={clientId}
        admin={admin}
        clientManager={clientManager}
        formType={formTab}
      />

      <NewTreatmentPlanModal
        open={openNewTreatmentPlanModal}
        onClose={() => setOpenNewTreatmentPlanModal(false)}
        clientId={clientId}
        formTab={formTab}
        admin={admin}
        refetchTreatmentPlan={refetchTreatmentPlan}
        username={username}
      />

      <NewGoalAssessmentModal
        open={openNewGoalAssessmentModal}
        onClose={() => setOpenNewGoalAssessmentModal(false)}
        clientId={clientId}
        formTab={formTab}
        admin={admin}
        refetchTreatmentPlan={refetchTreatmentPlan}
        username={username}
      />

      <TabsContent value="intake-assessment">
        <ClientVisitWrapper
          username={username}
          admin={admin}
          filteredVisitData={filteredVisitData}
          isFetchingVisitData={isFetchingVisitData}
          originalVisitData={originalVisitData}
          formType={formTab}
        />
      </TabsContent>

      <TabsContent value="goal-assessment">
        <GoalAssessmentWrapper
          admin={admin}
          treatmentPlanData={treatmentPlanData}
          filteredData={filteredGoalAssessments}
          formType={formTab}
        />
      </TabsContent>

      <TabsContent value="visits">
        <ClientVisitWrapper
          username={username}
          admin={admin}
          filteredVisitData={filteredVisitData}
          isFetchingVisitData={isFetchingVisitData}
          originalVisitData={originalVisitData}
          formType={formTab}
        />
      </TabsContent>

      {isFetchingTreatmentPlan ? (
        <Loader height="h-[50px]" />
      ) : (
        <TabsContent value="treatment-plan">
          <ClientFormWrapper
            treatmentPlanData={treatmentPlanData}
            admin={admin}
            filteredData={filteredData}
            formType={formTab}
          />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default AssesmentTab;
