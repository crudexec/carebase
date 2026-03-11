"use client";

import Button from "@/components/button/Button";
import { capitalizeFirstLetter, formatDate } from "@/utils";
import { PlusIcon, X } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import ClientProfileCard from "./ClientProfileCard";
import { useQuery } from "@tanstack/react-query";
import { FullIntakeType } from "@/types/IntakeForm";
import {
  retrieveClientById,
  retrieveClientTreatmentPlan,
  retrieveAllClientIISSVisitsById,
  retrieveAllClientFcVisitsById,
} from "@/use-cases/clients";
import Loader from "@/components/Loader";
import { formatClientStatus } from "../ClientsPageWrapper";
import { useEffect, useState } from "react";
import LogVisitDialog from "./LogVisitDialog";
import {
  GLOBAL_REDUCER_ACTION_TYPE,
  useGlobalState,
} from "@/context/global-state";
import { format } from "date-fns";
import BreadCrumb from "@/components/BreadCrumb";
import FormsTab from "./client-tabs/forms-tab/FormsTab";
import DocumentsTab from "./client-tabs/DocumentsTab";
import AssesmentTab from "./client-tabs/assessment-tab/AssesmentTab";
import { getTreatmentPlanQueryKey } from "@/utils/treatmentPlanHelpers";
import RespiteTab from "./client-tabs/respite-tab/RespiteTab";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button as UIButton } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import {
  useAvailableStaff,
  useAssignStaff,
  useUnassignStaff,
} from "@/hooks/useClientStaffAssignment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type TreatmentPlanFormTabOptionIdType =
  | "forms"
  | "iiss"
  | "fc"
  | "ti"
  | "alp"
  | "documents"
  | "respite";
export type TreatmentPlanFormTabOptionType = {
  id: TreatmentPlanFormTabOptionIdType;
  name: string;
};

export const TREATMENT_PAN_FORMS_TAB_OPTIONS: TreatmentPlanFormTabOptionType[] =
  [
    {
      id: "forms",
      name: "Forms",
    },
    {
      id: "iiss",
      name: "IISS Assessment",
    },
    {
      id: "fc",
      name: "FC Assessment",
    },
    {
      id: "ti",
      name: "TI Assessment",
    },
    // {
    //   id: "alp",
    //   name: "ALP Assessment",
    // },
    {
      id: "respite",
      name: "Respite",
    },
    {
      id: "documents",
      name: "Documents",
    },
  ];

const parseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export const getNextVisit = (
  visits: {
    date_of_visit: string;
    status: string;
    deleted_at?: string | null;
  }[]
): {
  date_of_visit: string;
  status: string;
  deleted_at?: string | null;
} | null => {
  if (!visits || visits.length === 0) return null;

  const today = new Date();

  const futureVisits = visits
    .filter(
      (visit) =>
        new Date(visit.date_of_visit) > today &&
        visit.status === "completed" &&
        !visit.deleted_at
    )
    .sort(
      (a, b) =>
        new Date(a.date_of_visit).getTime() -
        new Date(b.date_of_visit).getTime()
    );

  return futureVisits.length > 0 ? futureVisits[0] : null;
};

export const getLastVisit = (
  visits: {
    date_of_visit: string;
    status: string;
    deleted_at?: string | null;
  }[]
): {
  date_of_visit: string;
  status: string;
  deleted_at?: string | null;
} | null => {
  if (!visits || visits.length === 0) return null;

  const today = new Date();

  const pastVisits = visits
    .filter(
      (visit) =>
        new Date(visit.date_of_visit) < today &&
        visit.status === "completed" &&
        !visit.deleted_at
    )
    .sort(
      (a, b) =>
        new Date(b.date_of_visit).getTime() -
        new Date(a.date_of_visit).getTime()
    );

  return pastVisits.length > 0 ? pastVisits[0] : null;
};

