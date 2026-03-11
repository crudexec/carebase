"use client";

import { useState } from "react";
import Button from "@/components/button/Button";
import Signature from "./Signature";
import {
  FluSignatureForm,
  FluVaccineFormResponse,
} from "@/types/form-types/FluVaccineFormTypes";
import { User } from "@/types/UserTypes";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import FormBanner from "@/components/banner/FormBanner";
import { EditIcon } from "lucide-react";
import { submitForm } from "@/actions/forms/submit-form";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import FormSuggestionDialog from "@/components/FormSuggestionDialog";

const ReviewAndSign = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  method,
  user,
  data,
  refetch,
  signatureDisabled,
  status,
  refetchFormStatus,
  suggestionOpen,
  handleToggleSuggestion,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  method: "POST" | "PATCH";
  user: User;
  data: boolean | FluVaccineFormResponse | undefined;
  refetch: any;
  signatureDisabled: boolean;
  status: FormattedFormStatus;
  refetchFormStatus: any;
  suggestionOpen: boolean;
  handleToggleSuggestion: (status: boolean) => void;
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const token = localStorage.getItem("token") as string;
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  let processedSignature: FluSignatureForm | undefined;
  if (typeof data === "boolean") {
    processedSignature = undefined;
  } else {
    processedSignature = data?.data.fluSignatureForm;
  }

  let processedInformation: FluVaccineFormResponse | undefined;
  if (typeof data === "boolean") {
    processedInformation = undefined;
  } else {
    processedInformation = data;
  }

  const handleToggleSign = (status: boolean) => {};

  return (
    <section className="flex-1 h-fit flex flex-col gap-5 lg:pl-10 lg:mt-[5vh]">
      {openModal && (
        <FormSuggestionDialog
          formName="Flu Vaccine Attestation and Declination"
          openModal={openModal}
          closeModal={() => setOpenModal(false)}
          formId="fluVaccine"
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
        handleNewCompletedSection={handleNewCompletedSection}
        user={user}
        method={method}
        processedSignature={processedSignature}
        refetch={refetch}
        handleToggleSign={handleToggleSign}
        signatureDisabled={signatureDisabled}
        status={status}
      />

      <h2 className="text-[18px] font-[600] text-[#0F172A] mt-[5vh]">
        Review Information
      </h2>

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
                {processedInformation?.data.fluEmployeeInformation?.last_name ??
                  "-"}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                First Name (Given Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {processedInformation?.data.fluEmployeeInformation
                  ?.first_name ?? "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 h-fit py-10 p-5 rounded-[12px]">
        <div className="flex justify-between items-center flex-wrap gap-5">
          <h2 className="text-[18px] font-[600] text-[#0F172A]">
            Vaccine Information
          </h2>
          <button
            onClick={() => handleChangeIndex(2)}
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
                {processedInformation?.data.fluAttestationForm &&
                  Object.keys(processedInformation?.data.fluAttestationForm)
                    .length > 0 &&
                  processedInformation?.data.fluAttestationForm
                    .have_received_flu_vaccine && (
                    <li>
                      Vaccination Attestation: I have received the flu vaccine
                      as recommended
                    </li>
                  )}

                {processedInformation?.data.fluAttestationForm &&
                  Object.keys(processedInformation?.data.fluAttestationForm)
                    .length > 0 &&
                  processedInformation?.data.fluAttestationForm
                    .have_received_flu_vaccine === false && (
                    <ul>
                      <p className="font-[500]">
                        Vaccination Declination:I decline to receive the flu
                        vaccine for the current flu season for the following
                        reason(s)
                      </p>
                      <li className="lg:ml-5 ml-2">
                        {Boolean(
                          processedInformation?.data.fluAttestationForm
                            .received_flu_vaccine_elsewhere
                        ) === true &&
                          "- I have already received the flu vaccine elsewhere"}
                      </li>
                      <li className="lg:ml-5 ml-2">
                        {Boolean(
                          processedInformation?.data.fluAttestationForm
                            .medical_contraindication_to_receiving_vaccine
                        ) === true &&
                          "- I have medical contraindications to receiving the flu vaccine"}
                      </li>
                      <li className="lg:ml-5 ml-2">
                        {Boolean(
                          processedInformation?.data.fluAttestationForm
                            .personal_or_religious_beliefs_preventing_vaccination
                        ) === true &&
                          "- I have personal or religious beliefs that prevent me from receiving the flu vaccine"}
                      </li>
                      <li className="lg:ml-5 ml-2">
                        {Boolean(
                          processedInformation?.data.fluAttestationForm
                            .allergic_to_vaccine_components
                        ) === true &&
                          "- I am allergic to components of the flu vaccine"}
                      </li>
                      <li className="lg:ml-5 ml-2">
                        {Boolean(
                          processedInformation?.data.fluAttestationForm
                            .concerns_about_vaccine_safety
                        ) === true &&
                          "- I have concerns about the safety or efficacy of the flu disease"}
                      </li>
                      <li className="lg:ml-5 ml-2">
                        {processedInformation?.data.fluAttestationForm.other &&
                          processedInformation?.data.fluAttestationForm.other
                            .length > 1 &&
                          processedInformation?.data.fluAttestationForm.other}
                      </li>
                    </ul>
                  )}

                {processedInformation?.data.fluAttestationForm &&
                  Object.keys(processedInformation?.data.fluAttestationForm)
                    .length < 1 && <li>-</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-5 justify-end mt-auto pt-20">
        <Button
          variant="light"
          onClick={() => handleChangeIndex(currentIndex - 1)}
          type="button"
          disabled={currentIndex === 1}
        >
          Previous Section
        </Button>

        <Button
          disabled={
            signatureDisabled ||
            status === "Awaiting Approval" ||
            status === "Approved" ||
            isLoading ||
            method === "POST"
          }
          onClick={async () => {
            setIsLoading(true);
            const response = await submitForm(token, "fluForm");

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
          type="button"
        >
          Submit
        </Button>
      </div>
    </section>
  );
};

export default ReviewAndSign;
