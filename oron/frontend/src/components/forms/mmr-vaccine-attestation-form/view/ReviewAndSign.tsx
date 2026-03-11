"use client";

import FormBanner from "@/components/banner/FormBanner";
import { User } from "@/types/UserTypes";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { MMRFormResponse } from "@/types/form-types/MMRFormTypes";
import Signature from "./Signature";
import { EditIcon } from "lucide-react";
import Button from "@/components/button/Button";
import { submitForm } from "@/actions/forms/submit-form";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormSuggestionDialog from "@/components/FormSuggestionDialog";

const ReviewAndSign = ({
  user,
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  method,
  refetch,
  data,
  signatureDisabled,
  status,
  refetchFormStatus,
  suggestionOpen,
  handleToggleSuggestion,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  user: User;
  method: "POST" | "PATCH";
  refetch: any;
  data: MMRFormResponse | boolean | undefined;
  signatureDisabled: boolean;
  status: FormattedFormStatus;
  refetchFormStatus: any;
  suggestionOpen: boolean;
  handleToggleSuggestion: (status: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const token = localStorage.getItem("token") as string;
  const [openModal, setOpenModal] = useState(false);

  let processedInformation: MMRFormResponse | undefined;

  if (typeof data === "boolean") {
    processedInformation = undefined;
  } else {
    processedInformation = data;
  }

  return (
    <section className="flex-1 h-fit lg:min-h-[70vh] flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      {openModal && (
        <FormSuggestionDialog
          formName="MMR Vaccine Attestation"
          openModal={openModal}
          closeModal={() => setOpenModal(false)}
          formId="mmrVaccine"
        />
      )}

      {method === "POST" && (
        <FormBanner
          variant="warning"
          text="Review your responses carefully. You will not be able to edit this form after submission"
        />
      )}

      {method === "PATCH" && (
        <FormBanner
          variant="warning"
          text="Your form has been submitted successfully and is now undergoing approval. We will notify you once the review process is complete. Please note that editing the form is no longer possible at this stage."
        />
      )}

      <Signature
        currentIndex={currentIndex}
        handleChangeIndex={handleChangeIndex}
        handleNewCompletedSection={handleNewCompletedSection}
        user={user}
        refetch={refetch}
        method={method}
        data={data}
        signatureDisabled={signatureDisabled}
        status={status}
        refetchFormStatus={refetchFormStatus}
      />

      <h2 className="text-[18px] font-[600] text-[#0F172A] mt-[5vh]">
        Review Information
      </h2>

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 h-fit py-10 p-5 rounded-[12px]">
        <div className="flex justify-between items-center flex-wrap gap-5">
          <h2 className="text-[18px] font-[600] text-[#0F172A]">Attestation</h2>
          <button
            onClick={() => handleChangeIndex(1)}
            className="text-[14px] font-[500] text-[#2563EB] flex items-center gap-1"
          >
            Edit <EditIcon className="w-4 h-4 text-[#2563EB]" />
          </button>
        </div>

        <div className="xl:w-full flex justify-between mt-5 flex-col gap-5">
          <div className="w-full flex flex-col xl:flex-row h-fit justify-between gap-7">
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Last Name (Family Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {processedInformation?.data?.mmrEmployeeInformation
                  ?.last_name ?? ""}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                First Name (Given Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {processedInformation?.data?.mmrEmployeeInformation
                  ?.first_name ?? ""}
              </p>
            </div>
          </div>

          <div className="w-full flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-3">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Please select one of the following options
              </h2>
              <ul className="text-[14px] font-[400] text-[#0F172A] list-disc ml-5">
                {processedInformation?.data.mmrAttestationForm &&
                  typeof processedInformation?.data.mmrAttestationForm ===
                    "object" &&
                  Object.keys(processedInformation?.data.mmrAttestationForm)
                    .length > 0 && (
                    <ul>
                      <li className="lg:ml-5 ml-2">
                        {Boolean(
                          processedInformation?.data.mmrAttestationForm
                            ?.do_not_think_will_contract_mumps
                        ) === true &&
                          "- I do not think I will contract measles, mumps, and/or rubella"}
                      </li>
                      <li className="lg:ml-5 ml-2">
                        {Boolean(
                          processedInformation?.data.mmrAttestationForm
                            .do_not_think_serious_disease
                        ) === true &&
                          "- I do not think these are serious illnesses"}
                      </li>
                      <li className="lg:ml-5 ml-2">
                        {Boolean(
                          processedInformation?.data.mmrAttestationForm
                            .side_effects_from_vaccine
                        ) === true &&
                          "- I had side effects after I received the vaccine in the past"}
                      </li>
                      <li className="lg:ml-5 ml-2">
                        {Boolean(
                          processedInformation?.data.mmrAttestationForm
                            .will_stay_home_if_infected
                        ) === true &&
                          "- I will stay home if I get any of these illnesses so I will not spread it to patients or colleagues past"}
                      </li>

                      <li className="lg:ml-5 ml-2">
                        {processedInformation?.data.mmrAttestationForm.other &&
                          processedInformation?.data.mmrAttestationForm.other
                            .length > 1 &&
                          processedInformation?.data.mmrAttestationForm.other}
                      </li>
                    </ul>
                  )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-5 justify-end mt-auto pt-10">
        {currentIndex !== 1 && (
          <Button
            onClick={() => handleChangeIndex(currentIndex - 1)}
            variant="light"
            type="button"
          >
            Previous Section
          </Button>
        )}

        <Button
          onClick={async () => {
            setIsLoading(true);
            const response = await submitForm(token, "mmrForm");

            refetchFormStatus();

            if (!response.status) {
              toast({
                variant: "destructive",
                description: response.errorMessage,
              });
              setIsLoading(false);
              return;
            }

            setIsLoading(false);
            handleToggleSuggestion(true);
            setOpenModal(true);
          }}
          disabled={
            signatureDisabled ||
            status === "Awaiting Approval" ||
            status === "Approved" ||
            isLoading ||
            method === "POST"
          }
          type="button"
        >
          Submit Form
        </Button>
      </div>
    </section>
  );
};

export default ReviewAndSign;
