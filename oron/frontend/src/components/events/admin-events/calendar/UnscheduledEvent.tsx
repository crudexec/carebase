"use client";

import FormSelect from "@/components/input-fields/FormSelect";
import FormTextArea from "@/components/input-fields/FormTextArea";
import Loader from "@/components/Loader";
import { formatDate } from "@/utils";
import { format } from "date-fns";
import { AlertCircleIcon, XIcon } from "lucide-react";
import { RefObject, SetStateAction } from "react";
import { Event } from "../types";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  eventBoxRef: RefObject<HTMLDivElement>;
  isMediumScreenOrLess: boolean;
  eventPosition: {
    top: number;
    left: number;
  };
  setIsSelectedStaffAvailable: (value: SetStateAction<boolean>) => void;
  setUnscheduledEvent: (value: SetStateAction<Event | null>) => void;
  clearAllInputs: () => void;
  setStaff: (value: SetStateAction<string>) => void;
  setNotes: (value: SetStateAction<string>) => void;
  unscheduledEvent: Event;
  isSelectedStaffAvailable: boolean;
  filterValues: {
    client: {
      label: string;
      value: string;
    };
    employee: {
      label: string;
      value: string;
    };
  };
  staffs: {
    label: string;
    value: string;
  }[];
  notes: string;
  scheduleEventLoading: boolean;
  handleEditUnscheduledEvent: (
    id: string,
    staff: string,
    notes: string
  ) => Promise<void>;
  staff: string;
};

const UnscheduledEvent = ({
  eventBoxRef,
  isMediumScreenOrLess,
  eventPosition,
  setIsSelectedStaffAvailable,
  setUnscheduledEvent,
  clearAllInputs,
  setStaff,
  setNotes,
  unscheduledEvent,
  isSelectedStaffAvailable,
  filterValues,
  staffs,
  notes,
  scheduleEventLoading,
  handleEditUnscheduledEvent,
  staff,
}: Props) => {
  const { toast } = useToast();

  return (
    <div
      ref={eventBoxRef}
      className={`flex flex-col p-5 bg-white border border-gray-300 shadow-lg w-full lg:w-[480px] md:w-[80%] z-50 rounded-[12px] fixed justify-center left-0 right-0 lg:justify-normal lg:absolute `}
      style={
        isMediumScreenOrLess
          ? undefined
          : {
              position: "absolute",
              top: eventPosition.top,
              left: eventPosition.left,
            }
      }
    >
      <div className="flex gap-5 justify-end items-center flex-wrap">
        <button
          onClick={() => {
            setIsSelectedStaffAvailable(true);
            setUnscheduledEvent(null);
            clearAllInputs();
            setStaff("");
            setNotes("");
          }}
        >
          <XIcon className="w-5 h-5 text-[#64748B] hover:text-black" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-[#101828] text-[24px] font-[600]">
          Client - {unscheduledEvent.client}
        </h4>
        <p className="text-[#475569] text-[16px] font-[400]">
          {format(new Date(unscheduledEvent.start), "eeee")} -{" "}
          {formatDate(new Date(unscheduledEvent.end))} {"|"}{" "}
          {unscheduledEvent.content.start} - {unscheduledEvent.content.end}
        </p>
      </div>

      <div className="flex flex-col gap-5 mt-5 z-[9000]">
        {!isSelectedStaffAvailable && (
          <div className="flex flex-col gap-3 p-5 border-[2px] border-[#FDA29B] bg-[#FFFBFA] rounded-[8px]">
            <div className="flex gap-3 items-start">
              <AlertCircleIcon className="w-5 h-5 text-[#D92D20]" />
              <p className="text-[14px] font-[400] text-[#B42318]">
                Selected staff is not available for this time slot
              </p>
            </div>
          </div>
        )}

        <FormSelect
          defaultValue={filterValues.employee.value}
          name="staff"
          labelText="Staff"
          placeholder="Select staff"
          selectContent={staffs}
          value={staff}
          onValueChange={(value) => {
            setStaff(value);
            setIsSelectedStaffAvailable(true);
          }}
        />

        <FormTextArea
          labelText="Notes (Optional)"
          placeholder="Enter here ..."
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center gap-5 justify-end">
          <button
            disabled={scheduleEventLoading}
            type="button"
            onClick={() => {
              setUnscheduledEvent(null);
              setIsSelectedStaffAvailable(true);
              clearAllInputs();
              setStaff("");
              setNotes("");
            }}
            className={`flex items-center justify-center gap-3 px-5 py-3 disabled:bg-[#F1F5F9] disabled:hover:bg-[#F1F5F9] disabled:text-[#0f172a4b] disabled:cursor-not-allowed rounded-[6px] h-fit text-[14px] font-[400] bg-[#d9dde1] w-fit hover:bg-[#c7cbce] active:bg-[#a4a7aa] text-[#0F172A]`}
          >
            Cancel
          </button>
          <button
            disabled={scheduleEventLoading}
            type="button"
            onClick={async () => {
              if (!staff || staff.length < 1) {
                toast({
                  description: "Please select a staff",
                  variant: "destructive",
                });
                return;
              }
              await handleEditUnscheduledEvent(
                unscheduledEvent.id,
                staff,
                notes
              );
              setUnscheduledEvent(null);
              clearAllInputs();
              setStaff("");
              setNotes("");
            }}
            className={`flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] disabled:bg-[#2564eb69] disabled:hover:bg-[#2564eb69] disabled:text-white disabled:cursor-not-allowed rounded-[6px] h-fit w-fit text-[14px] font-[400] active:bg-[#4274e0f3] text-white`}
          >
            {scheduleEventLoading ? <Loader height="h-fit" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnscheduledEvent;
