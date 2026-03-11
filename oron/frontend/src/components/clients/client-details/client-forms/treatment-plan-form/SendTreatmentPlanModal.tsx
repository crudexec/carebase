"use client";

import Button from "@/components/button/Button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  retrieveClientById,
  retrieveClientTreatmentPlan,
} from "@/use-cases/clients";
import { useQuery } from "@tanstack/react-query";
import { FullIntakeType, IntakeType } from "@/types/IntakeForm";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Loader from "@/components/Loader";
import { Label } from "@/components/ui/label";
import FormInput from "@/components/input-fields/FormInput";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useToast } from "@/components/ui/use-toast";
import { handleSendTreatmentPlanToParent } from "@/actions/clients/client";
import { TreatmentPlan } from "@/types/Events";
import { TreatmentPlanType } from "./TreatmentPlanWrapper";
import { getTreatmentPlanQueryKey } from "@/utils/treatmentPlanHelpers";

interface Props {
  isSendTreatmentPlanModalOpen: boolean;
  setIsSendTreatmentPlanModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  clientName: string;
  formType: TreatmentPlanType;
  formId: string;
}

const schema = z
  .object({
    recipient: z.enum(["mother", "father", "other"]),
    parentName: z.string().optional(),
    parentEmailAddress: z.string().optional(),
    relationToParticipant: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validation for the 'other' recipient
    if (data.recipient === "other") {
      if (!data.parentName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["parentName"],
          message: "Please enter parent's name when 'Other' is selected",
        });
      }
      if (!data.parentEmailAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["parentEmailAddress"],
          message:
            "Please enter a valid email address when 'Other' is selected",
        });
      } else if (
        !z.string().email().safeParse(data.parentEmailAddress).success
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["parentEmailAddress"],
          message: "Please enter a valid email address",
        });
      }

      if (!data.relationToParticipant) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["relationToParticipant"],
          message: "Please enter the relation when 'Other' is selected",
        });
      }
    }
  });

export type SendTreatmentPlanFormSchema = z.infer<typeof schema>;

const StepOne = ({
  setIsSendTreatmentPlanModalOpen,
  setSteps,
  clientName,
}: {
  setIsSendTreatmentPlanModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setSteps: Dispatch<SetStateAction<number>>;
  clientName: string;
}) => {
  return (
    <div className="w-full h-fit flex flex-col gap-3 justify-center items-center">
      <Image
        src="/assets/images/dashboard/checkmark.svg"
        width={60}
        height={60}
        alt="checkmark icon"
      />

      <h2 className="text-[#101828] text-[18px] font-[600] px-5 text-center mt-3">
        Treatment plan successfully signed and completed. Would you like to send
        it to {clientName}&apos;s parent for their signature?
      </h2>

      <div className="w-full flex items-center justify-between flex-wrap xl:flex-nowrap gap-3 mt-6">
        <Button
          data-testid="send-later-button"
          onClick={() => setIsSendTreatmentPlanModalOpen(false)}
          className="w-full"
          type="button"
          variant="light"
        >
          Later
        </Button>
        <Button
          data-testid="send-now-button"
          onClick={() => setSteps(2)}
          className="w-full"
          type="button"
        >
          Yes, Send Now
        </Button>
      </div>
    </div>
  );
};

