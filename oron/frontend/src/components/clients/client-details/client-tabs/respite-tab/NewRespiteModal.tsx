"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import FormSelect from "@/components/input-fields/FormSelect";
import { DatePicker } from "@/components/calendar/CalendarSelect";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  filterEndTimeOptions,
  formatDateToUTCString,
  generateTimeSlots,
} from "@/utils/date-utils";
import { createGenericRespiteForm } from "@/actions/clients/respite/respiteForm";

interface Props {
  open: boolean;
  onClose: () => void;
  clientId: string;
  admin?: boolean;
  username: string;
  refetchRespiteForms?: () => void;
}

const NewRespiteModal = ({
  open,
  onClose,
  clientId,
  admin,
  username,
  refetchRespiteForms,
}: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dateOfSession, setDateOfSession] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

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

  const handleSubmit = async () => {
    if (!dateOfSession) {
      toast({
        variant: "destructive",
        description: "Please select the date of session",
      });
      return;
    }

    if (!startTime) {
      toast({
        variant: "destructive",
        description: "Please select the start time",
      });
      return;
    }

    if (!endTime) {
      toast({
        variant: "destructive",
        description: "Please select the end time",
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token") ?? "";

      const dateUtcString = formatDateToUTCString(dateOfSession);

      const response = await createGenericRespiteForm(
        token,
        dateUtcString,
        startTime,
        endTime,
        clientId
      );

      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      const route = admin
        ? `/admin/clients/${clientId}/forms/respite?mode=edit&formId=${response.data?.id}`
        : `/clients/${clientId}/forms/respite?mode=edit&formId=${response.data?.id}`;

      router.push(route);
    } catch (err) {
      console.error("ERROR CREATING RESPITE", err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[12px] flex flex-col gap-5"
        data-testid="new-respite-modal"
      >
        <div className="w-full flex gap-5 justify-center items-center ml-auto">
          <h2 className="text-[18px] w-full font-[600] text-[#101828] text-center">
            New Respite - {username}
          </h2>
        </div>

        <DatePicker
          label="Date Of Session"
          getDate={(date) => setDateOfSession(date)}
          data-testid="date-of-session-picker"
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
            onClick={onClose}
            className="w-full h-fit bg-[#F1F5F9] rounded-[6px] px-2 py-3 text-black disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 text-center justify-center"
            data-testid="close-treatment-plan-modal-button"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            className="w-full h-fit bg-[#2563EB] rounded-[6px] px-2 py-3 text-white disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 text-center justify-center"
            onClick={handleSubmit}
            data-testid="create-treatment-plan-button"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewRespiteModal;
