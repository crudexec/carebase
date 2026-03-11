"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import FormSelect from "@/components/input-fields/FormSelect";
import { DatePicker } from "@/components/calendar/CalendarSelect";
import { Loader2 } from "lucide-react";
import { createGenericTreatmentPlan } from "@/actions/clients/treatment-plan/treatmentPlan";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { TreatmentPlanFormTabOptionIdType } from "../../ClientDetailPageWrapper";
import {
  getTreatmentPlanFormRoute,
  getTreatmentPlanFormName,
} from "@/utils/treatmentPlanHelpers";

interface Props {
  open: boolean;
  onClose: () => void;
  clientId: string;
  formTab: TreatmentPlanFormTabOptionIdType;
  admin?: boolean;
  refetchTreatmentPlan: () => void;
  username: string;
}

const NewTreatmentPlanModal = ({
  open,
  onClose,
  clientId,
  formTab,
  admin,
  refetchTreatmentPlan,
  username,
}: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tpType, setTpType] = useState("");
  const [tpImplementedBy, setTpImplementedBy] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleSubmit = async () => {
    if (!tpType) {
      toast({
        variant: "destructive",
        description: "Please select the TP type",
      });
      return;
    }

    if (!tpImplementedBy) {
      toast({
        variant: "destructive",
        description: "Please select who implements the TP",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        description: "Please select both start and end dates",
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token") ?? "";

      const response = await createGenericTreatmentPlan(
        clientId,
        formTab,
        token,
        tpType,
        tpImplementedBy,
        startDate!,
        endDate!
      );

      await refetchTreatmentPlan();

      if (!response.status) {
        toast({
          variant: "destructive",
          title: "Error Creating Treatment Plan",
          description: response.errorMessage,
        });
        return;
      }

      const route = admin
        ? `/admin/clients/${clientId}/forms/${getTreatmentPlanFormRoute(
            formTab
          )}?mode=edit&formId=${response?.data?.id}`
        : `/clients/${clientId}/forms/${getTreatmentPlanFormRoute(
            formTab
          )}?mode=edit&formId=${response?.data?.id}`;

      router.push(route);
    } catch (err) {
      console.error("ERROR CREATING TREATMENT PLAN", err);
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
        data-testid="new-treatment-plan-modal"
      >
        <div className="w-full flex gap-5 justify-center items-center ml-auto">
          <h2 className="text-[18px] w-full font-[600] text-[#101828] text-center">
            New {getTreatmentPlanFormName(formTab)} - {username}
          </h2>
        </div>

        <FormSelect
          labelText="TP Type"
          placeholder="Select Option"
          value={tpType}
          onValueChange={setTpType}
          selectContent={[
            { label: "Initial", value: "Initial" },
            { label: "Provisional", value: "Provisional" },
            { label: "Annual", value: "Annual" },
          ]}
          data-testid="treatment-plan-type-select"
        />

        <FormSelect
          labelText="TP Implemented By"
          placeholder="Select Option"
          value={tpImplementedBy}
          onValueChange={setTpImplementedBy}
          selectContent={[
            { label: "Family Consultant", value: "Family Consultant" },
            { label: "TI Technician", value: "TI Technician" },
            { label: "Adult Life Planner", value: "Adult Life Planner" },
            {
              label: "Intensive Individual Support Services (IISS)",
              value: "Intensive Individual Support Services (IISS)",
            },
            {
              label: "DSP (Direct Care Worker)",
              value: "DSP (Direct Care Worker)",
            },
            {
              label: "On-Call Professional",
              value: "On-Call Professional",
            },
          ]}
          data-testid="treatment-plan-implemented-by-select"
        />

        <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
          <DatePicker
            label="Implementation Start Date"
            getDate={(date) => setStartDate(date)}
            data-testid="treatment-plan-start-date"
          />
          <DatePicker
            label="Implementation End Date"
            getDate={(date) => setEndDate(date)}
            data-testid="treatment-plan-end-date"
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

export default NewTreatmentPlanModal;
