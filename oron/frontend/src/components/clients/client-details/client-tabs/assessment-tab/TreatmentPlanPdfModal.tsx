"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { closeTreatmentPlanPdfModal } from "@/state/features/treatment-plan-pdf-modal/treatmentPlanPdfModalSlice";
import { TreatmentPlanFormTabOptionIdType } from "../../ClientDetailPageWrapper";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  convertDocDefinitionToUint8Array,
  convertTreatmentPlanTypeToEnumType,
  getTreatmentPlanFormName,
  getTreatmentPlanFormRoute,
} from "@/utils/treatmentPlanHelpers";
import { handleSendTreatmentPlanToParent } from "@/actions/clients/client";
import Link from "next/link";
import { Check, Copy, EditIcon, Mail, TriangleAlert } from "lucide-react";
import FormBadge from "@/components/badge/FormBadge";
import {
  formatTreatmentPlanStatus,
  isValidArrayBuffer,
} from "@/components/clients/TreatmentPreviewModal";
import Loader from "@/components/Loader";
import { PdfPreviewComp } from "@/components/pdf/PdfPreview";
import Button from "@/components/button/Button";
import { createTreatmentPlanPDF } from "@/lib/pdf/treatmentPlanPdf";
import Image from "next/image";
import pdfMake from "pdfmake/build/pdfmake";
import { format } from "date-fns";
import FormInput from "@/components/input-fields/FormInput";
import { shareTreatmentPlan } from "@/actions/clients/treatment-plan/treatmentPlan";

interface Props {
  clientId: string;
  formType: TreatmentPlanFormTabOptionIdType;
  admin?: boolean;
}

const formatTreatmentPlanData = (treatmentPlanData: any) => ({
    ...treatmentPlanData,
    basicInformation: {
      ...treatmentPlanData.basicInformation,
      implementation_start_date: treatmentPlanData?.basicInformation
        ?.implementation_start_date
        ? format(
            new Date(
              treatmentPlanData.basicInformation.implementation_start_date
            ),
            "MM/dd/yyyy"
          )
        : "",
      implementation_stop_date: treatmentPlanData?.basicInformation
        ?.implementation_stop_date
        ? format(
            new Date(
              treatmentPlanData.basicInformation?.implementation_stop_date
            ),
            "MM/dd/yyyy"
          )
        : "",
    },
    goals: treatmentPlanData?.treatmentGoal?.toSorted(
      (a: any, b: any) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    ),
    schedule:
      treatmentPlanData?.treatmentSchedule &&
      treatmentPlanData?.treatmentSchedule[0] &&
      treatmentPlanData.treatmentSchedule[0].time_slot,
  }

)

