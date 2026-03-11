"use client";

import { useState } from "react";
import Signature from "./Signature";
import { HepatitisResponse } from "@/types/form-types/HepatitisFormTypes";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { User } from "@/types/UserTypes";
import FormBanner from "@/components/banner/FormBanner";
import Button from "@/components/button/Button";
import { submitForm } from "@/actions/forms/submit-form";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { EditIcon } from "lucide-react";
import FormSuggestionDialog from "@/components/FormSuggestionDialog";

const ReviewAndSign = ({
  user,
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  data,
  method,
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
  user: User;
  data: HepatitisResponse | boolean | undefined;
  method: "POST" | "PATCH";
  refetch: any;
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

  let processedInformation: HepatitisResponse | undefined;

  if (typeof data === "boolean") {
    processedInformation = undefined;
  } else {
    processedInformation = data;
  }

  return (
    <section className="flex-1 h-fit flex flex-col gap-5 lg:pl-10 lg:mt-[5vh]">
      {openModal && (
        <FormSuggestionDialog
          formName="Hepatitis B Vaccination Attestation"
          openModal={openModal}
          closeModal={() => setOpenModal(false)}
          formId="hepatitisVaccination"
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
        handleChangeIndex={handleChangeIndex}
        handleNewCompletedSection={handleNewCompletedSection}
        user={user}
        refetch={refetch}
        method={method}
        data={data}
        currentIndex={currentIndex}
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

              {processedInformation?.data?.attestationInformation &&
                typeof processedInformation?.data?.attestationInformation ===
                  "object" &&
                Object.keys(processedInformation?.data?.attestationInformation)
                  .length > 0 && (
                  <ul>
                    <li className="lg:ml-5 ml-2">
                      {Boolean(
                        processedInformation?.data?.attestationInformation
                          ?.had_hepatitis_b_vaccine_series_of_three
                      ) === true &&
                        "I have already had the Hepatitis B vaccination series of 3 vaccines."}
                    </li>

                    <li className="lg:ml-5 ml-2">
                      {Boolean(
                        processedInformation?.data?.attestationInformation
                          ?.arranged_for_hepatitis_b_vaccine_series_of_three
                      ) === true &&
                        "I will make arrangements with my health care provider to get the Hepatitis B series of 3 vaccines."}
                    </li>

                    <li className="lg:ml-5 ml-2">
                      {Boolean(
                        processedInformation?.data?.attestationInformation
                          ?.declined_hepatitis_b_vaccine_series_of_three
                      ) === true &&
                        "I understand that due to my occupational exposure to blood or other potentially infectious materials that I may be at risk of acquiring Hepatitis B virus (HBV) infection. I have been given the opportunity to be vaccinated with the Hepatitis B vaccine, at no charge to myself. However, I decline the Hepatitis B vaccination at this time. I understand that by declining this vaccine, I continue to be at risk of acquiring the Hepatitis B infection, a serious disease. If in the future, I continue to have occupational exposure to blood or other potentially infectious materials and I change my mind."}
                    </li>
                  </ul>
                )}
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
            onClick={() => handleChangeIndex(2)}
            className="text-[14px] font-[500] text-[#2563EB] flex items-center gap-1"
          >
            Edit <EditIcon className="w-4 h-4 text-[#2563EB]" />
          </button>
        </div>

        <div className="xl:w-full flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex flex-col h-fit gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Last Name (Family Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {processedInformation?.data?.personalInformation?.last_name ??
                  ""}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                First Name (Given Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {processedInformation?.data?.personalInformation?.first_name ??
                  ""}
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
            const response = await submitForm(token, "hepatitisBForm");

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
