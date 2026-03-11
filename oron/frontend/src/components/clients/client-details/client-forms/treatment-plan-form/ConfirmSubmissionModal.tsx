"use client";

import Button from "@/components/button/Button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";

interface Props {
  isConfirmTreatmentPlanModalOpen: boolean;
  setIsConfirmTreatmentPlanModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  clientName: string;
  submitSign: any;
  isCompletingFormLoading: boolean;
}

const ConfirmSubmissionModal = ({
  isConfirmTreatmentPlanModalOpen,
  setIsConfirmTreatmentPlanModalOpen,
  clientName,
  submitSign,
  isCompletingFormLoading,
}: Props) => {
  const handleCompleteTreatmentPlan = async () => {
    try {
      await submitSign();
    } catch (error) {
      console.error("ERROR COMPLETING TREATMENT PLAN", error);
    }
  };

  return (
    <Dialog
      open={isConfirmTreatmentPlanModalOpen}
      onOpenChange={setIsConfirmTreatmentPlanModalOpen}
    >
      <DialogContent
        data-testid="confirm-submission-dialog"
        className="flex flex-col w-full gap-2 justify-center items-center bg-white border-none xl:min-w-[540px]"
      >
        <Image
          src="/assets/images/dashboard/infoIconBg.svg"
          width={60}
          height={60}
          alt="info icon"
        />

        <h2 className="text-[#101828] text-[18px] font-[600] px-5 text-center mt-5">
          Are you sure you want to complete {clientName}&apos;s treatment plan?
        </h2>
        <p className="text-[#475467] text-[14px] font-[400] px-5 text-center">
          Please note that once completed, this treatment plan becomes final and
          can&apos;t be edited. You can review your entries again or save as a
          draft to be completed later.
        </p>

        <div className="w-full flex items-center justify-between flex-wrap xl:flex-nowrap gap-3 mt-6">
          <Button
            disabled={isCompletingFormLoading}
            onClick={() => setIsConfirmTreatmentPlanModalOpen(false)}
            className="w-full"
            type="button"
            variant="light"
            data-testid="cancel-submission-button"
          >
            Cancel
          </Button>
          <Button
            isLoading={isCompletingFormLoading}
            disabled={isCompletingFormLoading}
            onClick={handleCompleteTreatmentPlan}
            className="w-full"
            type="button"
            data-testid="complete-submission-button"
          >
            Complete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmSubmissionModal;
