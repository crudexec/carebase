"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { closeSpecificNeedsPdfModal } from "@/state/features/specific-needs-pdf-modal/specificNeedsPdfModalSlice";
import { retrieveClientById } from "@/use-cases/clients";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { capitalizeFirstLetter } from "@/utils";
import Loader from "@/components/Loader";
import Button from "@/components/button/Button";
import { convertPdfToUint8Array } from "./DownloadTreatmentPDF";
import SpecificNeedsPdf from "./SpecificNeedsPdf";
import { isValidArrayBuffer } from "../../../TreatmentPreviewModal";
import { useEffect, useState } from "react";
import { PdfPreviewComp } from "@/components/pdf/PdfPreview";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { retrieveSpecificNeedsForm } from "@/use-cases/specific-needs"; // You'll need to create this

const SpecificNeedsPdfModal = () => {
  const isSpecificNeedsPdfModalOpen = useAppSelector(
    (state) => state.specificNeedsPdfModal.isOpen
  );
  const [specificNeedsPdfDocument, setSpecificNeedsPdfDocument] =
    useState<Uint8Array | null>(null);
  const dispatch = useAppDispatch();

  const { clientId } = useParams<{ clientId: string }>();
  const token = localStorage.getItem("token") as string;

  const { data, isLoading } = useQuery({
    queryKey: ["clientDetail", clientId],
    queryFn: async () => await retrieveClientById(token, clientId),
    enabled: isSpecificNeedsPdfModalOpen,
  });

  const { data: specificNeedsData, isLoading: specificNeedsDataLoading } =
    useQuery({
      queryKey: ["specificNeeds", clientId],
      queryFn: async () => await retrieveSpecificNeedsForm(token, clientId),
      enabled: isSpecificNeedsPdfModalOpen,
    });

  const user = data?.data[0];
  const firstName =
    user?.clientInformation?.first_name ?? user?.first_name ?? "";
  const lastName = user?.clientInformation?.last_name ?? user?.last_name ?? "";
  const username = capitalizeFirstLetter(
    `${firstName?.toLowerCase()} ${lastName?.toLowerCase()}`
  );

  const handleCloseModal = () => {
    dispatch(closeSpecificNeedsPdfModal());
  };

  const handleConvertAndSetPdfDocument = async () => {
    try {
      if (specificNeedsData) {
        try {
          const uint8Array = await convertPdfToUint8Array(
            <SpecificNeedsPdf data={specificNeedsData!} />
          );

          if (uint8Array && isValidArrayBuffer(uint8Array.buffer)) {
            setSpecificNeedsPdfDocument(uint8Array);
          } else {
            console.error("Invalid or detached ArrayBuffer");
          }
        } catch (error) {
          console.error("Error generating PDF document:", error);
        }
      } else {
        console.error("SPECIFIC NEEDS DATA NOT FOUND");
      }
    } catch (error) {
      console.error("ERROR CONVERTING AND SETTING SPECIFIC NEEDS PDF", error);
    }
  };

  useEffect(() => {
    if (isSpecificNeedsPdfModalOpen && specificNeedsData) {
      handleConvertAndSetPdfDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpecificNeedsPdfModalOpen, specificNeedsData]);

  useEffect(() => {
    if (!isSpecificNeedsPdfModalOpen) {
      setSpecificNeedsPdfDocument(null);
    }
  }, [isSpecificNeedsPdfModalOpen]);

  return (
    <Dialog open={isSpecificNeedsPdfModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="bg-white rounded-[12px] flex flex-col gap-10 w-full md:max-w-[90%] lg:max-w-[80%] h-[95vh] ">
        {isLoading || specificNeedsDataLoading ? (
          <Loader height="h-full" />
        ) : (
          <div className="flex flex-col gap-10 w-full h-full overflow-hidden max-h-[70vh] md:max-h-[75vh]">
            <h2 className="text-[25px] w-full font-[600] text-[#101828] text-center">
              {username} Specific Needs
            </h2>

            <div className="overflow-auto">
              {specificNeedsPdfDocument && (
                <PdfPreviewComp pdfDocument={specificNeedsPdfDocument} />
              )}
            </div>

            <div className="flex bg-white z-[3000] flex-col gap-5 fixed w-[96%] bottom-0 py-3">
              <div className="w-full flex flex-row flex-wrap gap-5 justify-center md:justify-end mt-auto lg:border-t-[1px] lg:pr-10 lg:py-5 lg:bg-white">
                <Button
                  variant="light"
                  onClick={handleCloseModal}
                  type="button"
                >
                  Cancel
                </Button>

                {specificNeedsData && (
                  <PDFDownloadLink
                    onClick={(e) => e.stopPropagation()}
                    document={<SpecificNeedsPdf data={specificNeedsData!} />}
                    fileName={`Specific_Needs_Sheet_${username}.pdf`}
                    className="flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] active:bg-[#4274e0f3] rounded-[6px] h-fit w-[174px] min-w-[174px] text-[14px] font-[400] text-[#F8FAFC] cursor-pointer"
                  >
                    Download
                  </PDFDownloadLink>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SpecificNeedsPdfModal;
