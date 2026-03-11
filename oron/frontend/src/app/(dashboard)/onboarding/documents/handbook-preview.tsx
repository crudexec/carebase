"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Checkbox } from "../../../../components/ui/checkbox";
import { DownloadIcon } from "@radix-ui/react-icons";
import Button from "../../../../components/button/Button";
import { useToast } from "../../../../components/ui/use-toast";
import { Label } from "../../../../components/ui/label";
import useUser from "@/hooks/useUser";
import useCustomMutation from "@/hooks/useCustomMutation";
import Loader from "../../../../components/Loader";
import { handleHandbookAgreement } from "@/actions/documents/handbook";
import PDFReader from "../../../../components/pdf/PDFReader";
import PdfPreview from "@/components/pdf/PdfPreview";
import { useQueryClient } from "@tanstack/react-query";
import { EMPLOYEE_HANDBOOK_DOCUMENT_URL } from "@/constants";

interface HandbookModalProps {
  isOpen: boolean;
  closeModal: () => void;
  pdfUrl: string;
  downloadUrl: string;
}

export const HandbookModal = ({
  isOpen,
  closeModal,
  pdfUrl,
  downloadUrl,
}: HandbookModalProps) => {
  const queryClient = useQueryClient();
  const [userAgree, setUserAgree] = useState<boolean>();
  const [downloadLink, setDownloadLink] = useState(downloadUrl);
  const { toast } = useToast();

  const { data: user, isLoading } = useUser();
  const { mutate, isPending } = useCustomMutation(
    async (documentUrl: string) => {
      const token = localStorage.getItem("token") as string;

      const response = await handleHandbookAgreement(
        token,
        user?.data.first_name!,
        user?.data.last_name!,
        user?.data.email!,
        documentUrl
      );

      queryClient.invalidateQueries({
        queryKey: ["handBook"],
      });

      if (!response) {
        toast({
          variant: "destructive",
          description: "Something went wrong! Please try again",
        });
      }

      toast({
        variant: "default",
        title: "Employee Handbook Signed",
        description:
          "Your agreement to the Employee Handbook has been successfully submitted. You can now download the document.",
      });

      setDownloadLink(EMPLOYEE_HANDBOOK_DOCUMENT_URL);
      setUserAgree(true);
    },
    ["handBook"]
  );

  useEffect(() => {
    if (downloadUrl.length > 1) {
      setDownloadLink(downloadUrl);
    }
  }, [downloadUrl]);

  useEffect(() => {
    if (downloadLink.length > 1) {
      setUserAgree(true);
    }
  }, [downloadLink]);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogTrigger onClick={() => closeModal()} className="w-full">
        <button className="w-fit h-fit px-[12px] py-[8px] bg-[#d6d6da] rounded-[6px] text-black flex items-center gap-3 justify-center">
          Download
          <DownloadIcon />
        </button>
      </DialogTrigger>

      <DialogContent className="bg-white rounded-[12px] flex flex-col gap-10 w-full md:max-w-[90%] lg:max-w-[80%] h-[95vh] ">
        {isLoading ? (
          <Loader />
        ) : (
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-10 overflow-auto max-h-[70vh] md:max-h-[75vh]">
              <div className="w-full flex gap-5 justify-center items-center ml-auto">
                <h2 className="text-[25px] w-full font-[600] text-[#101828] text-center">
                  Download Employee Handbook
                </h2>
              </div>

              <PdfPreview pdfUrl={pdfUrl} />
            </div>

            <div className="flex bg-white z-[3000] flex-col gap-5 fixed w-[96%] bottom-0 py-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  defaultChecked={downloadLink.length > 1}
                  disabled={downloadLink.length > 1 || isPending}
                  onCheckedChange={(e) => {
                    setUserAgree(!!e);
                    if (e) {
                      mutate(EMPLOYEE_HANDBOOK_DOCUMENT_URL);
                    }
                  }}
                  id="terms"
                />
                <Label
                  htmlFor="terms"
                  className={`text-[16px] text-[#0F172A] font-[500] ${
                    userAgree === false && "text-[#EF4444]"
                  } `}
                >
                  I agree to the terms in the handbook
                </Label>
              </div>

              <div className="w-full flex flex-col md:flex-row flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:pr-10 lg:py-5 lg:bg-white">
                <Button
                  disabled={isPending}
                  variant="light"
                  onClick={() => {
                    closeModal();
                    setUserAgree(undefined);
                  }}
                  type="button"
                >
                  Cancel
                </Button>

                {!userAgree && (
                  <Button
                    onClick={() => {
                      toast({
                        variant: "destructive",
                        description:
                          "You must agree to the terms in the handbook before you can download the handbook",
                      });
                    }}
                    type="button"
                  >
                    Download
                  </Button>
                )}

                {userAgree === true && (
                  <a
                    target="_blank"
                    className={`flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] active:bg-[#4274e0f3] rounded-[6px] h-fit w-[174px] min-w-[174px] text-[14px] font-[400] text-[#F8FAFC] cursor-pointer`}
                    href={downloadLink.length < 10 ? undefined : downloadLink}
                    download={downloadLink.length > 10}
                  >
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const HandbookPreview = ({
  pdfUrl,
  downloadUrl,
}: {
  pdfUrl: string;
  downloadUrl: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {downloadUrl.length > 10 && !isOpen ? (
        <a
          href={downloadUrl}
          target="_blank"
          download
          className="w-[120px] h-fit px-[10px] py-[8px] bg-[#d6d6da] rounded-[6px] text-black flex items-center gap-3 justify-center"
        >
          Download
          <DownloadIcon />
        </a>
      ) : (
        <HandbookModal
          isOpen={isOpen}
          closeModal={() => setIsOpen(false)}
          pdfUrl={pdfUrl}
          downloadUrl={downloadUrl}
        />
      )}
    </div>
  );
};

export default HandbookPreview;
