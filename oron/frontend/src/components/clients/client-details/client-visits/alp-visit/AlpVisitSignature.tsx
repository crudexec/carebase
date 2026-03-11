"use client";

import Button from "@/components/button/Button";
import FormInput from "@/components/input-fields/FormInput";
import { DoubleArrowLeftIcon } from "@radix-ui/react-icons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRef, useState, useEffect } from "react";
import { CheckCircle, Edit } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import moment from "moment";

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  alpForm?: any; // Replace with proper type
  isViewing?: boolean;
  isEditing?: boolean;
  username?: string;
  visitType: "first" | "second";
  clientId: string;
  admin?: boolean;
  formattedDateOfSession: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Full name is required."),
  signature_url: z.string().min(1, "Signature is required"),
});

export type AlpVisitSignatureFormSchema = z.infer<typeof formSchema>;

// Helper function to convert 12-hour format to minutes since midnight
const convertTimeToMinutes = (timeStr: string): number => {
  // Extract hours, minutes, and period (AM/PM)
  const match = timeStr.match(/(\d+):(\d+)(am|pm)/i);
  if (!match) return 0;

  let [_, hours, minutes, period] = match;
  let totalMinutes = parseInt(hours) * 60 + parseInt(minutes);

  // Convert to 24-hour format
  if (period.toLowerCase() === "pm" && hours !== "12") {
    totalMinutes += 12 * 60;
  } else if (period.toLowerCase() === "am" && hours === "12") {
    totalMinutes = parseInt(minutes); // 12 AM is 0 hours
  }

  return totalMinutes;
};

// Calculate duration and format it
const calculateDuration = (startTime: string, endTime: string): string => {
  const startMinutes = convertTimeToMinutes(startTime);
  const endMinutes = convertTimeToMinutes(endTime);

  // Handle cases where end time is on the next day
  let durationMinutes = endMinutes - startMinutes;
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60; // Add 24 hours in minutes
  }

  // Convert to hours and minutes
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  // Format the output
  if (hours === 0) {
    return `${minutes} minutes`;
  } else if (minutes === 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${
      minutes > 1 ? "s" : ""
    }`;
  }
};

const AlpVisitSignature = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  alpForm,
  isViewing,
  isEditing,
  username = "Client",
  admin,
  clientId,
  formattedDateOfSession,
  visitType,
}: Props) => {
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const router = useRouter();
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const isFormDisabled = false;

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<AlpVisitSignatureFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      signature_url: "",
    },
  });

  const imageURL = watch("signature_url");

  const clearSignature = () => {
    signatureRef.current?.clear();
    setValue("signature_url", "");
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

      setValue("signature_url", canvasData);
      setIsSignatureModalOpen(false);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const onSubmit = async (data: AlpVisitSignatureFormSchema) => {
    try {
      const token = localStorage.getItem("token") as string;

      handleNewCompletedSection(currentIndex + 1);
      toast({
        variant: "success",
        description: `${username} on ${moment().format(
          "dddd, MMMM Do, YYYY"
        )} successfully submitted.`,
      });
      router.push(
        admin
          ? `/admin/clients/${clientId}?tab=fc`
          : `/clients/${clientId}?tab=fc`
      );
    } catch (err) {
      console.error("ERROR SUBMITTING FC VISIT SIGNATURE", err);
    }
  };

  const handleDraftSubmit = async () => {
    const data = getValues();
    try {
      setIsSubmittingDraft(true);
      const token = localStorage.getItem("token") as string;

      toast({
        variant: "success",
        description: "Draft saved successfully",
      });
    } catch (err) {
      console.error("ERROR SUBMITTING FC VISIT SIGNATURE", err);
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  return (
    <section className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 static">
      <h3
        data-testid="signature-header"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Signature
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              disabled={isFormDisabled}
              placeholder="Enter your full name here"
              type="text"
              labelText="Full Name"
              isAuth={false}
              isError={!!errors.name}
              errorMessage={errors.name?.message ?? ""}
              data-testid="full-name-input"
            />
          )}
        />

        <div className="flex flex-col gap-2">
          <p className="text-[#0F172A] text-[18px] font-[600]">Signature</p>
          <p className="text-[14px] font-[400] text-[#334155]">
            <span>By signing, you certify that you worked approximately</span>{" "}
            <span className="text-[#64748B] font-[700]">
              {calculateDuration("10:00am", "12:30pm")}
            </span>{" "}
            <span>on</span>{" "}
            <span className="text-[#64748B] font-[700]">
              {formattedDateOfSession}
            </span>{" "}
            <span>providing Family Consultation services to</span>{" "}
            <span className="text-[#64748B] font-[700]">{username}&apos;s</span>{" "}
            <span>family</span>
          </p>
        </div>

        <Dialog
          onOpenChange={setIsSignatureModalOpen}
          open={isSignatureModalOpen}
        >
          {!imageURL && (
            <DialogTrigger
              onClick={() => setIsSignatureModalOpen(true)}
              type="button"
              data-testid="signature-trigger"
            >
              <Button>Sign</Button>
            </DialogTrigger>
          )}

          {imageURL && (
            <div
              data-testid="signature-success"
              className="bg-[#039855] w-fit h-fit rounded-[6px] p-[12px] text-white flex items-center gap-5"
            >
              <CheckCircle /> Form Signed Successfully
            </div>
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
                onClick={clearSignature}
                data-testid="clear-signature"
                className="w-fit text-[#EF4444] hover:text-[#ad4444] disabled:cursor-not-allowed text-[14px] ml-auto"
              >
                Clear
              </button>
            </div>

            <DialogFooter className="mt-5 flex justify-center md:justify-start items-center gap-3 ml-auto">
              <DialogClose
                data-testid="cancel-signature"
                className="h-fit py-3 m-0 bg-[#0F172A] border-none hover:bg-[#0F172A]"
              >
                <p className="text-[#2563EB] text-[14px] font-[500]">Cancel</p>
              </DialogClose>

              <button
                className="px-5 py-3 text-white bg-[#2563EB] hover:bg-[#2564ebd9] disabled:cursor-not-allowed rounded-[6px] h-fit w-fit text-[14px] font-[400] active:bg-[#4274e0f3]"
                onClick={saveSignature}
                type="button"
                data-testid="save-signature"
              >
                {imageURL ? "Update Signature" : "Add Signature"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {imageURL && imageURL?.length > 1 && (
          <div
            data-testid="signature-preview"
            className="flex flex-col gap-5 w-[250px] h-[200px] mt-5"
          >
            <button
              type="button"
              disabled={isFormDisabled}
              onClick={() => setIsSignatureModalOpen(true)}
              data-testid="edit-signature"
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

        <div className="flex flex-wrap gap-5 justify-center items-center md:justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[100%] z-20">
          <Button
            variant="light"
            onClick={() => handleChangeIndex(1)}
            type="button"
            data-testid="previous-section-button"
          >
            <DoubleArrowLeftIcon className="w-5 h-5" />
            Previous Section
          </Button>

          {!isFormDisabled && (
            <Button
              variant="light"
              type="button"
              onClick={handleDraftSubmit}
              disabled={isSubmittingDraft}
              isLoading={isSubmittingDraft}
              data-testid="save-draft-button"
            >
              Save Draft
            </Button>
          )}

          <Button
            type="submit"
            disabled={isFormDisabled || isSubmitting}
            isLoading={isSubmitting}
            data-testid="submit-button"
          >
            Save And Finish
          </Button>
        </div>
      </form>
    </section>
  );
};

export default AlpVisitSignature;
