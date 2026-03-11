"use client";

import { useState, useEffect } from "react";
import { UploadIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { handleUserDocumentSubmission } from "@/actions/documents";
import Loader from "../../../../components/Loader";
import useCustomMutation from "@/hooks/useCustomMutation";
import { useToast } from "../../../../components/ui/use-toast";
import FileUpload from "@/components/file-upload/FileUpload";

const DocumentUploadModal = ({
  documentName,
  isOpen,
  closeModal,
  showTrigger,
  isReuploading,
  getUploadStatus,
  documentId,
}: {
  documentName: string;
  isOpen?: boolean;
  closeModal?: () => void;
  showTrigger?: boolean;
  isReuploading?: boolean;
  getUploadStatus?: (status: boolean) => void;
  documentId?: string;
}) => {
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>("");

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const { toast } = useToast();

  const sendDocumentToServer = async (file: string) => {
    try {
      if (file.length < 10) {
        return toast({
          variant: "destructive",
          description: "Please upload your document",
        });
      }

      const token = localStorage.getItem("token") as string;

      let response: boolean;
      if (isReuploading) {
        response = await handleUserDocumentSubmission(
          file,
          documentName,
          token,
          "PATCH",
          documentId
        );
      } else {
        response = await handleUserDocumentSubmission(
          file,
          documentName,
          token,
          "POST"
        );
      }

      if (!response) {
        return toast({
          variant: "destructive",
          description:
            "A server error occurred while submitting document! Refresh the page and try again",
        });
      }

      setModalOpen(false);
      closeModal && closeModal();
      return toast({
        variant: "success",
        description: `${documentName} Has been submitted successfully`,
      });
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const { mutate, isPending } = useCustomMutation<string>(
    sendDocumentToServer,
    ["documents"]
  );

  useEffect(() => {
    getUploadStatus && getUploadStatus(isPending);
  }, [isPending, getUploadStatus]);

  const handleFileUrl = (fileUrl: string) => setFileUrl(fileUrl);
  const handleToggleUploadStatus = (status: boolean) =>
    setUploadLoading(status);

  return (
    <Dialog
      onOpenChange={() => {
        setModalOpen(false);
        closeModal && closeModal();
      }}
      open={isOpen ?? modalOpen}
    >
      {showTrigger && (
        <DialogTrigger onClick={() => setModalOpen(true)} className="w-full">
          <button className="w-[120px] h-fit px-[12px] py-[8px] bg-[#2563EB] rounded-[6px] text-white flex items-center gap-3 justify-center">
            <UploadIcon />
            Upload
          </button>
        </DialogTrigger>
      )}

      <DialogContent
        style={{
          boxShadow: isReuploading ? "0 0 2000px rgba(0, 0, 0, 0.5)" : "",
        }}
        className="bg-white rounded-[12px] flex flex-col gap-10"
      >
        <div className="w-full flex gap-5 justify-center items-center ml-auto">
          <h2 className="text-[18px] w-full font-[600] text-[#101828] text-center">
            {isReuploading ? "Reupload" : "Upload"} {documentName}
          </h2>
        </div>
        <FileUpload
          getFileUrl={handleFileUrl}
          getUploadStatus={handleToggleUploadStatus}
          acceptPdfOnly
        />
        <DialogFooter className="flex items-center gap-5 lg:flex-nowrap flex-wrap">
          <DialogClose
            onClick={() => {
              setModalOpen(false);
              closeModal && closeModal();
            }}
            disabled={uploadLoading || isPending}
            className="w-full bg-[#F1F5F9] rounded-[6px] h-fit px-5 py-3 text-black disabled:bg-[#2564eb69] disabled:text-white disabled:cursor-not-allowed flex items-center gap-3 justify-center"
          >
            Cancel
          </DialogClose>
          <DialogClose
            onClick={() => {
              mutate(fileUrl);
            }}
            disabled={uploadLoading || isPending}
            className="w-full bg-[#2563EB] hover:bg-[#2b5dca] rounded-[6px] h-fit px-5 py-3 text-white disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 justify-center"
          >
            {uploadLoading || isPending ? (
              <div className="flex items-center gap-3">
                <Loader height="h-fit" />{" "}
                <span className="w-full">Uploading...</span>
              </div>
            ) : (
              <span>Submit</span>
            )}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadModal;
