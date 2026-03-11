import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import useModal from "@/context/modal";
import { ReactElement } from "react";

const ConfirmModal = ({
  isLoading,
  handleConfirm,
  confirmationText,
  confirmMationHeader,
  icon,
  testId = "confirm-dialog",
}: {
  isLoading: boolean;
  handleConfirm: () => void;
  confirmationText: string;
  confirmMationHeader?: string;
  icon?: ReactElement;
  testId?: string;
}) => {
  const { isModalOpen, closeModal } = useModal("CONFIRM_MODAL");

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(e) => {
        if (e === false) {
          closeModal();
        }
      }}
    >
      <DialogContent data-testid={`${testId}-modal`}>
        <DialogHeader className="">
          <DialogTitle className="mx-auto text-[#101828] text-center ">
            <div className="flex flex-col justify-center items-center">
              {icon && icon}
              <p data-testid={`${testId}-header`}>{confirmMationHeader}</p>
            </div>
          </DialogTitle>
          <DialogDescription
            className="text-[14px] font-[400] text-[#475467] text-center pt-3"
            data-testid={`${testId}-description`}
          >
            {confirmationText}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-3 flex items-center gap-5">
          <DialogClose
            onClick={() => closeModal()}
            className="w-full h-fit p-2 rounded-[6px] bg-[#F1F5F9] text-black"
            data-testid={`${testId}-cancel-button`}
          >
            Cancel
          </DialogClose>
          <button
            disabled={isLoading}
            onClick={handleConfirm}
            className="w-full h-fit p-2 rounded-[6px] bg-[#2563EB] text-white disabled:cursor-not-allowed disabled:bg-[#2564eb44] flex items-center justify-center gap-3"
            data-testid={`${testId}-confirm-button`}
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            Confirm
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
