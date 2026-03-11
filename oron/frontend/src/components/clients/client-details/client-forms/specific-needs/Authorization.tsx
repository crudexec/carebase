"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SignatureCanvas from "react-signature-canvas";
import { CheckCircle, Edit } from "lucide-react";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";

import Button from "@/components/button/Button";
import FormInput from "@/components/input-fields/FormInput";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import Loader from "@/components/Loader";
import useCustomMutation from "@/hooks/useCustomMutation";
import { handleDocumentUpload } from "@/actions/upload";
import { submitAuthorizationForm } from "@/actions/clients/specific-needs/specificNeeds";
import { validateField } from "@/lib/api-utils";
import { FullSpecificNeedsForm } from "@/types/SpecificNeeds";

// Define the form schema using Zod
const authorizationSchema = z.object({
  creatorName: z.string().min(1, "Name is required"),
  signature: z.string().min(1, "Signature is required"),
});

// TypeScript type for form data
type AuthorizationFormData = z.infer<typeof authorizationSchema>;

interface Props {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  clientId: string;
  specificNeedsData?: FullSpecificNeedsForm | undefined;
  refetchSpecificNeeds: any;
}

const Authorization = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  clientId,
  specificNeedsData,refetchSpecificNeeds
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isFormDisabled = mode === "view";

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const token = localStorage.getItem("token") as string;

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<AuthorizationFormData>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      creatorName: "",
      signature: "",
    },
  });

  useEffect(() => {
    if (!specificNeedsData) return;

    const data = specificNeedsData?.data;
    const authorization = data?.authorization;

    if (authorization) {
      setMethod("PATCH");

      if (
        authorization?.creator_name &&
        authorization?.signature_url &&
        typeof authorization?.signature_url === "string"
      ) {
        setValue("creatorName", authorization?.creator_name);
        setValue("signature", authorization?.signature_url);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specificNeedsData]);

  // Watch signature field for changes
  const signatureValue = watch("signature");

  const { mutate: uploadSignature, isPending } = useCustomMutation(
    async (imageURL: string) => {
      const base64Response = await fetch(imageURL);
      const blob = await base64Response.blob();
      const file = new File([blob], "signature.png", { type: "image/png" });

      const form = new FormData();
      form.append("file", file);

      const generatedFileUrl = await handleDocumentUpload(form, token);

      if (generatedFileUrl) {
        setValue("signature", generatedFileUrl);
      } else {
        toast({
          description: "Signing failed",
          variant: "destructive",
        });
      }
    },
    []
  );

  const clearSignature = () => {
    signatureRef.current?.clear();
    setValue("signature", "", { shouldDirty: true });
  };

  const saveSignature = async () => {
    const canvasData = signatureRef.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");

    if (!canvasData || canvasData.length < 500) {
      toast({
        description: "Please sign the field",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadSignature(canvasData);
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving signature:", error);
    }
  };

  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [method, setMethod] = useState<"POST" | "PATCH">("POST");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: AuthorizationFormData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token") as string;

      const requestBody = {
        creator_name: validateField(data.creatorName),
        signature_url: validateField(data.signature),
      };
      const authorization = specificNeedsData?.data?.authorization;

      const { status, errorMessage } = await submitAuthorizationForm(
        token,
        requestBody,
        clientId,
        method,
        specificNeedsData?.data?.id!,
        authorization?.id
      );

      if (!status) {
        toast({
          variant: "destructive",
          description: errorMessage,
        });
        return;
      }

      handleNewCompletedSection(currentIndex);
      router.push(`/admin/clients/${clientId}`);
    } catch (error) {
      toast({
        description: "Failed to submit form",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftSubmit = async () => {
    try {
      setIsSubmittingDraft(true);
      const formData = {
        creator_name: watch("creatorName"),
        signature_url: watch("signature"),
      };

      const token = localStorage.getItem("token") as string;
      const authorization = specificNeedsData?.data?.authorization;

      const { status, errorMessage } = await submitAuthorizationForm(
        token,
        formData,
        clientId,
        method,
        specificNeedsData?.data?.id!,
        authorization?.id
      );

      await refetchSpecificNeeds();

      if (!status) {
        toast({
          variant: "destructive",
          description: errorMessage,
        });
        return;
      }

      toast({
        description: "Draft saved successfully",
      });
    } catch (err) {
      console.error("Error saving draft:", err);
      toast({
        variant: "destructive",
        description: "An error occurred while saving the draft",
      });
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex-1 h-fit lg:pb-[150px] flex flex-col gap-10 lg:pl-10 mt-[4vh]"
      data-testid="authorization-form"
    >
      <h3
        data-testid="authorization-title"
        className="text-[#0F172A] text-[24px] font-[600]"
      >
        Authorization
      </h3>

      <Controller
        name="creatorName"
        control={control}
        render={({ field }) => (
          <FormInput
            {...field}
            data-testid="creator-name-input"
            disabled={isFormDisabled}
            placeholder="Enter name here"
            type="text"
            labelText="Name of the person who created the Specific Needs Assessment"
            isAuth={false}
            isError={!!errors.creatorName}
            errorMessage={errors.creatorName?.message}
          />
        )}
      />

      <div className="">
        <p
          data-testid="signature-section-title"
          className="text-[#0F172A] text-[18px] font-[600]"
        >
          Signature
        </p>
        <p className="text-[14px] font-[400] text-[#334155] my-2">
          By signing, you confirm that the specific needs sheet has been
          completed and reviewed; and all information is accurate to the best of
          your knowledge.
        </p>

        <Dialog onOpenChange={setIsOpen} open={isOpen}>
          {!signatureValue && !isPending && (
            <DialogTrigger
              disabled={isFormDisabled}
              onClick={() => setIsOpen(true)}
              className="flex justify-start mt-5"
              data-testid="signature-trigger"
            >
              <Button type="button">Sign</Button>
            </DialogTrigger>
          )}

          {signatureValue && !isPending && (
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
                type="button"
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
                <p className="text-[#2563EB] text-[14px] font-[500]">Cancel</p>
              </DialogClose>

              <button
                data-testid="save-signature"
                className="px-5 py-3 text-white bg-[#2563EB] hover:bg-[#2564ebd9] disabled:cursor-not-allowed rounded-[6px] h-fit w-fit text-[14px] font-[400] active:bg-[#4274e0f3]"
                onClick={saveSignature}
                type="button"
              >
                {signatureValue ? "Update Signature" : "Add Signature"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {errors.signature && (
          <p
            data-testid="signature-error"
            className="text-red-500 text-sm mt-2"
          >
            {errors.signature.message}
          </p>
        )}
      </div>

      {signatureValue && (
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
            src={signatureValue}
            width={200}
            height={200}
            alt="signature"
            className="w-[200px] h-[150px]"
            data-testid="signature-image"
          />
        </div>
      )}

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
            variant="light"
            type="button"
            onClick={handleDraftSubmit}
            data-testid="save-draft-button"
            disabled={isSubmittingDraft}
            isLoading={isSubmittingDraft}
          >
            Save Draft
          </Button>
        )}

        <Button
          type={isFormDisabled ? "button" : "submit"}
          onClick={
            isFormDisabled
              ? () => router.push(`/admin/clients/${clientId}`)
              : undefined
          }
          data-testid="finalize-button"
          disabled={isLoading}
          isLoading={isLoading}
        >
          Save <DoubleArrowRightIcon className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
};

export default Authorization;
