import { handleI9PDFSubmission } from "@/actions/forms/i9form";
import { handleDocumentUpload } from "@/actions/upload";
import Button from "@/components/button/Button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import { Loader2, UploadIcon } from "lucide-react";
import React, { useState } from "react";
import { MethodState } from "../logic/wrapper/useWrapperLogic";
import FileUpload from "@/components/file-upload/FileUpload";

const UploadINindeForm = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  formCompleted,
  status,
  reviewNote,
  data,
  method,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  formCompleted: boolean;
  status: FormattedFormStatus;
  reviewNote: string;
  data: any;
  method: "POST" | "PATCH";
}) => {
  const initialState = {
    uploadedFile: "",
    fileName: "",
    uploadLoading: false,
    fileUrl: "",
    dragActive: false,
    data,
  };
  const [upload, setUpload] = useState(initialState);
  const { toast } = useToast();

  const handleUploadChange = ({
    key,
    value,
  }: {
    key: string;
    value: string | boolean;
  }) => {
    setUpload((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token") as string;
    const res = await handleI9PDFSubmission(token, upload.fileUrl, "POST");
    handleUploadChange({ key: "uploadLoading", value: true });
    if (res.status === false) {
      toast({
        variant: "destructive",
        description: res.errorMessage,
      });
    }
    if (res.status) {
      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
    }
    handleUploadChange({ key: "uploadLoading", value: false });
  };

  return (
    <div className="flex justify-center items-center">
      <div className="grid w-full items-center gap-2 ">
        <Label className="text-[15px] text-[#0F172A] w-fit">
          Upload the Completely Filled I-9 Form
        </Label>
        <FileUpload
          getFileUrl={(fileUrl) => {
            handleUploadChange({
              key: "fileUrl",
              value: fileUrl,
            });
          }}
          getUploadStatus={(status) => {
            handleUploadChange({
              key: "uploadLoading",
              value: status,
            });
          }}
        />
      </div>

      <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
        <Button
          onClick={() => handleChangeIndex(currentIndex - 1)}
          type="button"
          disabled={currentIndex === 1}
        >
          Previous Section
        </Button>

        {currentIndex !== 6 && (
          <Button
            disabled={upload.uploadLoading || !upload.fileUrl}
            onClick={handleSubmit}
            type="button"
          >
            {upload.uploadLoading ? "Loading..." : "Next Section"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default UploadINindeForm;
