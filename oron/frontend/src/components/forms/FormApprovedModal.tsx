"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";

interface Props {
  formName: string;
}

const FormApprovedModal = ({ formName }: Props) => {
  return (
    <Dialog defaultOpen={true}>
      <DialogContent>
        <DialogHeader>
          <Image
            src="/assets/images/dashboard/checkmark.svg"
            width={50}
            height={50}
            alt="checkmark"
            className="mx-auto"
          />

          <h2 className="text-[#101828] text-[18px] font-[600] mx-auto text-center">
            Congratulations {formName} <br /> Approved
          </h2>

          <DialogDescription className="mt-3 text-[#475467] font-[400] text-[14px] lg:w-[80%] mx-auto text-center">
            Your form has been reviewed and approved. No further edits can be
            made at this stage
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-3">
          <DialogClose className="bg-[#039855] hover:bg-[#039855c2] text-white hover:text-white text-[14px] font-[500] rounded-[6px] border-0 outline-0 w-full py-3">
            Continue
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormApprovedModal;