const TreatmentPlanPdfModal = ({ clientId, formType, admin }: Props) => {
  const [shareTreatmentPlanModalOpen, setShareTreatmentPlanModalOpen] =
    useState(false);
  const isTreatmentPlanPdfModalOpen = useAppSelector(
    (state) => state.treatmentPlanPdfModal.isOpen
  );
  const treatmentPlanData = useAppSelector(
    (state) => state.treatmentPlanPdfModal.data
  );
  const [treatmentPlanPdfDocument, setTreatmentPlanPdfDocument] =
    useState<Uint8Array | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [hasCopyLink, setHasCopyLink] = useState(false);
  const [isResendingParentEmail, setIsResendingParentEmail] = useState(false);
  const [sharingTreatmentPlanFormData, setSharingTreatmentPlanFormData] =
    useState({
      recipentName: "",
      recipentEmail: "",
      recipentRole: "",
      isSubmitting: false,
    });

  const dispatch = useAppDispatch();

  const fileName = treatmentPlanData?.basicInformation
    ? `Treatment_plan_${treatmentPlanData?.basicInformation?.participant_first_name}_${treatmentPlanData?.basicInformation?.participant_last_name}.pdf`
    : "unamed_patient";

  const handleConvertAndSetPdfDocument = async () => {
    try {
      if (treatmentPlanData) {
        try {
          const payloadData = formatTreatmentPlanData(treatmentPlanData)

          const docDefinition: any = await createTreatmentPlanPDF(
            payloadData,
            treatmentPlanData?.parent_name ?? "",
            treatmentPlanData?.treatmentGoalSignature?.parent_signature_url ??
              "",
            treatmentPlanData?.treatmentGoalSignature?.date_parent_signed ?? ""
          );

          const uint8Array = await convertDocDefinitionToUint8Array(
            docDefinition
          );

          if (uint8Array && isValidArrayBuffer(uint8Array.buffer)) {
            setTreatmentPlanPdfDocument(uint8Array);
          } else {
            console.error("Invalid or detached ArrayBuffer");
          }
        } catch (error) {
          console.error("Error generating PDF document:", error);
        }
      } else {
        console.error("TREATMENT PLAN DATA NOT FOUND");
      }
    } catch (error) {
      console.error("ERROR CONVERTING AND SETTING TREATMENT PLAN PDF", error);
    }
  };

  useEffect(() => {
    if (isTreatmentPlanPdfModalOpen && treatmentPlanData) {
      handleConvertAndSetPdfDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTreatmentPlanPdfModalOpen, treatmentPlanData]);

  useEffect(() => {
    if (!isTreatmentPlanPdfModalOpen) {
      setTreatmentPlanPdfDocument(null);
    }
  }, [isTreatmentPlanPdfModalOpen]);

  const handleCloseModal = () => {
    dispatch(closeTreatmentPlanPdfModal());
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    const docDefinition: any = await createTreatmentPlanPDF(
      formatTreatmentPlanData(treatmentPlanData),
      treatmentPlanData?.parent_name ?? "",
      treatmentPlanData?.treatmentGoalSignature?.parent_signature_url ?? "",
      treatmentPlanData?.treatmentGoalSignature?.date_parent_signed ?? ""
    );
    pdfMake.createPdf(docDefinition).download(fileName);
    setIsGeneratingPdf(false);
  };

  const handleCopyLink = async () => {
    try {
      const treatment_plan_type = convertTreatmentPlanTypeToEnumType(formType);

      // Copy the URL to the clipboard
      await navigator.clipboard.writeText(
        `${window.location.origin}/sign-treatment-plan/${treatmentPlanData?.id}?treatment_plan_type=${treatment_plan_type}`
      );

      setHasCopyLink(true);

      // Reset hasCopyLink to false after 2 seconds
      setTimeout(() => {
        setHasCopyLink(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleResendTreatmentPlanToParent = async () => {
    try {
      setIsResendingParentEmail(true);

      const parentName = treatmentPlanData?.parent_name ?? "-";
      const parentEmail = treatmentPlanData?.parent_email ?? "-";
      const relationToParticipant =
        treatmentPlanData?.relation_to_participant ?? "-";
      const treatmentPlanId = treatmentPlanData?.id ?? "-";
      const token = localStorage.getItem("token") as string;

      const response = await handleSendTreatmentPlanToParent(
        parentName,
        parentEmail,
        relationToParticipant,
        clientId,
        treatmentPlanId,
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
            <strong>{parentName}</strong>. The parent has 48 hours to complete
            their signature.
          </>
        ),
      });
      setIsResendingParentEmail(false);
    } catch (err) {
      console.error("ERROR RESENDING PARENT EMAIL", err);
      setIsResendingParentEmail(false);
    } finally {
      setIsResendingParentEmail(false);
    }
  };

  const handleShareTreatmentPlanInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setSharingTreatmentPlanFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleShareTreatmentPlan = async () => {
    try {
      setSharingTreatmentPlanFormData((prevState) => ({
        ...prevState,
        isSubmitting: true,
      }));

      const token = localStorage.getItem("token") as string;
      const treatmentPlanId = treatmentPlanData?.id ?? "-";

      const response = await shareTreatmentPlan(
        sharingTreatmentPlanFormData.recipentName,
        sharingTreatmentPlanFormData.recipentEmail,
        sharingTreatmentPlanFormData.recipentRole,
        treatmentPlanId,
        formType,
        token
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
            The treatment plan has been successfully shared with{" "}
            <strong>{sharingTreatmentPlanFormData.recipentName}</strong>.
          </>
        ),
      });

      setShareTreatmentPlanModalOpen(false);
    } catch (error) {
      console.error("ERROR SHARING TREATMENT PLAN", error);
    } finally {
      setSharingTreatmentPlanFormData((prevState) => ({
        ...prevState,
        isSubmitting: false,
      }));
    }
  };

  return (
    <Dialog open={isTreatmentPlanPdfModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="bg-white rounded-[12px] flex flex-col gap-10 w-full md:max-w-[90%] lg:max-w-[80%] h-[95vh] ">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-10 max-h-[70vh] md:max-h-[75vh] overflow-hidden ">
            <div className="w-full flex gap-5 items-center justify-center mx-auto">
              <h2 className="text-[23px] font-[600] text-[#101828] flex items-center gap-5">
                {treatmentPlanData?.basicInformation?.participant_first_name}{" "}
                {treatmentPlanData?.basicInformation?.participant_last_name} -{" "}
                {getTreatmentPlanFormName(formType)}
              </h2>

              {admin && (
                <Link
                  onClick={handleCloseModal}
                  href={`/admin/clients/${clientId}/forms/${getTreatmentPlanFormRoute(
                    formType
                  )}?mode=edit&formId=${treatmentPlanData?.id}`}
                >
                  <EditIcon className="w-5 h-5 text-gray-600" />
                </Link>
              )}

              <FormBadge
                status={formatTreatmentPlanStatus(
                  treatmentPlanData?.status ?? "-"
                )}
              >
                {formatTreatmentPlanStatus(treatmentPlanData?.status ?? "-")}
              </FormBadge>
            </div>

            {treatmentPlanData?.status === "not_sent" && admin && (
              <div className="flex justify-between items-center flex-wrap gap-3 p-5 border-[2px] border-[#FEC84B] bg-[#FFFCF5] rounded-[8px]">
                <div className="flex gap-3 items-start">
                  <Image
                    src="/assets/images/dashboard/warningIcon.svg"
                    width={17}
                    height={17}
                    alt="info icon"
                    className="mt-1"
                  />
                  <p className="text-[14px] font-[400] text-[#B54708]">
                    The treatment plan has not been sent to the parent for
                    signature
                  </p>
                </div>

                <div className="flex gap-4 items-center">
                  <button
                    onClick={handleCopyLink}
                    className="rounded-[6px] bg-white border-[1px] border-[#E2E8F0] w-fit h-fit px-[12px] py-[8px] text-black text-[14px] font-[500] flex gap-2 items-center"
                  >
                    Copy Link
                    {hasCopyLink ? (
                      <Check className="w-5 h-5 text-black" />
                    ) : (
                      <Copy className="w-5 h-5 text-black" />
                    )}
                  </button>

                  <Link
                    className="rounded-[6px] bg-[#DC6803] w-fit h-fit px-[12px] py-[8px] text-[#F8FAFC] text-[14px] font-[500] flex gap-2 items-center"
                    href={`/admin/clients/${clientId}/forms/${getTreatmentPlanFormRoute(
                      formType
                    )}?mode=edit&action=send_treatment_plan`}
                  >
                    Send Now
                    <Mail className="w-5 h-5 text-white" />
                  </Link>
                </div>
              </div>
            )}

            {treatmentPlanData?.status === "awaiting_signature" && (
              <div className="flex justify-between items-center flex-wrap gap-3 p-5 border-[2px] border-[#8FB2FF] bg-[#F5F8FF] rounded-[8px]">
                <div className="flex gap-3 items-start">
                  <Image
                    src="/assets/images/dashboard/infoIcon.svg"
                    width={17}
                    height={17}
                    alt="info icon"
                    className="mt-1"
                  />
                  <p className="text-[14px] font-[400] text-[#1A48AD]">
                    The treatment plan has been sent and is pending the
                    parent&apos;s signature.
                  </p>
                </div>

                <div className="flex gap-4 items-center">
                  <button
                    onClick={handleCopyLink}
                    className="rounded-[6px] bg-white border-[1px] border-[#E2E8F0] w-fit h-fit px-[12px] py-[8px] text-black text-[14px] font-[500] flex gap-2 items-center"
                  >
                    Copy Link
                    {hasCopyLink ? (
                      <Check className="w-5 h-5 text-black" />
                    ) : (
                      <Copy className="w-5 h-5 text-black" />
                    )}
                  </button>

                  <button
                    disabled={isResendingParentEmail}
                    onClick={handleResendTreatmentPlanToParent}
                    className="rounded-[6px] bg-[#2563EB] w-fit h-fit px-[12px] py-[8px] text-[#F8FAFC] text-[14px] font-[500] flex gap-2 items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResendingParentEmail ? (
                      <Loader height="h-fit" />
                    ) : (
                      <div className="flex gap-2 items-center">
                        Resend
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {treatmentPlanData?.status === "signed" && (
              <div className="flex justify-between items-center flex-wrap gap-3 p-5 border-[2px] border-[#6CE9A6] bg-[#F6FEF9] rounded-[8px]">
                <div className="flex gap-3 items-start">
                  <TriangleAlert className="w-5 h-5 text-[#12B76A]" />

                  <p className="text-[14px] font-[400] text-[#027A48]">
                    The treatment plan has been successfully sent and signed.
                  </p>
                </div>

                <div className="flex gap-4 items-center">
                  <button
                    onClick={handleCopyLink}
                    className="rounded-[6px] bg-white border-[1px] border-[#E2E8F0] w-fit h-fit px-[12px] py-[8px] text-black text-[14px] font-[500] flex gap-2 items-center"
                  >
                    Copy Link
                    {hasCopyLink ? (
                      <Check className="w-5 h-5 text-black" />
                    ) : (
                      <Copy className="w-5 h-5 text-black" />
                    )}
                  </button>

                  {/* <button
                      onClick={() => {
                        setShareTreatmentPlanModalOpen(true);
                      }}
                      className="rounded-[6px] bg-[#039855] w-fit h-fit px-[12px] py-[8px] text-[#F8FAFC] text-[14px] font-[500] flex gap-2 items-center"
                    >
                      Share Treatment Plan
                      <Upload className="w-5 h-5 text-white" />
                    </button> */}
                </div>

                <Dialog
                  open={shareTreatmentPlanModalOpen}
                  onOpenChange={setShareTreatmentPlanModalOpen}
                >
                  <DialogContent
                    style={{
                      boxShadow: "0 0 2000px rgba(0, 0, 0, 0.5)",
                    }}
                    className="bg-white rounded-[12px] flex flex-col gap-10 w-full md:max-w-[500px] h-fit"
                  >
                    <div className="flex flex-col gap-10">
                      <h2 className="text-[#101828] text-[18px] font-[600]">
                        Enter Recipient&apos;s Details
                      </h2>

                      <form className="flex flex-col gap-5">
                        <FormInput
                          labelText="Recipient's Name"
                          name="recipentName"
                          placeholder="Enter recipent's name"
                          type="text"
                          onChange={handleShareTreatmentPlanInputChange}
                          value={sharingTreatmentPlanFormData.recipentName}
                        />
                        <FormInput
                          labelText="Recipient's Email Address"
                          name="recipentEmail"
                          placeholder="Enter recipent's email address here"
                          type="text"
                          onChange={handleShareTreatmentPlanInputChange}
                          value={sharingTreatmentPlanFormData.recipentEmail}
                        />
                        <FormInput
                          labelText="Role/Position"
                          name="recipentRole"
                          placeholder="Enter recipent's role or position here"
                          type="text"
                          onChange={handleShareTreatmentPlanInputChange}
                          value={sharingTreatmentPlanFormData.recipentRole}
                        />
                      </form>

                      <div className="w-full flex flex-row flex-wrap lg:flex-nowrap gap-2">
                        <Button
                          variant="light"
                          onClick={() => setShareTreatmentPlanModalOpen(false)}
                          type="button"
                          className="w-full"
                          disabled={sharingTreatmentPlanFormData.isSubmitting}
                        >
                          Cancel
                        </Button>

                        <Button
                          onClick={handleShareTreatmentPlan}
                          type="button"
                          className="w-full"
                          isLoading={sharingTreatmentPlanFormData.isSubmitting}
                          disabled={sharingTreatmentPlanFormData.isSubmitting}
                        >
                          Share Treatment Plan
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            <div className="overflow-auto bg-black ">
              {treatmentPlanPdfDocument && (
                <PdfPreviewComp pdfDocument={treatmentPlanPdfDocument} />
              )}
            </div>
          </div>

          <div className="flex bg-white z-[3000] flex-col gap-5 fixed w-[96%] bottom-0 py-3">
            <div className="w-full flex flex-row flex-wrap gap-5 justify-center md:justify-end mt-auto lg:border-t-[1px] lg:pr-10 lg:py-5 lg:bg-white">
              <Button variant="light" onClick={handleCloseModal} type="button">
                Cancel
              </Button>

              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await handleDownloadPDF();
                }}
                disabled={isGeneratingPdf}
                className="flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] active:bg-[#4274e0f3] rounded-[6px] h-fit w-[174px] min-w-[174px] text-[14px] font-[400] text-[#F8FAFC] cursor-pointer"
              >
                {isGeneratingPdf ? <Loader height="h-fit" /> : "Download"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TreatmentPlanPdfModal;
