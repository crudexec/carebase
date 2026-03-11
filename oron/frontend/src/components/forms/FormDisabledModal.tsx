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

const FormDisabledModal = () => {
  return (
    <Dialog defaultOpen={true}>
      <DialogContent>
        <DialogHeader>
          <Image
            src="/assets/images/dashboard/formDisabledIcon.svg"
            width={50}
            height={50}
            alt="formDisabledIcon"
            className="mx-auto"
          />

          <DialogDescription className="mt-3 text-[#101828] font-[400] text-[18px] lg:w-[80%] mx-auto text-center">
            Your form has been submitted successfully and is currently
            undergoing approval. Editing the form is{" "}
            <span className="font-[600]">no longer possible</span> at this
            stage.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-3">
          <DialogClose className="bg-[#DC6803] hover:bg-[#bc6314] text-white hover:text-white text-[14px] font-[500] rounded-[6px] border-0 outline-0 w-full py-3">
            Continue
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormDisabledModal;
