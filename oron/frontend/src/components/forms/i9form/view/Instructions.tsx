"use client";

import { useState } from "react";
import Button from "@/components/button/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogHeader,
} from "@/components/ui/dialog";
import { INSTRUCTIONS } from "@/constants";
import Image from "next/image";
import { DotFilledIcon } from "@radix-ui/react-icons";
import { Checkbox } from "@/components/ui/checkbox";
import FormBanner from "../../../banner/FormBanner";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";

const Instructions = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  formCompleted,
  status,
  reviewNote,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  formCompleted: boolean;
  status: FormattedFormStatus;
  reviewNote: string;
}) => {
  const [instructionIndex, setInstructionIndex] = useState<number>(1);
  const instruction = INSTRUCTIONS.find(
    (instruction) => instruction.id === instructionIndex
  );
  const [showModal, setShowModal] = useState<boolean>(
    localStorage.getItem("do_not_show_instruction") !== "on"
  );

  return (
    <section className="flex-1 lg:min-h-[80vh] h-fit flex flex-col gap-10 lg:pl-10 lg:mt-0">
      {!formCompleted && (
        <Dialog onOpenChange={setShowModal} defaultOpen={showModal}>
          <DialogContent>
            {instruction && (
              <>
                <DialogHeader>
                  <Image
                    src={instruction.image}
                    width={300}
                    height={400}
                    alt="instruction"
                    className="w-full h-[200px] max-h-[200px]"
                  />
                </DialogHeader>

                <h2 className="text-[18px] font-[600] text-center text-[#101828]">
                  {instruction.title}
                </h2>
                <p className="text-[14px] font-[400] text-center text-[#475467]">
                  {instruction.description}
                </p>
                <DotFilledIcon className="w-5 h-5 text-[#1A48AD] mx-auto" />
              </>
            )}

            <DialogFooter className="w-full flex gap-5 flex-wrap md:flex-nowrap justify-between items-center mt-5">
              <DialogClose className="w-full py-[12px] bg-[#dbe0e5] hover:bg-[#bec3c8] text-black rounded-[6px]">
                Skip
              </DialogClose>

              {instructionIndex !== INSTRUCTIONS.length && (
                <button
                  className="w-full py-[8px] bg-[#2563EB] hover:bg-[#2564ebc1] text-white rounded-[6px] h-fit"
                  onClick={() => setInstructionIndex(instructionIndex + 1)}
                >
                  Next
                </button>
              )}

              {instructionIndex === INSTRUCTIONS.length && (
                <DialogClose className="w-full py-[12px] bg-[#2563EB] hover:bg-[#2564ebc1] text-white hover:text-white rounded-[6px]">
                  Start
                </DialogClose>
              )}
            </DialogFooter>
            <div className="flex items-center space-x-2 pb-2 mt-2">
              <Checkbox
                id="show"
                onCheckedChange={(e) => {
                  const isChecked = e;
                  setShowModal(!isChecked);
                  localStorage.setItem(
                    "do_not_show_instruction",
                    isChecked ? "on" : "off"
                  );
                }}
              />
              <label
                htmlFor="show"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Do not show again
              </label>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="flex flex-col gap-2 mt-[3vh]">
        {formCompleted && status !== "Correction Required" && (
          <FormBanner
            variant="success"
            text="Your i-9  form has been successfully submitted. We'll notify you once it's approved."
          />
        )}

        {status === "Correction Required" && (
          <FormBanner variant="warning" text={reviewNote} />
        )}

        <h2 className="text-[28px] font-[600] text-[#0F172A] mt-5">
          Instructions
        </h2>
        <p className="text-[16px] font-[400] text-[#334155]">
          Welcome! Ensure you read the following instructions carefully before
          completing the form:
        </p>
      </div>

      <ul className="flex flex-col gap-3 px-5 list-disc">
        <li className="text-[16px] text-[#334155] font-[400]">
          The data entered on the I-9 must match the Social Security
          Administration (SSA) and Department of Homeland Security (DHS)
          databases.
        </li>
        <li className="text-[16px] text-[#334155] font-[400]">
          When completing the name fields, enter your current legal name and any
          last names you previously used, including any hyphens or punctuation.
          If you only have one name, enter it in the Last Name field and then
          enter “Unknown” in the First Name field.
        </li>
        <li className="text-[16px] text-[#334155] font-[400]">
          Upoad the Required Documents in the Document Section
        </li>
      </ul>

      <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
        <Button
          onClick={() => handleChangeIndex(currentIndex - 1)}
          type="button"
          disabled={currentIndex === 1}
        >
          Previous Section
        </Button>

        {currentIndex !== 6 && (
          <Button
            onClick={() => {
              handleChangeIndex(currentIndex + 1);
              handleNewCompletedSection(currentIndex);
            }}
            type="button"
          >
            Next Section
          </Button>
        )}
      </div>
    </section>
  );
};

export default Instructions;
