"use client";

import { useState } from "react";
import Button from "@/components/button/Button";
import Signature from "./Signature";
import { TBFormResponse } from "@/types/form-types/TBFormTypes";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import FormBanner from "@/components/banner/FormBanner";
import { EditIcon } from "lucide-react";
import { submitForm } from "@/actions/forms/submit-form";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { formatDate } from "@/utils";
import FormSuggestionDialog from "@/components/FormSuggestionDialog";

const ReviewAndSign = ({
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
  data: boolean | TBFormResponse | undefined;
  method: "POST" | "PATCH";
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

  let tbFormInfo: TBFormResponse | undefined;
  if (typeof data === "boolean") {
    tbFormInfo = undefined;
  } else {
    tbFormInfo = data;
  }

  const renderResponse = (response: boolean | string | undefined) => {
    if (response === null || response === undefined) return "-";
    return response ? "Yes" : "No";
  };

  const renderDate = (date: string | undefined | null) => {
    return date ? formatDate(new Date(date)) : "-";
  };

  const renderSymptoms = (data: any) => {
    const symptoms = [
      data?.coughing_blood && "Coughing up blood",
      data?.profuse_night_sweats && "Profuse night sweats",
      data?.loss_of_appetite && "Loss of appetite",
      data?.unexplained_weight_loss && "Unexplained weight loss",
      data?.chill_or_fever && "Chills and/or fever",
      data?.persistent_cough_last_two_weeks &&
        "A persistent cough for longer than 2 weeks",
      data?.chest_pain &&
        "Recurring, dull, tightness or aching pain in the chest Coughing up blood",
    ];
    return symptoms.filter(Boolean).join(", ") || "-";
  };

  return (
    <section className="flex-1 h-fit flex flex-col gap-5 lg:pl-10 mt-[5vh]">
      {openModal && (
        <FormSuggestionDialog
          formName="Tuberculosis Screening"
          openModal={openModal}
          closeModal={() => setOpenModal(false)}
          formId="tbForm"
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
        data={data}
        method={method}
        refetch={refetch}
        signatureDisabled={signatureDisabled}
        status={status}
      />

      <h2 className="text-[18px] font-[600] text-[#0F172A] mt-[5vh]">
        Review Information
      </h2>

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 h-fit py-10 p-5 rounded-[12px]">
        <div className="flex justify-between items-center flex-wrap gap-5">
          <h2 className="text-[18px] font-[600] text-[#0F172A]">
            Risk Assessment
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
                Have you ever had Tuberculosis?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderResponse(
                  tbFormInfo?.data.tuberculosisMantouxRiskAssessmentForm
                    .had_tb_infection
                )}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">When?</h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderDate(
                  tbFormInfo?.data.tuberculosisMantouxRiskAssessmentForm
                    .had_tb_infection_date
                )}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Have you ever had a positive reaction to a TB skin test?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderResponse(
                  tbFormInfo?.data.tuberculosisMantouxRiskAssessmentForm
                    .had_positive_tb_skin_test
                )}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">When?</h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderDate(
                  tbFormInfo?.data.tuberculosisMantouxRiskAssessmentForm
                    .had_positive_tb_skin_test_date
                )}
              </p>
            </div>
          </div>

          <div className="w-full flex h-fit flex-col gap-7">
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Have you ever been immunized against TB with BCG or other serum?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderResponse(
                  tbFormInfo?.data.tuberculosisMantouxRiskAssessmentForm
                    .have_you_been_immunized_with_bcg_vaccine
                )}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Have you had any type of vaccine within the past TWO weeks?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderResponse(
                  tbFormInfo?.data.tuberculosisMantouxRiskAssessmentForm
                    .vaccine_past_two_weeks
                )}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Have you taken steriods of any kind during the last 4 weeks?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderResponse(
                  tbFormInfo?.data.tuberculosisMantouxRiskAssessmentForm
                    .steriod_injection_past_two_weeks
                )}
              </p>
            </div>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Have you had a known exposure to TB since your last TB test?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderResponse(
                  tbFormInfo?.data.tuberculosisMantouxRiskAssessmentForm
                    .exposure_to_tb_past_two_weeks
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex h-fit flex-col gap-7">
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Do you have any of the following symptoms?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderSymptoms(
                  tbFormInfo?.data.tuberculosisMantouxRiskAssessmentForm
                )}
              </p>
            </div>
          </div>

          <div className="w-full flex h-fit flex-col gap-7">
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                What date was your last chest X-Ray?
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {renderDate(
                  tbFormInfo?.data.tuberculosisMantouxRiskAssessmentForm
                    .last_chest_xray_date
                )}
              </p>
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
            const response = await submitForm(token, "tuberculosisForm");

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
