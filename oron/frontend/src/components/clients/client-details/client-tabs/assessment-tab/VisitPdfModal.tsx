"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { closeVisitPdfModal } from "@/state/features/visit-pdf-modal/visitPdfModalSlice";
import {
  retrieveClientById,
  retrieveClientTreatmentPlanGoals,
} from "@/use-cases/clients";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { capitalizeFirstLetter } from "@/utils";
import Loader from "@/components/Loader";
import Button from "@/components/button/Button";
import { convertPdfToUint8Array } from "./DownloadTreatmentPDF";
import VisitPdf from "./VisitPdf";
import { isValidArrayBuffer } from "../../../TreatmentPreviewModal";
import { useEffect, useState } from "react";
import { PdfPreviewComp } from "@/components/pdf/PdfPreview";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { TreatmentPlanFormTabOptionIdType } from "../../ClientDetailPageWrapper";
import { getSingleVisitFormRetrievalFunction } from "@/utils/treatmentPlanHelpers";
import { FullFcVisitForm, FullVisitForm } from "@/types/Visit";
import FcVisitPdf from "./FcVisitPdf";

interface Props {
  formType: TreatmentPlanFormTabOptionIdType;
}

const VisitPdfModal = ({ formType }: Props) => {
  const isVisitPdfModalOpen = useAppSelector(
    (state) => state.visitPdfModal.isOpen
  );
  const visitPdfData = useAppSelector((state) => state.visitPdfModal.data);
  const [visitPdfDocument, setVisitPdfDocument] = useState<Uint8Array | null>(
    null
  );
  const dispatch = useAppDispatch();

  const { clientId } = useParams<{ clientId: string }>();
  const token = localStorage.getItem("token") as string;
  const { data, isLoading } = useQuery({
    queryKey: ["clientDetail", clientId],
    queryFn: async () => await retrieveClientById(token, clientId),
    enabled: isVisitPdfModalOpen,
  });
  const { data: visitData, isLoading: visitDataLoading } = useQuery({
    queryKey: ["clientVisitForm", visitPdfData?.id],
    queryFn: async () => {
      const retrieveVisitsFunction =
        getSingleVisitFormRetrievalFunction(formType);
      return await retrieveVisitsFunction(token, visitPdfData?.id!);
    },

    enabled: !!visitPdfData?.id && visitPdfData?.id.length > 0,
  });
  const { data: treatmentPlanGoals, isLoading: treatmentPlanGoalsLoading } =
    useQuery({
      queryKey: ["clientTreatmentPlanGoals", clientId],
      queryFn: async () =>
        await retrieveClientTreatmentPlanGoals(token, clientId, formType),
      enabled: isVisitPdfModalOpen,
    });

  const user = data?.data[0];
  const firstName =
    user?.clientInformation?.first_name ?? user?.first_name ?? "";
  const lastName = user?.clientInformation?.last_name ?? user?.last_name ?? "";
  const username = capitalizeFirstLetter(
    `${firstName?.toLowerCase()} ${lastName?.toLowerCase()}`
  );

  const handleCloseModal = () => {
    dispatch(closeVisitPdfModal());
  };

  const handleConvertAndSetPdfDocument = async () => {
    try {
      if (visitData && treatmentPlanGoals) {
        try {
          let uint8Array: Uint8Array | undefined;

          if (formType === "iiss") {
            uint8Array = await convertPdfToUint8Array(
              <VisitPdf
                data={visitData as FullVisitForm}
                treatmentPlanGoals={treatmentPlanGoals}
                username={username}
              />
            );
          } else if (formType === "fc") {
            uint8Array = await convertPdfToUint8Array(
              <FcVisitPdf
                data={visitData as FullFcVisitForm}
                treatmentPlanGoals={treatmentPlanGoals}
                username={username}
              />
            );
          }

          if (uint8Array && isValidArrayBuffer(uint8Array.buffer)) {
            setVisitPdfDocument(uint8Array);
          } else {
            console.error("Invalid or detached ArrayBuffer");
          }
        } catch (error) {
          console.error("Error generating PDF document:", error);
        }
      } else {
        console.error("VISIT DATA OR TREATMENT PLAN GOALS NOT FOUND");
      }
    } catch (error) {
      console.error("ERROR CONVERTING AND SETTING VISIT PDF", error);
    }
  };

  useEffect(() => {
    if (
      isVisitPdfModalOpen &&
      visitPdfData &&
      visitData &&
      treatmentPlanGoals
    ) {
      handleConvertAndSetPdfDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisitPdfModalOpen, visitPdfData, visitData, treatmentPlanGoals]);

  useEffect(() => {
    if (!isVisitPdfModalOpen) {
      setVisitPdfDocument(null);
    }
  }, [isVisitPdfModalOpen]);

  return (
    <Dialog open={isVisitPdfModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="bg-white rounded-[12px] flex flex-col gap-10 w-full md:max-w-[90%] lg:max-w-[80%] h-[95vh] ">
        {isLoading || visitDataLoading || treatmentPlanGoalsLoading ? (
          <Loader height="h-full" />
        ) : (
          <div className="flex flex-col gap-10 w-full h-full overflow-hidden max-h-[70vh] md:max-h-[75vh]">
            <h2 className="text-[25px] w-full font-[600] text-[#101828] text-center">
              {username} Visit Log
            </h2>

            <div className="overflow-auto">
              {visitPdfDocument && (
                <PdfPreviewComp pdfDocument={visitPdfDocument} />
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

                {visitData && treatmentPlanGoals && (
                  <PDFDownloadLink
                    onClick={(e) => e.stopPropagation()}
                    document={
                      formType === "iiss" ? (
                        <VisitPdf
                          treatmentPlanGoals={treatmentPlanGoals!}
                          data={visitData as FullVisitForm}
                          username={username}
                        />
                      ) : formType === "fc" ? (
                        <FcVisitPdf
                          data={visitData as FullFcVisitForm}
                          treatmentPlanGoals={treatmentPlanGoals}
                          username={username}
                        />
                      ) : (
                        <VisitPdf
                          data={visitData as FullVisitForm}
                          treatmentPlanGoals={treatmentPlanGoals}
                          username={username}
                        />
                      ) // Or you can return a default component if needed
                    }
                    fileName={`Visit_Log_${username}.pdf`}
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

export default VisitPdfModal;