const ClientDetailPageWrapper = ({ admin, clientManager }: { admin?: boolean; clientManager?: boolean }) => {
  const searchParams = useSearchParams();

  const searchParamsTab = searchParams.get("tab");
  const searchParamsAction = searchParams.get("action");

  const [formTab, setFormTab] =
    useState<TreatmentPlanFormTabOptionIdType>("forms");

  const router = useRouter();
  const { clientId } = useParams<{ clientId: string }>();
  const [openModal, setOpenModal] = useState(false);
  const [showAssignStaffModal, setShowAssignStaffModal] = useState(false);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [assignNotes, setAssignNotes] = useState("");
  const [staffToUnassign, setStaffToUnassign] = useState<{ id: string; name: string } | null>(null);

  const { toast } = useToast();
  const { data: availableStaff = [], isLoading: loadingAvailable } = useAvailableStaff(clientId);
  const { mutate: assignStaff, isPending: isAssigning } = useAssignStaff(clientId);
  const { mutate: unassignStaff, isPending: isUnassigning } = useUnassignStaff(clientId);

  const token = localStorage.getItem("token") as string;
  const { data, isLoading, refetch } = useQuery<FullIntakeType>({
    queryKey: ["clientDetail", clientId],
    queryFn: async () => await retrieveClientById(token, clientId),
    enabled: !!clientId && clientId.length > 0,
  });
  const { data: visitData, refetch: refetchVisit } = useQuery({
    queryKey: ["iissVisitData", clientId],
    queryFn: async () => await retrieveAllClientIISSVisitsById(token, clientId),
  });
  const { data: fcVisitData, refetch: refetchFcVisit } = useQuery({
    queryKey: ["fcVisitData", clientId],
    queryFn: async () => await retrieveAllClientFcVisitsById(token, clientId),
  });

  const {
    data: treatmentPlanData,
    isLoading: isFetchingTreatmentPlan,
    refetch: refetchTreatmentPlan,
  } = useQuery({
    queryKey: getTreatmentPlanQueryKey(formTab, clientId),
    queryFn: async () =>
      await retrieveClientTreatmentPlan(token, clientId, formTab),
    refetchInterval: 300000,
    enabled: ["iiss", "fc", "ti", "alp"].includes(formTab),
  });

  useEffect(() => {
    refetchVisit();
    refetchTreatmentPlan();
    refetchFcVisit();
  }, [formTab, refetchVisit, refetchTreatmentPlan, refetchFcVisit]);

  useEffect(() => {
    if (searchParamsTab) {
      setFormTab(searchParamsTab as TreatmentPlanFormTabOptionIdType);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("tab");

      const newUrl = `${window.location.pathname}?${params.toString()}`;

      router.replace(newUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsTab]);

  const user = data?.data[0];

  const firstName =
    user?.clientInformation?.first_name ?? user?.first_name ?? "";
  const lastName = user?.clientInformation?.last_name ?? user?.last_name ?? "";

  const username = capitalizeFirstLetter(
    `${firstName?.toLowerCase()} ${lastName?.toLowerCase()}`
  );

  const nextVisit = getNextVisit(
    [
      ...(Array.isArray(visitData?.data) ? visitData.data : []),
      ...(Array.isArray(fcVisitData?.data) ? fcVisitData.data : []),
    ].map(({ date_of_visit, status, deleted_at }) => ({
      date_of_visit,
      status,
      deleted_at,
    }))
  );

  const lastVisit = getLastVisit(
    [
      ...(Array.isArray(visitData?.data) ? visitData.data : []),
      ...(Array.isArray(fcVisitData?.data) ? fcVisitData.data : []),
    ].map(({ date_of_visit, status, deleted_at }) => ({
      date_of_visit,
      status,
      deleted_at,
    }))
  );

  const { dispatch } = useGlobalState();

  const loadTreatmentPlan = async () => {
    // try {
    //   if (treatmentPlanData) {
    //     const resData = treatmentPlanData?.data;
    //     if (resData.basicInformation && resData?.treatmentGoal?.length > 0) {
    //       const presetData = {
    //         basicInformation: {
    //           ...resData.basicInformation,
    //           implementation_start_date: resData?.basicInformation
    //             ?.implementation_start_date
    //             ? format(
    //                 new Date(
    //                   resData.basicInformation.implementation_start_date
    //                 ),
    //                 "MM/dd/yyyy"
    //               )
    //             : "",
    //           implementation_stop_date: resData?.basicInformation
    //             ?.implementation_stop_date
    //             ? format(
    //                 new Date(
    //                   resData.basicInformation?.implementation_stop_date
    //                 ),
    //                 "MM/dd/yyyy"
    //               )
    //             : "",
    //         },
    //         goals: resData?.treatmentGoal?.toSorted(
    //           (a, b) =>
    //             new Date(a.created_at).getTime() -
    //             new Date(b.created_at).getTime()
    //         ),
    //         treatmentGoalSignature: resData?.treatmentGoalSignature,
    //         schedule:
    //           resData?.treatmentSchedule &&
    //           resData?.treatmentSchedule[0] &&
    //           resData.treatmentSchedule[0].time_slot,
    //         status: resData.status,
    //         parent_name: resData?.parent_name,
    //         parent_email: resData?.parent_email,
    //         parent_email_sent: resData?.parent_email_sent,
    //         relation_to_participant: resData?.relation_to_participant,
    //         id: resData?.id,
    //       };
    //       dispatch({
    //         type: GLOBAL_REDUCER_ACTION_TYPE.TREATMENT_PLAN,
    //         payload: presetData,
    //       });
    //     } else {
    //       dispatch({
    //         type: GLOBAL_REDUCER_ACTION_TYPE.TREATMENT_PLAN,
    //         payload: {},
    //       });
    //     }
    //   }
    // } catch (error) {
    //   console.error("ERROR Retrieving Treatment Goal", error);
    // }
  };

  useEffect(() => {
    loadTreatmentPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, treatmentPlanData]);

  useEffect(() => {
    if (searchParamsAction == "log_visit") {
      setOpenModal(true);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");

      const newUrl = `${window.location.pathname}?${params.toString()}`;

      router.replace(newUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsAction]);

  const handleAssignStaff = () => {
    if (selectedStaffIds.length === 0) {
      toast({
        variant: "destructive",
        description: "Please select at least one staff member",
      });
      return;
    }

    assignStaff(
      { staffIds: selectedStaffIds, notes: assignNotes },
      {
        onSuccess: () => {
          toast({
            variant: "success",
            description: "Staff assigned successfully",
          });
          setShowAssignStaffModal(false);
          setSelectedStaffIds([]);
          setAssignNotes("");
          refetch(); // Refetch client data to update the profile card
        },
        onError: () => {
          toast({
            variant: "destructive",
            description: "Failed to assign staff. Please try again.",
          });
        },
      }
    );
  };

  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleUnassignStaffClick = (staffId: string, staffName: string) => {
    setStaffToUnassign({ id: staffId, name: staffName });
    setShowUnassignDialog(true);
  };

  const handleConfirmUnassign = () => {
    if (!staffToUnassign) return;

    unassignStaff(
      { staffId: staffToUnassign.id, notes: "" },
      {
        onSuccess: () => {
          toast({
            variant: "success",
            description: `${staffToUnassign.name} has been removed from this client`,
          });
          setShowUnassignDialog(false);
          setStaffToUnassign(null);
          refetch(); // Refetch client data to update the profile card
        },
        onError: () => {
          toast({
            variant: "destructive",
            description: "Failed to remove staff. Please try again.",
          });
        },
      }
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&display=swap');

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      <section className="w-full flex flex-col gap-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <BreadCrumb
            links={[
              { name: "Clients", route: clientManager ? "/client-manager/clients" : admin ? "/admin/clients" : "/clients" },
              {
                name: username,
                route: clientManager
                  ? `/client-manager/clients/${clientId}`
                  : admin
                  ? `/admin/clients/${clientId}`
                  : `/clients/${clientId}`,
              },
            ]}
          />
        </div>

        <div className="w-full flex flex-col lg:flex-row flex-wrap gap-8 justify-between items-start lg:items-center" style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both' }}>
          <div className="flex flex-col gap-2.5">
            <h1 className="text-[42px] lg:text-[48px] font-[600] text-[#101828] tracking-[-0.03em] leading-[1.1]" style={{ fontFamily: "'Fraunces', serif" }}>
              {username}
            </h1>
            <p className="text-[15px] text-[#667085] font-[500] tracking-wide">
              Client Profile & Case Management
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="group relative px-7 py-3.5 bg-[#1A48AD] hover:bg-[#153a8f] text-white rounded-xl font-[700] text-[15px] transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_12px_rgba(26,72,173,0.15)] hover:shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(26,72,173,0.25)] flex items-center gap-3 overflow-hidden tracking-wide"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100" style={{ animation: 'shimmer 1.5s infinite' }} />
            <PlusIcon className="w-5 h-5 relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">Log New Visit</span>
          </button>
        </div>

      <LogVisitDialog
        openModal={openModal}
        closeModal={() => setOpenModal(false)}
        username={username}
        clientId={clientId}
        admin={admin}
        clientManager={clientManager}
        isGenericDialog={true}
      />

      <div style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both' }}>
        <ClientProfileCard
          admin={admin}
          isClientManager={clientManager}
          name={username}
          status={formatClientStatus(user?.status ?? "")}
          intakeDate={formatDate(
            user?.created_at ? new Date(user?.created_at) : new Date()
          )}
          lastVisit={
            lastVisit?.date_of_visit
              ? formatDate(new Date(lastVisit?.date_of_visit))
              : "-"
          }
          nextVisit={
            nextVisit?.date_of_visit
              ? formatDate(new Date(nextVisit?.date_of_visit))
              : "-"
          }
          location={
            user?.clientInformation?.address_or_street ??
            ` ${user?.clientInformation?.state ?? ""}, ${
              user?.clientInformation?.country ?? ""
            }`
          }
          serviceType="-"
          intakeId={clientId}
          profilePicture={user?.profile_picture!}
          refetch={refetch}
          onAssignStaffClick={() => setShowAssignStaffModal(true)}
          onUnassignStaffClick={handleUnassignStaffClick}
        />
      </div>

      {/* Assign Staff Modal */}
      <Dialog open={showAssignStaffModal} onOpenChange={setShowAssignStaffModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-[700] text-[#101828]">
              Assign Staff to Client
            </DialogTitle>
            <DialogDescription className="text-[14px] text-[#667085]">
              Select staff members to assign to this client
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Available Staff Grid */}
            <div>
              <h3 className="text-[15px] font-[600] text-[#101828] mb-3">
                Available Staff
              </h3>
              {loadingAvailable ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : availableStaff.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableStaff.map((staff) => (
                    <button
                      key={staff.id}
                      onClick={() => toggleStaffSelection(staff.id)}
                      className={`border rounded-lg p-4 text-left transition-all ${
                        selectedStaffIds.includes(staff.id)
                          ? "border-[#1A48AD] bg-[#F0F9FF] ring-2 ring-[#1A48AD]/20"
                          : "border-[#E5E7EB] hover:border-[#1A48AD]/50 hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {staff.profile_picture ? (
                          <Image
                            src={staff.profile_picture}
                            width={40}
                            height={40}
                            alt={staff.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A48AD] to-[#2563EB] flex items-center justify-center">
                            <span className="text-[16px] font-[700] text-white">
                              {staff.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-[600] text-[#101828] truncate">
                            {staff.name}
                          </p>
                          <p className="text-[13px] text-[#667085] truncate">
                            {staff.email}
                          </p>
                        </div>
                        {selectedStaffIds.includes(staff.id) && (
                          <div className="w-6 h-6 rounded-full bg-[#1A48AD] flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-[14px] font-[500]">
                    No available staff to assign
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[14px] font-[600] text-[#101828] mb-2">
                Notes (Optional)
              </label>
              <Textarea
                placeholder="Add any notes about this assignment..."
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Selected Count */}
            {selectedStaffIds.length > 0 && (
              <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-lg p-3">
                <p className="text-[14px] font-[600] text-[#075985]">
                  {selectedStaffIds.length} staff member
                  {selectedStaffIds.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <UIButton
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAssignStaffModal(false);
                  setSelectedStaffIds([]);
                  setAssignNotes("");
                }}
                disabled={isAssigning}
              >
                Cancel
              </UIButton>
              <UIButton
                type="button"
                onClick={handleAssignStaff}
                disabled={isAssigning || selectedStaffIds.length === 0}
                className="bg-[#1A48AD] hover:bg-[#153a8f]"
              >
                {isAssigning ? "Assigning..." : "Assign Staff"}
              </UIButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unassign Staff Confirmation Dialog */}
      <AlertDialog open={showUnassignDialog} onOpenChange={setShowUnassignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold text-gray-900">{staffToUnassign?.name}</span> from this client?
              This action will remove their access to this client&apos;s information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnassigning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnassign}
              disabled={isUnassigning}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isUnassigning ? "Removing..." : "Remove Staff"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section className="flex flex-col gap-7" style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both' }}>
        {/* Refined Tab Navigation */}
        <div className="w-full bg-white rounded-xl border border-[#E5E7EB]/50 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="flex flex-wrap gap-px bg-[#E5E7EB]/40 p-1.5">
            {TREATMENT_PAN_FORMS_TAB_OPTIONS.map((item, index) => (
              <button
                data-testid={`client-tab-${item.id}`}
                onClick={() => setFormTab(item.id)}
                key={item.id}
                style={{
                  animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.35 + index * 0.04}s both`,
                  fontFamily: "'DM Sans', sans-serif"
                }}
                className={`
                  relative px-6 py-3 text-[14px] font-[700] rounded-lg transition-all duration-300 tracking-wide
                  ${
                    formTab === item.id
                      ? "text-[#1A48AD] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_2px_8px_rgba(26,72,173,0.08)] scale-[1.02]"
                      : "text-[#667085] hover:text-[#101828] hover:bg-white/60 bg-transparent"
                  }
                `}
              >
                {formTab === item.id && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1A48AD]/[0.04] to-transparent rounded-lg" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-[#1A48AD] to-transparent rounded-full" />
                  </>
                )}
                <span className="relative z-10">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]" style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both' }}>
          {formTab === "forms" && (
            <FormsTab client={user} clientId={clientId} admin={admin} clientManager={clientManager} />
          )}

          {formTab === "iiss" && (
            <AssesmentTab
              admin={admin}
              clientManager={clientManager}
              clientId={clientId}
              username={username}
              treatmentPlanData={treatmentPlanData}
              formTab={formTab}
              isFetchingTreatmentPlan={isFetchingTreatmentPlan}
              refetchTreatmentPlan={refetchTreatmentPlan}
              user={user}
            />
          )}

          {formTab === "fc" && (
            <AssesmentTab
              admin={admin}
              clientManager={clientManager}
              clientId={clientId}
              username={username}
              treatmentPlanData={treatmentPlanData}
              formTab={formTab}
              isFetchingTreatmentPlan={isFetchingTreatmentPlan}
              refetchTreatmentPlan={refetchTreatmentPlan}
              user={user}
            />
          )}

          {formTab === "ti" && (
            <AssesmentTab
              admin={admin}
              clientManager={clientManager}
              clientId={clientId}
              username={username}
              treatmentPlanData={treatmentPlanData}
              formTab={formTab}
              isFetchingTreatmentPlan={isFetchingTreatmentPlan}
              refetchTreatmentPlan={refetchTreatmentPlan}
              user={user}
            />
          )}

          {formTab === "alp" && (
            <AssesmentTab
              admin={admin}
              clientManager={clientManager}
              clientId={clientId}
              username={username}
              treatmentPlanData={treatmentPlanData}
              formTab={formTab}
              isFetchingTreatmentPlan={isFetchingTreatmentPlan}
              refetchTreatmentPlan={refetchTreatmentPlan}
              user={user}
            />
          )}

          {formTab === "respite" && (
            <RespiteTab clientId={clientId} admin={admin} clientManager={clientManager} username={username} />
          )}

          {formTab === "documents" && (
            <DocumentsTab clientId={clientId} admin={admin} clientManager={clientManager} username={username} />
          )}
        </div>
      </section>
    </section>
    </>
  );
};

export default ClientDetailPageWrapper;
