"use client";

import FormBanner from "@/components/banner/FormBanner";
import Signature from "./Signature";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { VaricellaResponse } from "@/types/form-types/VaricellaFormTypes";
import { User } from "@/types/UserTypes";
import Button from "@/components/button/Button";
import { submitForm } from "@/actions/forms/submit-form";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditIcon } from "lucide-react";
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
  data: VaricellaResponse | boolean | undefined;
  signatureDisabled: boolean;
  status: FormattedFormStatus;
  refetchFormStatus: any;
  suggestionOpen: boolean;
  handleToggleSuggestion: (status: boolean) => void;
}) => {
  const token = localStorage.getItem("token") as string;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [openModal, setOpenModal] = useState(false);

  let processedInformation: VaricellaResponse | undefined;

  if (typeof data === "boolean") {
    processedInformation = undefined;
  } else {
    processedInformation = data;
  }

  return (
    <section className="flex-1 h-fit lg:min-h-[70vh] flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      {openModal && (
        <FormSuggestionDialog
          formName="Varicella Vaccine Attestation Form"
          openModal={openModal}
          closeModal={() => setOpenModal(false)}
          formId="varicellaVaccine"
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

        <div className="xl:w-full flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-3">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Please select one of the following options
              </h2>
              <ul className="text-[14px] font-[400] text-[#0F172A] list-disc ml-5">
                {processedInformation?.data.varicellaAttestationForm &&
                  typeof processedInformation?.data.varicellaAttestationForm ===
                    "object" &&
                  Object.keys(
                    processedInformation?.data.varicellaAttestationForm
                  ).length > 0 && (
                    <ul>
                      <li className="lg:ml-5 ml-2">
                        {Boolean(
                          processedInformation?.data.varicellaAttestationForm
                            ?.had_chicken_pox
                        ) === true && "- I already have had chickenpox"}
                      </li>
                      <li className="lg:ml-5 ml-2">
                        {Boolean(
                          processedInformation?.data.varicellaAttestationForm
                            .will_not_contract_chicken_pox
                        ) === true &&
                          "- I do not think I will contract chickenpox"}
                      </li>
                      <li className="lg:ml-5 ml-2">
                        {Boolean(
                          processedInformation?.data.varicellaAttestationForm
                            .chicken_pox_not_serious_disease
                        ) === true &&
                          "- I do not think chickenpox is a serious disease"}
                      </li>
                      <li className="lg:ml-5 ml-2">
                        {Boolean(
                          processedInformation?.data.varicellaAttestationForm
                            .side_effects_from_chicken_pox_vaccine
                        ) === true &&
                          "- I had side effects when I was vaccinated against chickenpox in the past"}
                      </li>
                      <li className="lg:ml-5 ml-2">
                        {Boolean(
                          processedInformation?.data.varicellaAttestationForm
                            .will_stay_home_if_infected
                        ) === true &&
                          "- I will stay home if I get chickenpox so I will not spread it to patients or colleagues"}
                      </li>
                      <li className="lg:ml-5 ml-2">
                        {processedInformation?.data.varicellaAttestationForm
                          .other &&
                          processedInformation?.data.varicellaAttestationForm
                            .other.length > 1 &&
                          processedInformation?.data.varicellaAttestationForm
                            .other}
                      </li>
                    </ul>
                  )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 h-fit py-10 p-5 rounded-[12px]">
        <div className="flex justify-between items-center flex-wrap gap-5">
          <h2 className="text-[18px] font-[600] text-[#0F172A]">
            Employee Information
          </h2>
          <button
            onClick={() => handleChangeIndex(1)}
            className="text-[14px] font-[500] text-[#2563EB] flex items-center gap-1"
          >
            Edit <EditIcon className="w-4 h-4 text-[#2563EB]" />
          </button>
        </div>

        <div className="xl:w-full flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Last Name (Family Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {processedInformation?.data?.varicellaEmployeeInformation
                  ?.last_name ?? ""}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                First Name (Given Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {processedInformation?.data?.varicellaEmployeeInformation
                  ?.first_name ?? ""}
              </p>
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
            const response = await submitForm(token, "varicellaForm");

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
