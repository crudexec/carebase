"use client";

import { TreatmentPlan, TreatmentPlanBasicInformation } from "@/types/Events";
import Button from "@/components/button/Button";
import FormInput from "@/components/input-fields/FormInput";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import useCustomMutation from "@/hooks/useCustomMutation";
import { handleDocumentUpload } from "@/actions/upload";
import ConfirmSubmissionModal from "./ConfirmSubmissionModal";
import SendTreatmentPlanModal from "./SendTreatmentPlanModal";
import { useMutation } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import {
  completeTreatmentplan,
  signTreatmentPlan,
} from "@/actions/clients/treatment-plan/signature";
import { TreatmentPlanType } from "./TreatmentPlanWrapper";
import { z } from "zod";
import FormBanner from "@/components/banner/FormBanner";

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  treatmentPlanData: TreatmentPlan | undefined;
  clientId: string;
  refetchTreatmentPlan: any;
  username: string;
  formType: TreatmentPlanType;
  formId: string;
}

const adminSignatureSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

type AdminSignatureFormData = z.infer<typeof adminSignatureSchema>;

const Signature = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  treatmentPlanData,
  clientId,
  refetchTreatmentPlan,
  username,
  formType,
  formId,
}: Props) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSavingToDraft, setIsSavingToDraft] = useState(false);

  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [imageURL, setImageURL] = useState("");

  const token = localStorage.getItem("token") as string;
  const [isConfirmTreatmentPlanModalOpen, setIsConfirmTreatmentPlanModalOpen] =
    useState(false);
  const [isSendTreatmentPlanModalOpen, setIsSendTreatmentPlanModalOpen] =
    useState(false);
  const [basicInformation, setBasicInformation] =
    useState<TreatmentPlanBasicInformation>();

  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const mode = searchParams.get("mode");
  const isFormDisabled = mode === "view";

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<AdminSignatureFormData>({
    resolver: zodResolver(adminSignatureSchema),
    disabled: isFormDisabled,
  });

  useEffect(() => {
    if (!treatmentPlanData) return;

    const treatmentPlanArray = treatmentPlanData.data?.treatmentPlans;
    const data = treatmentPlanArray.find((item) => item.id === formId)!;
    const {
      basicInformation,
      treatmentGoal,
      treatmentSchedule,
      treatmentGoalSignature,
    } = data;

    if (
      treatmentGoalSignature &&
      Object.keys(treatmentGoalSignature)?.length > 0
    ) {
      setImageURL(treatmentGoalSignature?.signature_url ?? "");

      setValue("name", treatmentGoalSignature?.full_name ?? "");
    }

    if (basicInformation) {
      setBasicInformation(basicInformation);
    }

    const hasCompletedTreatmentPlan =
      basicInformation &&
      treatmentSchedule?.[0] &&
      treatmentGoal.length > 0 &&
      treatmentGoalSignature;

    if (hasCompletedTreatmentPlan && action === "send_treatment_plan") {
      setIsSendTreatmentPlanModalOpen(true);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");

      const newUrl = `${window.location.pathname}?${params.toString()}`;

      router.replace(newUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treatmentPlanData]);

  const handleCompleteTreatmentPlan = async () => {
    try {
      if (!imageURL && !isSavingToDraft) {
        toast({
          variant: "destructive",
          description: "Error with signature",
        });
      }

      const treatmentPlanArray = treatmentPlanData?.data?.treatmentPlans || [];
      const data = treatmentPlanArray.find((item) => item.id === formId)!;
      const treatmentPlanId = data?.id ?? "";

      const res = await signTreatmentPlan(
        token,
        imageURL,
        getValues().name,
        treatmentPlanId,
        clientId,
        formType
      );

      if (!isSavingToDraft) {
        if (res.status) {
          const completeFormresponse = await completeTreatmentplan(
            token,
            treatmentPlanId,
            formType
          );

          if (!completeFormresponse.status) {
            toast({
              variant: "destructive",
              description: completeFormresponse.errorMessage,
            });
            return;
          }
          toast({
            variant: "success",
            description: `Treatment plan created successfully for ${username}`,
          });

          return true;
        } else {
          toast({
            variant: "destructive",
            description: res.errorMessage,
          });
          return false;
        }
      }
    } catch (error) {
      console.error("ERROR COMPLETING TREATMENT PLAN", error);
    }
  };
  const { mutate: submitSign, isPending: isCompletingFormLoading } =
    useMutation({
      mutationFn: async () => await handleCompleteTreatmentPlan(),
      onSuccess: () => {
        if (isSavingToDraft) {
          toast({
            variant: "success",
            description: "Draft saved successfully",
          });
        } else {
          setIsConfirmTreatmentPlanModalOpen(false);
          setIsSendTreatmentPlanModalOpen(true);
          handleNewCompletedSection(4);
          refetchTreatmentPlan();
        }
      },
    });

  const { mutate, isPending } = useCustomMutation(async (imageURL: string) => {
    const base64Response = await fetch(imageURL);
    const blob = await base64Response.blob();
    const file = new File([blob], "signature.png", { type: "image/png" });

    const form = new FormData();
    form.append("file", file);

    const generatedFileUrl = await handleDocumentUpload(form, token);

    if (generatedFileUrl) {
      setImageURL(generatedFileUrl);
    } else {
      toast({
        description: "Signing failed",
        variant: "destructive",
      });
    }
  }, []);

  const clearSignature = () => {
    signatureRef.current?.clear();
    setImageURL("");
  };

  const saveSignature = async () => {
    const canvasData = signatureRef.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");

    try {
      if (!canvasData || canvasData.length < 500) {
        toast({
          description: "Please sign the field",
          variant: "destructive",
        });

        return;
      }

      setImageURL(canvasData);
      mutate(canvasData);

      setIsOpen(false);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const onSubmit: SubmitHandler<any> = async (data) => {
    setIsSavingToDraft(false);

    if (!imageURL) {
      toast({
        description: "Please Sign",
        variant: "destructive",
      });
      return;
    }

    const treatmentPlanArray = treatmentPlanData?.data?.treatmentPlans || [];
    const treatmentData = treatmentPlanArray.find(
      (item) => item.id === formId
    )!;

    if (
      treatmentData?.basicInformation?.id &&
      treatmentData?.treatmentGoal &&
      Array.isArray(treatmentData?.treatmentGoal) &&
      treatmentData?.treatmentGoal?.length > 0
    ) {
      setIsConfirmTreatmentPlanModalOpen(true);
    } else {
      toast({
        description: "Please fill Basic information form",
        variant: "destructive",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[5vh]"
    >
      <FormBanner text="All fields must be filled in unless marked as optional" />
      <div className="flex flex-col gap-1">
        <h3
          data-testid="signature-header"
          className="text-[#0F172A] text-[24px] font-[600]"
        >
          Signature
        </h3>

        <div className="mt-3">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                // disabled={isFormDisabled}
                placeholder="Enter your full name here"
                type="text"
                labelText="Name of the person who created the Treatment Plan"
                isAuth={false}
                isError={Boolean(errors.name?.message)}
                errorMessage={errors.name?.message}
                data-testid="full-name-input"
              />
            )}
          />
        </div>
        <div className="mt-6">
          <p className="text-[#0F172A] text-[18px] font-[600]">Signature</p>
          <p className="text-[14px] font-[400] text-[#334155] my-2">
            By signing, you confirm that the treatment plan has been reviewed
            and all information is accurate to the best of your knowledge.
          </p>

          <Dialog onOpenChange={setIsOpen} open={isOpen}>
            {!imageURL && !isPending && (
              <DialogTrigger
                // disabled={signatureDisabled}
                onClick={() => setIsOpen(true)}
                className="flex justify-start mt-5"
                data-testid="signature-trigger"
              >
                <Button
                  // disabled={signatureDisabled}
                  type="button"
                >
                  Sign Treatment Plan
                </Button>
              </DialogTrigger>
            )}

            {imageURL && !isPending && (
              <button
                type="button"
                data-testid="signature-success"
                className="bg-[#039855] w-fit h-fit rounded-[6px] p-[12px] text-white flex items-center gap-5"
              >
                <CheckCircle /> Form Signed Successfully
              </button>
            )}

            {isPending && (
              <button
                type="button"
                data-testid="signature-loading"
                className="bg-[#cea42f] w-fit h-fit rounded-[6px] p-[12px] text-white flex items-center gap-5"
              >
                <Loader height="h-fit" />
              </button>
            )}

            <DialogContent
              data-testid="signature-dialog"
              className="flex flex-col w-full gap-6 justify-center items-center bg-[#0F172A] border-none xl:min-w-[640px]"
            >
              <DialogHeader className="mr-auto">
                <h2
                  data-testid="signature-dialog-title"
                  className="text-white text-[18px] font-[600] mr-auto"
                >
                  Sign here
                </h2>
              </DialogHeader>

              <div
                data-testid="signature-canvas-container"
                className="w-full p-5 flex flex-col gap-5 h-[300px] bg-white active:bg-white"
              >
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: "sigCanvas bg-white h-[200px] w-full",
                  }}
                  data-testid="signature-canvas"
                />

                <hr className="w-full border-[0.5px] border-gray-300" />

                <button
                  data-testid="clear-signature"
                  onClick={clearSignature}
                  className="w-fit text-[#EF4444] hover:text-[#ad4444] disabled:cursor-not-allowed text-[14px] ml-auto"
                >
                  Clear
                </button>
              </div>

              <DialogFooter className="mt-5 flex justify-center md:justify-start items-center gap-3 ml-auto">
                <DialogClose
                  data-testid="cancel-signature"
                  onClick={() => setIsOpen(false)}
                  className="h-fit py-3 m-0 bg-[#0F172A] border-none hover:bg-[#0F172A]"
                >
                  <p className="text-[#2563EB] text-[14px] font-[500]">
                    Cancel
                  </p>
                </DialogClose>

                <button
                  data-testid="save-signature"
                  className="px-5 py-3 text-white bg-[#2563EB] hover:bg-[#2564ebd9] disabled:cursor-not-allowed rounded-[6px] h-fit w-fit text-[14px] font-[400] active:bg-[#4274e0f3]"
                  onClick={saveSignature}
                  type="button"
                >
                  {imageURL ? "Update Signature" : "Add Signature"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {imageURL && imageURL?.length > 1 && (
          <div
            data-testid="signature-preview"
            className="flex flex-col gap-5 w-[250px] h-[200px] mt-5"
          >
            <button
              type="button"
              data-testid="edit-signature"
              disabled={isFormDisabled}
              onClick={() => setIsOpen(true)}
              className="flex w-fit h-fit text-white ml-auto justify-end rounded-full bg-[#18181B] p-2 disabled:cursor-not-allowed"
            >
              <Edit className="w-3 h-3" />
            </button>

            <Image
              src={imageURL}
              width={200}
              height={200}
              alt="signature"
              className="w-[200px] h-[150px]"
              data-testid="signature-image"
            />
          </div>
        )}
      </div>
      <ConfirmSubmissionModal
        isConfirmTreatmentPlanModalOpen={isConfirmTreatmentPlanModalOpen}
        setIsConfirmTreatmentPlanModalOpen={setIsConfirmTreatmentPlanModalOpen}
        clientName={`${basicInformation?.participant_first_name} ${basicInformation?.participant_last_name}`}
        submitSign={submitSign}
        isCompletingFormLoading={isCompletingFormLoading}
      />
      <SendTreatmentPlanModal
        isSendTreatmentPlanModalOpen={isSendTreatmentPlanModalOpen}
        setIsSendTreatmentPlanModalOpen={setIsSendTreatmentPlanModalOpen}
        clientName={`${basicInformation?.participant_first_name} ${basicInformation?.participant_last_name}`}
        formType={formType}
        formId={formId}
      />
      <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
        <Button
          variant="light"
          onClick={() => handleChangeIndex(currentIndex - 1)}
          type="button"
          disabled={currentIndex === 1}
          data-testid="previous-section-button"
        >
          <DoubleArrowLeftIcon className="w-5 h-5" />
          Previous Section
        </Button>

        {!isFormDisabled && (
          <Button
            isLoading={isCompletingFormLoading}
            variant="light"
            type="button"
            onClick={async () => {
              setIsSavingToDraft(true);
              submitSign();
            }}
            data-testid="save-draft-button"
          >
            Save Draft
          </Button>
        )}

        {isFormDisabled ? (
          <Button
            type="button"
            onClick={() => {
              router.push(`/admin/clients/${clientId}?tab=${formType}`);
            }}
            data-testid="finalize-button"
          >
            Finalize <DoubleArrowRightIcon className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            disabled={!imageURL || isPending}
            type="submit"
            isLoading={isCompletingFormLoading}
            data-testid="finalize-button"
          >
            Finalize <DoubleArrowRightIcon className="w-5 h-5" />
          </Button>
        )}
      </div>
    </form>
  );
};

export default Signature;
