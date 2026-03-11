"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import { FORMS } from "@/constants";

interface Props {
  formName: string;
  openModal: boolean;
  closeModal: () => void;
  formId?: string;
  nextFormUrl?: string;
  nextFormName?: string;
}

const FormSuggestionDialog = ({
  formName,
  formId,
  openModal,
  closeModal,
  nextFormUrl,
  nextFormName,
}: Props) => {
  const getNextFormRoute = (currentFormId: string = formId!): string => {
    const currentIndex = FORMS.findIndex((form) => form.id === currentFormId);
    if (currentIndex >= 0 && currentIndex < FORMS.length - 1) {
      return FORMS[currentIndex + 1].route;
    }
    return "";
  };

  const getNextFormName = (currentFormId: string = formId!): string => {
    const currentIndex = FORMS.findIndex((form) => form.id === currentFormId);
    if (currentIndex >= 0 && currentIndex < FORMS.length - 1) {
      return FORMS[currentIndex + 1].formName;
    }
    return "";
  };

  return (
    <Dialog open={openModal} onOpenChange={closeModal}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[12px] flex flex-col gap-5"
      >
        <Image
          src="/assets/images/dashboard/checkmark.svg"
          width={50}
          height={50}
          alt="checkmark"
          className="mx-auto"
        />

        <h2 className="text-[18px] w-full font-[600] text-[#101828] text-center">
          {formName} Submitted Successfully
        </h2>

        <p className="text-[#475467] text-[14px] font-[400] text-center">
          The next form in the onboarding process is:{" "}
          <span className="font-[700]">
            {nextFormName ?? getNextFormName(formId)}
          </span>
          . Would you like to proceed to this form now?
        </p>

        <div className="flex items-center gap-5 lg:flex-nowrap flex-wrap mt-5">
          <a
            href="/onboarding/form"
            onClick={(e) => {
              closeModal();
            }}
            className="w-full text-[14px] h-fit bg-[#e1e1e1] rounded-[6px] px-5 py-3 text-black disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 text-center justify-center"
          >
            Complete Later
          </a>

          <a
            href={nextFormUrl ?? getNextFormRoute(formId)}
            onClick={(e) => {
              closeModal();
            }}
            className="w-full text-[14px] h-fit bg-[#2563EB] hover:bg-[#2b5dca] rounded-[6px] px-5 py-3 text-white disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center text-center justify-center"
          >
            Continue to Next Form
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormSuggestionDialog;
