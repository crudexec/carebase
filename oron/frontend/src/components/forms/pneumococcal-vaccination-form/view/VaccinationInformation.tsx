"use client";

import { useState, useEffect } from "react";
import FormInput from "@/components/input-fields/FormInput";
import Button from "@/components/button/Button";
import { User } from "@/types/UserTypes";
import { capitalizeFirstLetter } from "@/utils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { handlePneumococcalVaccinationInformationFormSubmission } from "@/actions/forms";
import {
  PneumococcalVaccination,
  PneumococcalVaccinationForm,
} from "@/types/form-types/PneumococcalFormTypes";
import useCustomMutation from "@/hooks/useCustomMutation";
import FormBanner from "@/components/banner/FormBanner";

export type VaccinationInformationFormData = {
  vaccine_status: string;
  decline_reasons: string;
  other: string;
};

const VaccinationInformation = ({
  user,
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  method,
  formInfo,
  refetch,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  user: User;
  method: "POST" | "PATCH";
  formInfo: boolean | PneumococcalVaccinationForm | undefined;
  refetch: any;
}) => {
  const [userDecline, setUserDecline] = useState<boolean>(false);
  const [userSelectOther, setUserSelectOther] = useState<boolean>(false);
  const { toast } = useToast();
  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  let formDisabled: boolean = false;
  let isFormAwaitingApproval: boolean = false;

  let processedVaccinationInformation: PneumococcalVaccination | undefined;
  if (typeof formInfo === "boolean") {
    processedVaccinationInformation = undefined;
  } else {
    if (
      formInfo?.data?.status === "awaiting_approval" ||
      formInfo?.data?.status === "approved"
    ) {
      formDisabled = true;
    }
    isFormAwaitingApproval = formInfo?.data?.status === "awaiting_approval";

    processedVaccinationInformation =
      formInfo?.data.pneumococcalVaccinationForm;
  }

  useEffect(() => {
    if (processedVaccinationInformation?.declined_pneumococcal_vaccination) {
      setUserDecline(true);
    }

    if (
      processedVaccinationInformation?.other &&
      processedVaccinationInformation?.other?.length > 0
    ) {
      setUserSelectOther(true);
    }
  }, [processedVaccinationInformation]);

  const handleSubmit = async (formData: FormData) => {
    if (formDisabled) {
      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
      return;
    }

    try {
      const vaccineStatus = formData.get("vaccine_status") as string;
      const declineReason = formData.get("decline_reasons") as string;
      const other = formData.get("other") as string;

      if (vaccineStatus === null) {
        setError({
          field: ["yes", "no"],
          message: ["yes", "no"],
        });
        toast({
          variant: "destructive",
          description: "Please complete all required fields.",
        });
        return;
      }

      if (vaccineStatus === "no" && declineReason === null) {
        setError({
          field: ["reason"],
          message: ["reason"],
        });
        toast({
          variant: "destructive",
          description: "Please complete all required fields.",
        });
        return;
      }

      if (declineReason === "other" && other.length < 1) {
        setError({
          field: ["other"],
          message: ["Please input your reason"],
        });
        toast({
          variant: "destructive",
          description: "Please complete all required fields.",
        });
        return;
      }

      const data: VaccinationInformationFormData = {
        vaccine_status: vaccineStatus,
        decline_reasons: declineReason,
        other: other,
      };

      setError({
        field: [],
        message: [],
      });

      const token = localStorage.getItem("token") as string;

      const response =
        await handlePneumococcalVaccinationInformationFormSubmission(
          data,
          token,
          method
        );

      refetch();

      // Handle submission response
      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const { mutate } = useCustomMutation<FormData>(handleSubmit, [
    "pneumococcalForm",
    "formData",
    "offerLetter",
  ]);

  const getDefaultValueOne = (): string | undefined => {
    const hadPneumococcalVaccination =
      processedVaccinationInformation?.had_pneumococcal_vaccination;
    const declinedPneumococcalVaccination =
      processedVaccinationInformation?.declined_pneumococcal_vaccination;

    if (
      hadPneumococcalVaccination !== undefined &&
      hadPneumococcalVaccination === true
    ) {
      return "yes";
    } else if (
      declinedPneumococcalVaccination !== undefined &&
      declinedPneumococcalVaccination === true
    ) {
      return "no";
    } else {
      return undefined;
    }
  };

  const getDefaultValueTwo = (): string | undefined => {
    const receivedPneumococcalVaccination =
      processedVaccinationInformation?.received_pneumococcal_vaccination;
    const medicalContraindication =
      processedVaccinationInformation?.medical_contraindication;
    const religiousBeliefs = processedVaccinationInformation?.religious_beliefs;
    const other = processedVaccinationInformation?.other;

    if (receivedPneumococcalVaccination) {
      return "I have already received the pneumococcal vaccination";
    } else if (medicalContraindication) {
      return "I have medical contraindications to receiving the pneumococcal vaccination";
    } else if (religiousBeliefs) {
      return "I have personal or religious beliefs that prevent me from receiving the pneumococcal vaccination";
    } else if (other && other.length > 0) {
      return "other";
    } else {
      return "";
    }
  };

  return (
    <section className="flex-1 h-fit lg:pb-[150px] lg:min-h-[70vh] flex flex-col gap-10 lg:pl-10 mt-[5vh]">
      {isFormAwaitingApproval && (
        <FormBanner
          variant="warning"
          text="Your form has been submitted successfully and is now undergoing approval. We will notify you once the review process is complete. Please note that editing the form is no longer possible at this stage."
        />
      )}

      <div className="flex flex-col gap-5">
        <h3 className="text-[#0F172A] text-[18px] font-[600]">
          Pneumococcal Vaccination Information
        </h3>
        <p className="text-[#334155] text-[16px] font-[400]">
          I,{" "}
          <span className="font-[700]">
            {capitalizeFirstLetter(
              `${user.data.first_name} ${user.data.last_name}`
            )}
          </span>
          <span>
            , acknowledge that Creed Medical Group recommends that all employees
            receive the pneumococcal vaccination to protect against pneumococcal
            disease, as recommended by the Centers for Disease Control and
            Prevention (CDC) and other health authorities.
          </span>
        </p>
      </div>

      <form action={mutate} className="flex flex-col gap-5">
        <p className="text-[#334155] text-[14px] font-[400]">
          Please select one of the following options
        </p>

        <RadioGroup
          disabled={formDisabled}
          defaultValue={getDefaultValueOne()}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.value === "no") {
              setUserDecline(true);
            } else {
              setUserDecline(false);
            }
          }}
          name="vaccine_status"
          className="flex flex-col gap-5"
        >
          <div className="flex items-center flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="vaccine_yes" value="yes" />
              <Label
                className={`text-[16px] font-[400] text-[#09090B] ${
                  error.field.includes("yes") && "text-[#EF4444]"
                } `}
                htmlFor="vaccine_yes"
              >
                <span className="font-[700]">Vaccination Attestation:</span>I
                have received the pneumococcal vaccination as recommended
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem id="vaccine_no" value="no" />
              <Label
                className={`text-[16px] font-[400] text-[#09090B] ${
                  error.field.includes("yes") && "text-[#EF4444]"
                } `}
                htmlFor="vaccine_no"
              >
                <span className="font-[700]">Vaccination Declination:</span>I
                decline to receive the pneumococcal vaccination at this time for
                the following reason(s)
              </Label>
            </div>
          </div>
        </RadioGroup>

        {userDecline && (
          <div className="flex flex-col gap-3 xl:mt-3 xl:ml-6">
            <RadioGroup
              disabled={formDisabled}
              defaultValue={getDefaultValueTwo()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.value === "other") {
                  setUserSelectOther(true);
                } else {
                  setUserSelectOther(false);
                }
              }}
              name="decline_reasons"
              className="flex flex-col gap-5"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id="reason_1"
                  value="I have already received the pneumococcal vaccination"
                />
                <Label
                  className={`text-[16px] font-[400] text-[#09090B] ${
                    error.field.includes("reason") && "text-[#EF4444]"
                  } `}
                  htmlFor="reason_1"
                >
                  I have already received the pneumococcal vaccination
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id="reason_2"
                  value="I have medical contraindications to receiving the pneumococcal vaccination"
                />
                <Label
                  className={`text-[16px] font-[400] text-[#09090B] ${
                    error.field.includes("reason") && "text-[#EF4444]"
                  } `}
                  htmlFor="reason_2"
                >
                  I have medical contraindications to receiving the pneumococcal
                  vaccination
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id="reason_3"
                  value="I have personal or religious beliefs that prevent me from receiving the pneumococcal vaccination"
                />
                <Label
                  className={`text-[16px] font-[400] text-[#09090B] ${
                    error.field.includes("reason") && "text-[#EF4444]"
                  } `}
                  htmlFor="reason_3"
                >
                  I have personal or religious beliefs that prevent me from
                  receiving the pneumococcal vaccination
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem id="reason_4" value="other" />
                <Label
                  className={`text-[16px] font-[400] text-[#09090B] ${
                    error.field.includes("reason") && "text-[#EF4444]"
                  } `}
                  htmlFor="reason_4"
                >
                  Other
                </Label>
              </div>
            </RadioGroup>

            {userSelectOther && (
              <div className="xl:ml-5">
                <FormInput
                  disabled={formDisabled}
                  defaultValue={processedVaccinationInformation?.other ?? ""}
                  name="other"
                  placeholder="Please specify"
                  type="text"
                  labelText=""
                  isAuth={false}
                  errorMessage={error.message.find((message) =>
                    message.includes("input")
                  )}
                  isError={
                    !!error.field.find((field) => field.includes("other"))
                  }
                />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
          <Button
            onClick={() => handleChangeIndex(currentIndex - 1)}
            type="button"
            disabled={currentIndex === 1}
            variant="light"
          >
            Previous Section
          </Button>

          {currentIndex !== 4 && <Button type="submit">Next Section</Button>}
        </div>
      </form>
    </section>
  );
};

export default VaccinationInformation;
