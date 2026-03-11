"use client";

import { useState } from "react";
import Button from "@/components/button/Button";
import { EditIcon } from "lucide-react";
import { DotFilledIcon } from "@radix-ui/react-icons";
import Signature from "./Signature";
import { User } from "@/types/UserTypes";
import { useRouter } from "next/navigation";
import {
  PneumococcalVaccinationForm,
  PneumococcalSignature,
} from "@/types/form-types/PneumococcalFormTypes";
import { useToast } from "@/components/ui/use-toast";
import FormBanner from "@/components/banner/FormBanner";
import { submitForm } from "@/actions/forms/submit-form";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import FormSuggestionDialog from "@/components/FormSuggestionDialog";

const ReviewAndSign = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  method,
  user,
  formInfo,
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
  formInfo: boolean | PneumococcalVaccinationForm | undefined;
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

  let processedSignature: PneumococcalSignature | undefined;
  if (typeof formInfo === "boolean") {
    processedSignature = undefined;
  } else {
    processedSignature = formInfo?.data.signature;
  }

  let processedFormData: PneumococcalVaccinationForm | undefined;
  if (typeof formInfo === "boolean") {
    processedFormData = undefined;
  } else {
    processedFormData = formInfo;
  }

  const handleToggleSign = (status: boolean) => {};

  let vaccinationStatus: string | undefined;

  const pneumococcalVaccinationForm =
    processedFormData?.data?.pneumococcalVaccinationForm;

  if (pneumococcalVaccinationForm) {
    if (pneumococcalVaccinationForm.received_pneumococcal_vaccination) {
      vaccinationStatus =
        "I have already received the pneumococcal vaccination";
    } else if (pneumococcalVaccinationForm.medical_contraindication) {
      vaccinationStatus =
        "I have medical contraindications to receiving the pneumococcal vaccination";
    } else if (pneumococcalVaccinationForm.religious_beliefs) {
      vaccinationStatus =
        "I have personal or religious beliefs that prevent me from receiving the pneumococcal vaccination";
    } else if (pneumococcalVaccinationForm.other) {
      vaccinationStatus = pneumococcalVaccinationForm.other;
    }
  }

  return (
    <section className="flex-1 h-fit flex flex-col gap-5 lg:pl-10 lg:mt-[5vh]">
      {openModal && (
        <FormSuggestionDialog
          formName="Pneumococcal Vaccination Form"
          openModal={openModal}
          closeModal={() => setOpenModal(false)}
          formId="pneumococcalVaccination"
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

        <div className="xl:w-[80%] flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Last Name (Family Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {processedFormData?.data.employeeInformation.last_name ?? "-"}
              </p>
            </div>
          </div>

          <div className="flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                First Name (Given Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {" "}
                {processedFormData?.data.employeeInformation.first_name ?? "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 h-fit py-10 p-5 rounded-[12px]">
        <div className="flex justify-between items-center flex-wrap gap-5">
          <h2 className="text-[18px] font-[600] text-[#0F172A]">
            Pneumococcal Vaccination Information
          </h2>
          <button
            onClick={() => handleChangeIndex(2)}
            className="text-[14px] font-[500] text-[#2563EB] flex items-center gap-1"
          >
            Edit <EditIcon className="w-4 h-4 text-[#2563EB]" />
          </button>
        </div>

        {processedFormData?.data.pneumococcalVaccinationForm
          .had_pneumococcal_vaccination && (
          <h2 className="text-[17px] font-[400] text-[#0F172A]">
            <span className="font-[700]">Vaccination Attestation:</span> I have
            received the pneumococcal vaccination as recommended
          </h2>
        )}

        {processedFormData?.data.pneumococcalVaccinationForm
          .declined_pneumococcal_vaccination && (
          <>
            <h2 className="text-[17px] font-[400] text-[#0F172A]">
              <span className="font-[700]">Vaccination Declination:</span> I
              decline to receive the pneumococcal vaccination at this time for
              the following reason(s)
            </h2>

            <ul className="list-disc pl-3">
              <li className="flex items-start gap-1">
                <DotFilledIcon className="w-5 h-5 mb-1" />

                <p className="text-[14px] font-[400] text-[#0F172A]">
                  {vaccinationStatus}
                </p>
              </li>
            </ul>
          </>
        )}
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
            const response = await submitForm(token, "pneumococcalForm");

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
