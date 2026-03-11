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
import Image from "next/image";

const DeleteModal = ({
  isLoading,
  handleConfirm,
  confirmationText,
  confirmMationHeader,
  "data-testid": dataTestId,
}: {
  isLoading: boolean;
  handleConfirm: () => void;
  confirmationText: string;
  confirmMationHeader?: string;
  "data-testid"?: string;
}) => {
  const { isModalOpen, closeModal } = useModal("DELETE_MODAL");

  return (
    <Dialog onOpenChange={closeModal} open={isModalOpen}>
      <DialogContent data-testid={`${dataTestId}-modal`}>
        <DialogHeader>
          <Image
            src="/assets/images/dashboard/trashIconBg.svg"
            width={50}
            height={50}
            alt="trash icon"
            className="mx-auto pb-5"
          />
          <DialogTitle className="mx-auto">{confirmMationHeader}</DialogTitle>
          <DialogDescription className="text-[14px] font-[200] text-[#475467] text-center pt-3">
            {confirmationText}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-3 flex items-center gap-5">
          <DialogClose
            data-testid={`${dataTestId}-close-button`}
            onClick={() => closeModal()}
            className="w-full h-fit p-2 rounded-[6px] bg-[#F1F5F9] text-black"
          >
            Cancel
          </DialogClose>
          <button
            data-testid={`${dataTestId}-confirm-button`}
            disabled={isLoading}
            onClick={handleConfirm}
            className="w-full h-fit p-2 rounded-[6px] bg-[#EF4444] text-white disabled:cursor-not-allowed disabled:bg-[#ef444498] flex items-center justify-center gap-3"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            Confirm
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