const StepTwo = ({
  setIsSendTreatmentPlanModalOpen,
  user,
  isLoading,
  formId,
  clientId,
  formType,
}: {
  setIsSendTreatmentPlanModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  user: IntakeType | undefined;
  isLoading: boolean;
  formId: string;
  clientId: string;
  formType: TreatmentPlanType;
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<SendTreatmentPlanFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      recipient: "mother",
      parentName: "",
      parentEmailAddress: "",
      relationToParticipant: "",
    },
  });

  const recipient = watch("recipient");

  const onSubmit = async (data: SendTreatmentPlanFormSchema) => {
    try {
      let selectedParentName = "";
      let selectedParentEmail = "";
      let selectedParentRelationToParticipant = "";

      if (data.recipient === "mother") {
        selectedParentName = `${user?.motherContactInformation?.first_name} ${user?.motherContactInformation?.last_name}`;
        selectedParentEmail = user?.motherContactInformation?.email ?? "-";
        selectedParentRelationToParticipant = "Mother";
      } else if (data.recipient === "father") {
        selectedParentName = `${user?.fatherContactInformation?.first_name} ${user?.fatherContactInformation?.last_name}`;
        selectedParentEmail = user?.fatherContactInformation?.email ?? "-";
        selectedParentRelationToParticipant = "Father";
      } else if (data.recipient === "other") {
        selectedParentName = data.parentName!;
        selectedParentEmail = data.parentEmailAddress ?? "-";
        selectedParentRelationToParticipant = data.relationToParticipant ?? "-";
      }

      const token = localStorage.getItem("token") as string;
      const response = await handleSendTreatmentPlanToParent(
        selectedParentName,
        selectedParentEmail,
        selectedParentRelationToParticipant,
        user?.id!,
        formId,
        token,
        formType
      );

      if (!response.status) {
        return toast({
          variant: "destructive",
          description: response.errorMessage,
        });
      }

      toast({
        description: (
          <>
            The treatment plan has been successfully sent to{" "}
            <strong>{selectedParentName}</strong>. The parent has 48 hours to
            complete their signature.
          </>
        ),
      });

      setIsSendTreatmentPlanModalOpen(false);
      router.push(`/admin/clients/${clientId}?tab=${formType}`);
    } catch (error) {
      console.error("ERROR SENDING TREATMENT PLAN", error);
    }
  };

  const handleSendTreatmentPlan = handleSubmit(onSubmit);

  const isMotherDisabled = !user?.motherContactInformation?.email;
  const isFatherDisabled = !user?.fatherContactInformation?.email;

  const handleRecipientChange = (value: "mother" | "father" | "other") => {
    setValue("recipient", value);
  };

  if (isLoading) {
    return <Loader height="h-full" />;
  }

  return (
    <div className="w-full h-fit flex flex-col gap-3">
      <h2 className="text-[#101828] text-[18px] font-[600] text-center">
        Select Recipient
      </h2>

      <p className="text-[#475467] text-[14px] font-[400] px-5 text-center mt-5">
        Please choose the contact you wish to send the treatment plan to and
        confirm their email address.
      </p>

      <Controller
        name="recipient"
        control={control}
        render={({ field }) => (
          <RadioGroup
            onValueChange={handleRecipientChange}
            value={field.value}
            className="flex flex-col gap-5"
            data-testid="radio-group-recipent"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="mother"
                value="mother"
                disabled={isMotherDisabled}
                data-testid="radio-item-recipent-mother"
              />
              <Label
                className={clsx(
                  "text-[16px] font-[700] text-[#334155]",
                  errors.recipient && "text-red-500"
                )}
                htmlFor="mother"
              >
                Mother -{" "}
                <span className="font-[300]">
                  {isMotherDisabled
                    ? "Email not available."
                    : user?.motherContactInformation?.email}
                </span>
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="father"
                value="father"
                disabled={isFatherDisabled}
                data-testid="radio-item-recipent-father"
              />
              <Label
                className={clsx(
                  "text-[16px] font-[700] text-[#334155]",
                  errors.recipient && "text-red-500"
                )}
                htmlFor="father"
              >
                Father -{" "}
                <span className="font-[300]">
                  {isFatherDisabled
                    ? "Email not available."
                    : user?.fatherContactInformation?.email}
                </span>
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem
                id="other"
                value="other"
                data-testid="radio-item-recipent-other"
              />
              <Label
                className={clsx(
                  "text-[16px] font-[400] text-[#09090B]",
                  errors.recipient && "text-red-500"
                )}
                htmlFor="other"
              >
                Other
              </Label>
            </div>
          </RadioGroup>
        )}
      />
      {errors.recipient && (
        <p className="text-red-500">{errors.recipient.message}</p>
      )}

      {recipient === "other" && (
        <div className="flex flex-col gap-5">
          <Controller
            name="parentName"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                type="text"
                placeholder="Enter parent's name"
                labelText="Parent's Name"
                isError={!!errors.parentName}
                errorMessage={errors.parentName?.message}
                data-testid="parent-name-input"
              />
            )}
          />

          <Controller
            name="parentEmailAddress"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                type="email"
                placeholder="Enter parent's email address here"
                labelText="Parent's Email Address"
                isError={!!errors.parentEmailAddress}
                errorMessage={errors.parentEmailAddress?.message}
                data-testid="parent-email-input"
              />
            )}
          />

          <Controller
            name="relationToParticipant"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                type="text"
                placeholder="Enter relation here"
                labelText="Relation To Participant"
                isError={!!errors.relationToParticipant}
                errorMessage={errors.relationToParticipant?.message}
                data-testid="parent-relationship-input"
              />
            )}
          />
        </div>
      )}

      <div className="w-full flex items-center justify-between flex-wrap xl:flex-nowrap gap-3 mt-6">
        <Button
          onClick={() => setIsSendTreatmentPlanModalOpen(false)}
          className="w-full"
          type="button"
          variant="light"
          disabled={isSubmitting}
          data-testid="cancel-send-form-button"
        >
          Cancel
        </Button>
        <Button
          className="w-full"
          type="button"
          onClick={handleSendTreatmentPlan}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          data-testid="send-form-button"
        >
          Send Treatment Plan
        </Button>
      </div>
    </div>
  );
};

const SendTreatmentPlanModal = ({
  isSendTreatmentPlanModalOpen,
  setIsSendTreatmentPlanModalOpen,
  clientName,
  formType,
  formId,
}: Props) => {
  const [steps, setSteps] = useState(1);
  const { clientId } = useParams<{ clientId: string }>();
  const token = localStorage.getItem("token") as string;

  const { data, isLoading } = useQuery<FullIntakeType>({
    queryKey: ["clientDetail", clientId],
    queryFn: async () => await retrieveClientById(token, clientId),
    enabled: steps === 2,
  });

  const user = data?.data[0];

  return (
    <Dialog
      open={isSendTreatmentPlanModalOpen}
      onOpenChange={setIsSendTreatmentPlanModalOpen}
    >
      <DialogContent
        data-testid="send-form-dialog"
        className="flex flex-col w-full gap-2 justify-center items-center bg-white border-none xl:min-w-[540px]"
      >
        {steps === 1 && (
          <StepOne
            setIsSendTreatmentPlanModalOpen={setIsSendTreatmentPlanModalOpen}
            setSteps={setSteps}
            clientName={clientName}
          />
        )}
        {steps === 2 && (
          <StepTwo
            setIsSendTreatmentPlanModalOpen={setIsSendTreatmentPlanModalOpen}
            user={user}
            isLoading={isLoading}
            formId={formId}
            clientId={clientId}
            formType={formType}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SendTreatmentPlanModal;
