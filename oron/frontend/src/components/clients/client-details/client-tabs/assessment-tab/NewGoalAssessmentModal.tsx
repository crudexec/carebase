"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import FormSelect from "@/components/input-fields/FormSelect";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { TreatmentPlanFormTabOptionIdType } from "../../ClientDetailPageWrapper";

interface Props {
  open: boolean;
  onClose: () => void;
  clientId: string;
  formTab: TreatmentPlanFormTabOptionIdType;
  admin?: boolean;
  refetchTreatmentPlan: () => void;
  username: string;
}

const NewGoalAssessmentModal = ({
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
  const [selectedTreatmentPlan, setSelectedTreatmentPlan] = useState("");
  const [selectedAgeRange, setSelectedAgeRange] = useState("");

  const handleSubmit = async () => {
    if (!selectedTreatmentPlan) {
      toast({
        variant: "destructive",
        description: "Please select a treatment plan",
      });
      return;
    }

    if (!selectedAgeRange) {
      toast({
        variant: "destructive",
        description: "Please select an age range",
      });
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement the API call to create a new goal assessment
      const token = localStorage.getItem("token") ?? "";

      // Mock response for now
      const response = { status: true, data: { id: "mock-id" } };

      await refetchTreatmentPlan();

      if (!response.status) {
        toast({
          variant: "destructive",
          title: "Error Creating Goal Assessment",
          description: "Failed to create goal assessment",
        });
        return;
      }

      const route = admin
        ? `/admin/clients/${clientId}/goal-assessment?formId=${response.data.id}`
        : `/clients/${clientId}/goal-assessment?formId=${response.data.id}`;

      router.push(route);
    } catch (err) {
      console.error("ERROR CREATING GOAL ASSESSMENT", err);
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
        data-testid="new-goal-assessment-modal"
      >
        <div className="w-full flex gap-5 justify-center items-center ml-auto">
          <h2 className="text-[18px] w-full font-[600] text-[#101828] text-center">
            ALP Goal Assessment
          </h2>
        </div>

        <div className="flex flex-col gap-5">
          <h3 className="text-[16px] font-[500] text-[#101828]">
            Choose ALP TP Plan
          </h3>
          <FormSelect
            placeholder="05/04/2024 - 12/31/2024 (Initial)"
            value={selectedTreatmentPlan}
            onValueChange={setSelectedTreatmentPlan}
            selectContent={[
              {
                label: "05/04/2024 - 12/31/2024 (Initial)",
                value: "05/04/2024 - 12/31/2024 (Initial)",
              },
            ]}
            data-testid="treatment-plan-select"
          />
        </div>

        <div className="flex flex-col gap-5">
          <h3 className="text-[16px] font-[500] text-[#101828]">Age Range</h3>
          <FormSelect
            placeholder="14 years"
            value={selectedAgeRange}
            onValueChange={setSelectedAgeRange}
            selectContent={[{ label: "14 years", value: "14 years" }]}
            data-testid="age-range-select"
          />
        </div>

        <div className="flex items-center gap-5 lg:flex-nowrap flex-wrap mt-5">
          <button
            onClick={onClose}
            className="w-full h-fit bg-[#F1F5F9] rounded-[6px] px-2 py-3 text-black disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 text-center justify-center"
            data-testid="close-goal-assessment-modal-button"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            className="w-full h-fit bg-[#2563EB] rounded-[6px] px-2 py-3 text-white disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 text-center justify-center"
            onClick={handleSubmit}
            data-testid="create-goal-assessment-button"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewGoalAssessmentModal;
