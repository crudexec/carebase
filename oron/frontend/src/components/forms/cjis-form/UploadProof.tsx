"use client";

import { useState } from "react";
import FileUpload from "@/components/file-upload/FileUpload";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import Button from "@/components/button/Button";
import { submitForm } from "@/actions/forms/submit-form";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { handleCJISCompletionProofSubmission } from "@/actions/forms/cjis-form";

const UploadProof = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  refetch,
  method,
  formInfo,
  status,
  refetchFormStatus,
  signatureDisabled,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  refetch: any;
  method: "POST" | "PATCH";
  formInfo: any;
  status: FormattedFormStatus;
  refetchFormStatus: any;
  signatureDisabled: boolean;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token") as string;
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>("");

  return (
    <section className="flex-1 h-fit lg:pb-[150px] lg:min-h-[70vh] flex flex-col gap-5">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">
        Upload Completion Proof
      </h3>
      <p className="text-[#334155] text-[16px] font-[400]">
        Upload the proof/receipt of background check completion on the CJIS
        section
      </p>

      <div className="xl:w-[50%] lg:w-full md:w-[50%] flex flex-col gap-3 mt-5">
        <p className="text-[#0F172A] text-[14px] font-[500]">Upload Document</p>
        <FileUpload
          getUploadStatus={(status) => setIsUploading(status)}
          getFileUrl={(file) => setFileUrl(file)}
          defaultFileUrl={
            formInfo?.data?.preRegistrationForm?.pre_registration_pdf_url
          }
          defaultText={
            formInfo?.data?.cjisForm?.pre_registration_id
              ? "Completion Proof"
              : undefined
          }
          disabled={formInfo?.data?.cjisForm?.pre_registration_id}
          acceptPdfOnly
        />
      </div>

      <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
        <Button
          variant="light"
          onClick={() => handleChangeIndex(currentIndex - 1)}
          type="button"
          disabled={currentIndex === 1}
        >
          Previous Section
        </Button>

        <Button
          onClick={async () => {
            setIsLoading(true);

            const documentSubmitResponse =
              await handleCJISCompletionProofSubmission(token, fileUrl);

            refetchFormStatus();
            refetch();

            if (!documentSubmitResponse.status) {
              toast({
                variant: "destructive",
                description: documentSubmitResponse.errorMessage,
              });
              setIsLoading(false);
              return;
            }

            const response = await submitForm(token, "cjis");

            refetchFormStatus();
            refetch();

            if (!response.status) {
              toast({
                variant: "destructive",
                description: response.errorMessage,
              });
              setIsLoading(false);
              return;
            }

            handleNewCompletedSection(currentIndex);
            toast({
              variant: "success",
              description:
                "Congratulations! 🎉 Your CJIS Attestation Form form has been successfully submitted. We'll notify you once it's approved.",
            });

            router.push("/onboarding/form");
          }}
          disabled={
            signatureDisabled ||
            status === "Awaiting Approval" ||
            status === "Approved" ||
            isLoading ||
            method === "POST" ||
            isUploading ||
            !fileUrl
          }
          type="button"
        >
          Submit Form
        </Button>
      </div>
    </section>
  );
};

export default UploadProof;
