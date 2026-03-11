"use client";

import { Row } from "@tanstack/react-table";
import { RequestType } from "../types";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import FormTextArea from "@/components/input-fields/FormTextArea";
import Loader from "@/components/Loader";
import {
  declineEventSchedule,
  approveEventSchedule,
} from "@/actions/events/events";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Users } from "lucide-react";
import { PersonIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { formatDate } from "@/utils";
import useEvent from "../../use-event";

const RequestAction = ({ row }: { row: Row<RequestType> }) => {
  const { setTab } = useEvent();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const token = localStorage.getItem("token") as string;

  const [openModal, setOpenModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [reasonForDecline, setReasonForDecline] = useState("");

  const handleDeclineRequest = async () => {
    try {
      const response = await declineEventSchedule(token, {
        declination_reason: row.original.reason,
        event_schedule_id: row.original.eventId,
      });

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      setReasonForDecline("");
      toast({
        variant: "default",
        title: "Reschedule Declined Succesfully",
        description:
          "The event has been declined, and a notification has been sent to the employee.",
      });
      setOpenModal(false);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const handleApproveRequest = async () => {
    try {
      const response = await approveEventSchedule(token, {
        event_schedule_id: row.original.eventId,
      });

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      toast({
        variant: "default",
        title: "Reschedule request approved",
        description: "The event has been approved succesfully",
      });
      setTab("upcoming");
      setOpenApproveModal(false);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const { mutate: mutateDecline, isPending: isPendingDecline } = useMutation({
    mutationFn: () => handleDeclineRequest(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allRequests", "allEvents", "employeeEvents"],
      });
    },
  });
  const { mutate: mutateApprove, isPending: isPendingApprove } = useMutation({
    mutationFn: () => handleApproveRequest(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allRequests", "allEvents", "employeeEvents"],
      });
    },
  });

  return (
    <div className="flex items-center gap-5 text-center mx-auto">
      <button
        onClick={() => setOpenApproveModal(true)}
        className="text-[#2563EB] text-[14px] font-[500] hover:underline"
      >
        Approve
      </button>
      <button
        onClick={() => setOpenModal(true)}
        className="text-[#EF4444] text-[14px] font-[500] hover:underline"
      >
        Decline
      </button>

      <Dialog open={openApproveModal} onOpenChange={setOpenApproveModal}>
        <DialogContent className="lg:w-[55%] xl:w-[45%] 2xl:w-[40%] max-w-full">
          <h2 className="text-[#101828] text-[24px] font-[600]">
            Preview Rescheduled Event
          </h2>

          <div className="mt-3 flex flex-col gap-3">
            <div className="flex justify-between items-center gap-3 flex-wrap lg:flex-nowrap">
              <p className="w-full text-[#0F172A] text-[16px] font-[400] flex gap-3 items-center">
                <Calendar className="w-5 h-5" />
                {format(
                  new Date(row.original.proposedEventDate),
                  "eeee"
                )} - {formatDate(new Date(row.original.proposedEventDate))}
              </p>
              <p className="w-full text-[#0F172A] text-[16px] font-[400] flex gap-3 items-center">
                <Clock className="w-5 h-5" />
                {row.original.proposedEventTime} -{" "}
                {row.original.proposedEventEndTime}
              </p>
            </div>

            <div className="flex justify-between items-center gap-3 flex-wrap lg:flex-nowrap">
              <p className="w-full text-[#0F172A] text-[16px] font-[400] flex gap-3 items-center">
                <PersonIcon className="w-5 h-5" /> Client
                <span className="font-[700]"></span>
                {row.original.clientName}
              </p>
              <p className="w-full text-[#0F172A] text-[16px] font-[400] flex gap-3 items-center">
                <Users className="w-5 h-5" />
                <span className="font-[700]">Staff</span>
                {row.original.staffName}
              </p>
            </div>
          </div>

          <div className="w-full flex items-center gap-5 justify-end mt-5">
            <button
              disabled={isPendingApprove}
              type="button"
              onClick={() => {
                setOpenApproveModal(false);
              }}
              className={`flex items-center justify-center gap-3 px-5 py-3 disabled:bg-[#F1F5F9] disabled:hover:bg-[#F1F5F9] disabled:text-[#0f172a4b] disabled:cursor-not-allowed rounded-[6px] h-fit text-[14px] font-[400] bg-[#d9dde1] w-full hover:bg-[#c7cbce] active:bg-[#a4a7aa] text-[#0F172A]`}
            >
              Cancel
            </button>

            <button
              disabled={isPendingApprove}
              type="button"
              onClick={() => mutateApprove()}
              className={`flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] disabled:bg-[#2564eb69] disabled:hover:bg-[#2564eb69] disabled:text-white disabled:cursor-not-allowed rounded-[6px] h-fit w-full text-[14px] font-[400] active:bg-[#4274e0f3] text-white`}
            >
              {isPendingApprove ? (
                <Loader height="h-fit" />
              ) : (
                "Approve Reschedule"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <h2 className="text-[#101828] text-[24px] font-[600]">
            Decline Reschedule Request
          </h2>

          <div className="mt-3 flex flex-col gap-1">
            <FormTextArea
              labelText="Reason for Declining Request"
              placeholder="Enter here ..."
              name="notes"
              value={reasonForDecline}
              onChange={(e) => {
                setReasonForDecline(e.target.value);
              }}
            />
          </div>

          <div className="w-full flex items-center gap-5 justify-end">
            <button
              disabled={isPendingDecline}
              type="button"
              onClick={() => {
                setOpenModal(false);
              }}
              className={`flex items-center justify-center gap-3 px-5 py-3 disabled:bg-[#F1F5F9] disabled:hover:bg-[#F1F5F9] disabled:text-[#0f172a4b] disabled:cursor-not-allowed rounded-[6px] h-fit text-[14px] font-[400] bg-[#d9dde1] w-full hover:bg-[#c7cbce] active:bg-[#a4a7aa] text-[#0F172A]`}
            >
              Cancel
            </button>

            <button
              disabled={isPendingDecline}
              type="button"
              onClick={() => mutateDecline()}
              className={`flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] disabled:bg-[#2564eb69] disabled:hover:bg-[#2564eb69] disabled:text-white disabled:cursor-not-allowed rounded-[6px] h-fit w-full text-[14px] font-[400] active:bg-[#4274e0f3] text-white`}
            >
              {isPendingDecline ? <Loader height="h-fit" /> : "Decline Request"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestAction;
