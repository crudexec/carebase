"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { DatePicker } from "@/components/calendar/CalendarSelect";
import FormSelect from "@/components/input-fields/FormSelect";
import { createVisitForm } from "@/use-cases/clients/new-visit";
import useCustomMutation from "@/hooks/useCustomMutation";
import { Loader2 } from "lucide-react";
import {
  formatDateToUTCString,
  generateTimeSlots,
  filterEndTimeOptions,
} from "@/utils/date-utils";
import { TreatmentPlanFormTabOptionIdType } from "./ClientDetailPageWrapper";
import {
  convertTreatmentPlanTypeToEnumType,
  convertVisitTypeToName,
  getVisitFormRoute,
  visitTypeOptions,
} from "@/utils/treatmentPlanHelpers";

interface VisitDialogProps {
  openModal: boolean;
  closeModal: () => void;
  username: string;
  clientId: string;
  formType?: TreatmentPlanFormTabOptionIdType;
  admin?: boolean;
  clientManager?: boolean;
  isGenericDialog?: boolean;
}

const LogVisitDialog = ({
  openModal,
  closeModal,
  username,
  clientId,
  formType,
  admin,
  clientManager,
  isGenericDialog,
}: VisitDialogProps) => {
  const searchParams = useSearchParams();
  const searchParamsDate = searchParams.get("date");
  const searchParamsStartTime = searchParams.get("start_time");
  const searchParamsEndTime = searchParams.get("end_time");

  const router = useRouter();
  const { toast } = useToast();
  const [dateOfSession, setDateOfSession] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [visitType, setVisitType] =
    useState<TreatmentPlanFormTabOptionIdType>("iiss");

  useEffect(() => {
    if (searchParamsStartTime) {
      setStartTime(searchParamsStartTime);
    }
    if (searchParamsEndTime) {
      setEndTime(searchParamsEndTime);
    }
  }, [searchParamsStartTime, searchParamsEndTime]);

  useEffect(() => {
    if (openModal) {
      const params = new URLSearchParams(searchParams.toString());

      params.delete("date");
      params.delete("start_time");
      params.delete("end_time");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const timeOptions = useMemo(() => generateTimeSlots(), []);

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    if (endTime && endTime <= value) {
      setEndTime("");
    }
  };

  const handleEndTimeChange = (value: string) => {
    setEndTime(value);
  };

  const token = localStorage.getItem("token") ?? "";

  const handleFormSubmit = useCallback(async () => {
    setLoading(true);

    try {
      if (dateOfSession) {
        const dateUtcString = formatDateToUTCString(dateOfSession);

        const visitFormData: any = {
          date_of_visit: dateUtcString,
          start_time: startTime,
          end_time: endTime,
          intake_full_id: clientId,
        };

        if (formType !== "fc") {
          visitFormData.treatment_type = convertTreatmentPlanTypeToEnumType(
            isGenericDialog ? visitType : formType!
          );
        }

        const res = await createVisitForm(
          token,
          visitFormData,
          isGenericDialog ? visitType : formType
        );

        const visitFormRoute = getVisitFormRoute(
          isGenericDialog ? visitType : formType
        );

        // Check the response status
        if (res.status) {
          router.push(
            clientManager
              ? `/client-manager/clients/${clientId}/visits/${visitFormRoute}?formId=${encodeURIComponent(
                  res.errorMessage
                )}`
              : admin
              ? `/admin/clients/${clientId}/visits/${visitFormRoute}?formId=${encodeURIComponent(
                  res.errorMessage
                )}`
              : `/clients/${clientId}/visits/${visitFormRoute}?formId=${encodeURIComponent(
                  res.errorMessage
                )}`
          );
        } else {
          toast({
            variant: "destructive",
            description: res.errorMessage,
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "An error occurred during submission. Please try again.",
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateOfSession, startTime, endTime]);

  const { mutate } = useCustomMutation<string>(handleFormSubmit, [
    "create-visit-form",
  ]);

  return (
    <Dialog open={openModal} onOpenChange={closeModal}>
      <DialogContent
        data-testid="log-visit-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[12px] flex flex-col gap-5"
      >
        <div className="w-full flex gap-5 justify-center items-center ml-auto">
          <h2 className="text-[18px] w-full font-[600] text-[#101828] text-center">
            Log New{" "}
            {convertVisitTypeToName(isGenericDialog ? visitType : formType)}{" "}
            Visit - {username}
          </h2>
        </div>

        {isGenericDialog && (
          <FormSelect
            labelText="Visit Type"
            placeholder="Select Visit Type"
            selectContent={visitTypeOptions}
            value={visitType}
            onValueChange={(value: any) => setVisitType(value)}
          />
        )}

        <DatePicker
          label="Date Of Session"
          getDate={(date) => setDateOfSession(date)}
          defaultDate={
            searchParamsDate ? new Date(searchParamsDate) : undefined
          }
          selectPastDateOnly={true}
          data-testid="visit-date-of-session"
        />

        <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
          <FormSelect
            labelText=""
            placeholder="Select time"
            selectContent={timeOptions}
            value={startTime}
            onValueChange={handleStartTimeChange}
            data-testid="visit-start-time"
          />

          <FormSelect
            labelText=""
            placeholder="Select time"
            selectContent={filterEndTimeOptions(startTime, timeOptions)}
            value={endTime}
            onValueChange={handleEndTimeChange}
            disabled={startTime.length === 0}
            data-testid="visit-end-time"
          />
        </div>

        <div className="flex items-center gap-5 lg:flex-nowrap flex-wrap mt-5">
          <button
            data-testid="close-visit-modal-button"
            onClick={closeModal}
            className="w-full h-fit bg-[#F1F5F9] rounded-[6px] px-2 py-3 text-black disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 text-center justify-center"
          >
            Cancel
          </button>

          <button
            data-testid="log-visit-button"
            disabled={loading}
            className="w-full h-fit bg-[#2563EB] rounded-[6px] px-2 py-3 text-white disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 text-center justify-center"
            onClick={() => {
              if (isGenericDialog && !visitType) {
                toast({
                  variant: "destructive",
                  description: "Please select the visit type",
                });
                return;
              }

              if (!dateOfSession) {
                toast({
                  variant: "destructive",
                  description: "Please select the date of session",
                });
                return;
              }

              if (!startTime || !endTime) {
                toast({
                  variant: "destructive",
                  description: "Please select the start and end time",
                });
                return;
              }

              mutate("s");
            }}
            // className="w-full h-fit bg-[#2563EB] hover:bg-[#2b5dca] rounded-[6px] px-5 py-3 text-white disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center text-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Log Visit"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogVisitDialog;
