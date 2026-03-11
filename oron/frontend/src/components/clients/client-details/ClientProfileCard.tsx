"use client";

import FormBadge from "@/components/badge/FormBadge";
import Image from "next/image";
import { MapPinIcon, CalendarDaysIcon, CalendarClockIcon, Users, Plus, X, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { handleDocumentUpload } from "@/actions/upload";
import { uploadClientProfilePicture } from "@/actions/clients/client";
import { useToast } from "@/components/ui/use-toast";
import Loader from "@/components/Loader";
import { truncateText } from "@/utils/helpers";
import { useClientAssignments } from "@/hooks/useClientStaffAssignment";

interface Props {
  name: string;
  status: string;
  intakeDate: string;
  lastVisit: string;
  nextVisit: string;
  location: string;
  serviceType: string;
  admin?: boolean;
  intakeId: string | undefined;
  profilePicture: string | null;
  refetch: any;
  isClientManager?: boolean;
  onAssignStaffClick?: () => void;
  onUnassignStaffClick?: (staffId: string, staffName: string) => void;
}

const ClientProfileCard = ({
  name,
  status,
  intakeDate,
  lastVisit,
  nextVisit,
  location,
  serviceType,
  admin,
  intakeId,
  profilePicture,
  refetch,
  isClientManager,
  onAssignStaffClick,
  onUnassignStaffClick,
}: Props) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>("");

  const { toast } = useToast();
  const { data: assignments = [], isLoading: loadingAssignments } = useClientAssignments(intakeId || "");

  const canManageAssignments = admin || isClientManager;

  const handleDragLeave = (e: React.DragEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    setIsLoading(true);

    e.preventDefault();

    const token = localStorage.getItem("token") as string;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const formData = new FormData();

      formData.append("document", droppedFile);

      const fileUrl = await handleDocumentUpload(formData, token);

      const response = await uploadClientProfilePicture(
        intakeId!,
        fileUrl,
        token
      );

      refetch();

      if (!response) {
        toast({
          variant: "destructive",
          description: "Something went wrong! Please try again",
        });
      } else {
        toast({
          variant: "success",
          description: "Client Profile Picture Uploaded Successfully",
        });
      }

      setDragActive(false);
      setFileUrl(fileUrl);

      setIsLoading(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLoading(true);

    const file = event.target?.files?.[0];
    const token = localStorage.getItem("token") as string;

    if (file) {
      const formData = new FormData();

      formData.append("document", file);

      const fileUrl = await handleDocumentUpload(formData, token);
      const response = await uploadClientProfilePicture(
        intakeId!,
        fileUrl,
        token
      );

      refetch();

      if (!response) {
        toast({
          variant: "destructive",
          description: "Something went wrong! Please try again",
        });
      } else {
        toast({
          variant: "success",
          description: "Client Profile Picture Uploaded Successfully",
        });
      }

      setFileUrl(fileUrl);

      setIsLoading(false);
    }
  };

  const displayProfilePicture = (): string => {
    if (admin) {
      if (profilePicture) {
        return profilePicture;
      }
      if (fileUrl?.length > 10) {
        return fileUrl;
      }
      return "/assets/images/dashboard/emptyProfilePicture.svg";
    }

    return profilePicture ?? "/assets/images/dashboard/emptyProfilePicture.svg";
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&display=swap');
      `}</style>

      <div className="w-full bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] overflow-hidden border border-[#E5E7EB]/50">
        {/* Hero Section - Refined Header */}
        <div className="relative bg-gradient-to-br from-[#FAFBFC] via-[#FFFFFF] to-[#F8FAFC] px-8 lg:px-12 py-10 lg:py-12 border-b border-[#E5E7EB]/60">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#1A48AD]/[0.03] to-transparent rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row gap-10 items-start md:items-start">
            {/* Profile Picture - Refined with subtle shadow */}
            <div className="relative group flex-shrink-0">
              {admin ? (
                <Label
                  onDrop={(e) => !isLoading && handleDrop(e)}
                  onDragLeave={(e) => !isLoading && handleDragLeave(e)}
                  onDragOver={(e) => !isLoading && handleDragOver(e)}
                  onDragEnter={(e) => !isLoading && handleDragOver(e)}
                  htmlFor="uploadImage"
                  className={`block relative cursor-pointer ${
                    dragActive && "scale-[1.02]"
                  } transition-transform duration-300`}
                >
                  <div className="relative w-[130px] h-[130px] lg:w-[150px] lg:h-[150px]">
                    {/* Refined border with subtle gradient */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-[#1A48AD]/20 via-[#1A48AD]/10 to-transparent p-[2px] ${dragActive ? 'animate-pulse from-[#1A48AD]/40 via-[#1A48AD]/20' : ''} transition-all duration-300`}>
                      <div className="w-full h-full rounded-full bg-white p-[3px] shadow-[0_8px_32px_rgba(26,72,173,0.12)]">
                        <div className="w-full h-full rounded-full overflow-hidden relative ring-2 ring-white">
                          <Image
                            src={displayProfilePicture()}
                            width={150}
                            height={150}
                            alt="avatar"
                            draggable="false"
                            className={`w-full h-full object-cover transition-all duration-300 ${
                              isLoading ? "opacity-50 blur-sm" : "opacity-100 group-hover:scale-105"
                            }`}
                          />
                          {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                              <Loader height="h-fit" />
                            </div>
                          )}
                          {!isLoading && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                              <div className="flex items-center gap-1.5 text-white text-[11px] font-[600] tracking-wide">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Update</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <input
                    id="uploadImage"
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => !isLoading && (await handleFileSelect(e))}
                  />
                </Label>
              ) : (
                <div className="relative w-[130px] h-[130px] lg:w-[150px] lg:h-[150px]">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1A48AD]/20 via-[#1A48AD]/10 to-transparent p-[2px]">
                    <div className="w-full h-full rounded-full bg-white p-[3px] shadow-[0_8px_32px_rgba(26,72,173,0.12)]">
                      <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-white">
                        <Image
                          src={displayProfilePicture()}
                          width={150}
                          height={150}
                          alt="avatar"
                          draggable="false"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Client Info - Editorial Typography */}
            <div className="flex-1 flex flex-col gap-5 min-w-0 pt-1">
              <div className="flex flex-col gap-3.5">
                <h2 className="text-[36px] lg:text-[42px] font-[600] text-[#101828] tracking-[-0.02em] leading-[1.1]" style={{ fontFamily: "'Fraunces', serif" }}>
                  {name}
                </h2>
                <div className="flex flex-wrap items-center gap-4">
                  <FormBadge status={status}>{status}</FormBadge>
                  <div className="flex items-center gap-2.5 text-[14px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <CalendarDaysIcon className="w-4 h-4 text-[#667085]" strokeWidth={2.5} />
                    <span className="font-[500] text-[#667085] tracking-wide">Intake</span>
                    <span className="font-[700] text-[#101828]">{intakeDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Refined Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E7EB]/60">
          {/* Last Visit */}
          <div className="group relative bg-white px-7 py-7 lg:py-8 hover:bg-gradient-to-br hover:from-[#FAFBFC] hover:to-white transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#1A48AD]/0 via-[#1A48AD]/40 to-[#1A48AD]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                  <CalendarClockIcon className="w-5 h-5 text-[#1A48AD]" strokeWidth={2.5} />
                </div>
                <h3 className="text-[11px] font-[700] text-[#667085] uppercase tracking-[0.08em] leading-none" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Last Visit
                </h3>
              </div>
              <p className="text-[18px] font-[700] text-[#101828] tracking-[-0.01em] leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {lastVisit}
              </p>
            </div>
          </div>

          {/* Next Visit */}
          <div className="group relative bg-white px-7 py-7 lg:py-8 hover:bg-gradient-to-br hover:from-[#FAFBFC] hover:to-white transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#16A34A]/0 via-[#16A34A]/40 to-[#16A34A]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                  <CalendarDaysIcon className="w-5 h-5 text-[#16A34A]" strokeWidth={2.5} />
                </div>
                <h3 className="text-[11px] font-[700] text-[#667085] uppercase tracking-[0.08em] leading-none" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Next Visit
                </h3>
              </div>
              <p className="text-[18px] font-[700] text-[#101828] tracking-[-0.01em] leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {nextVisit}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="group relative bg-white px-7 py-7 lg:py-8 hover:bg-gradient-to-br hover:from-[#FAFBFC] hover:to-white transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#DC2626]/0 via-[#DC2626]/40 to-[#DC2626]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FEF2F2] to-[#FEE2E2] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                  <MapPinIcon className="w-5 h-5 text-[#DC2626]" strokeWidth={2.5} />
                </div>
                <h3 className="text-[11px] font-[700] text-[#667085] uppercase tracking-[0.08em] leading-none" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Location
                </h3>
              </div>
              <p className="text-[18px] font-[700] text-[#101828] tracking-[-0.01em] leading-tight truncate" title={location} style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {truncateText(location, 30)}
              </p>
            </div>
          </div>

          {/* Assigned Staff */}
          <div className="group relative bg-white px-7 py-7 lg:py-8 hover:bg-gradient-to-br hover:from-[#FAFBFC] hover:to-white transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#0284C7]/0 via-[#0284C7]/40 to-[#0284C7]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300 flex-shrink-0">
                    <Users className="w-5 h-5 text-[#0284C7]" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[11px] font-[700] text-[#667085] uppercase tracking-[0.08em] leading-none truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Staff
                  </h3>
                </div>
                {canManageAssignments && (
                  <Button
                    onClick={onAssignStaffClick}
                    size="sm"
                    className="h-8 px-3 bg-[#1A48AD] hover:bg-[#153a8f] text-white text-[11px] font-[700] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 tracking-wide"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                    Assign
                  </Button>
                )}
              </div>
              {loadingAssignments ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-5 w-28 bg-gray-200 animate-pulse rounded-md" />
                </div>
              ) : assignments.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2.5">
                  {assignments.slice(0, 3).map((assignment) => {
                    const staffName = `${assignment.staff.first_name} ${assignment.staff.last_name}`;
                    return (
                      <div
                        key={assignment.id}
                        className="group/staff relative flex items-center gap-2 bg-[#F0F9FF] border border-[#BFDBFE] rounded-full px-3 py-1.5 pr-8 hover:bg-[#E0F2FE] hover:border-[#93C5FD] transition-all duration-200"
                        title={staffName}
                      >
                        {assignment.staff.profile_picture ? (
                          <Image
                            src={assignment.staff.profile_picture}
                            width={22}
                            height={22}
                            alt={staffName}
                            className="w-[22px] h-[22px] rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                        ) : (
                          <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#0284C7] to-[#0369A1] flex items-center justify-center ring-2 ring-white shadow-sm">
                            <span className="text-[10px] font-[700] text-white">
                              {assignment.staff.first_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="text-[13px] font-[600] text-[#075985] truncate max-w-[90px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          {assignment.staff.first_name}
                        </span>
                        {canManageAssignments && onUnassignStaffClick && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnassignStaffClick(assignment.staff.id, staffName);
                            }}
                            className="absolute right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover/staff:opacity-100 transition-all duration-200 shadow-sm"
                            title={`Remove ${staffName}`}
                          >
                            <X className="w-3 h-3 text-white" strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {assignments.length > 3 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E0F2FE] border-2 border-[#BFDBFE] shadow-sm">
                      <span className="text-[11px] font-[700] text-[#075985]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        +{assignments.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[15px] font-[500] text-[#9CA3AF] italic" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  No staff assigned
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientProfileCard;
