"use client";

import FormBadge from "@/components/badge/FormBadge";
import { PdfPreviewComp } from "@/components/pdf/PdfPreview";
import { Edit } from "lucide-react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import SignatureCanvas from "react-signature-canvas";
import { useToast } from "@/components/ui/use-toast";
import DownloadTreatmentPlan from "../download-treatment-plan";
import { retrieveClientTreatmentPlanForParent } from "@/use-cases/clients";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import { format } from "date-fns";
import { isValidArrayBuffer } from "@/components/clients/TreatmentPreviewModal";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { handleSignAndCompleteTreatmentPlan } from "@/actions/clients/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "@/components/file-upload/FileUpload";
import { createTreatmentPlanPDF } from "@/lib/pdf/treatmentPlanPdf";
import { convertDocDefinitionToUint8Array } from "@/utils/treatmentPlanHelpers";

const TreatmentPlanSignaturePage = () => {
  const { id } = useParams<{ id: string }>(); // Treatment plan full id
  const searchParams = useSearchParams();
  const rawTreatmentPlanType = searchParams.get("treatment_plan_type") ?? "IISS_Assessment";
  const treatmentPlanType = rawTreatmentPlanType.replace(/[\u200B-\u200D\u2060\uFEFF]/g, '');

  const queryClient = useQueryClient();
  const {
    data: treatmentPlanData,
    isLoading: isFetchingTreatmentPlan,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["clientTreatmentPlanForParent", id],
    queryFn: async () =>
      await retrieveClientTreatmentPlanForParent(id, treatmentPlanType),
  });

  const { toast } = useToast();

  const [step, setStep] = useState(1);

  const [imageURL, setImageURL] = useState("");
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] =
    useState<boolean>(false);

  const [treatmentPlanPdfDocument, setTreatmentPlanPdfDocument] =
    useState<Uint8Array | null>(null);

  const [isCompleting, setIsCompleting] = useState(false);
  const [initials, setInitials] = useState("");

  const [signatureTab, setSignatureTab] = useState("draw");

  const handleConvertAndSetPdfDocument = async () => {
    if (treatmentPlanData) {
      const docDefinition: any = await createTreatmentPlanPDF(
        {
          ...treatmentPlanData?.data,
          basicInformation: {
            ...treatmentPlanData?.data?.basicInformation,
            implementation_start_date: treatmentPlanData?.data?.basicInformation
              ?.implementation_start_date
              ? format(
                  new Date(
                    treatmentPlanData?.data?.basicInformation.implementation_start_date
                  ),
                  "MM/dd/yyyy"
                )
              : "",
            implementation_stop_date: treatmentPlanData?.data?.basicInformation
              ?.implementation_stop_date
              ? format(
                  new Date(
                    treatmentPlanData?.data?.basicInformation?.implementation_stop_date
                  ),
                  "MM/dd/yyyy"
                )
              : "",
          },
          goals: treatmentPlanData?.data?.treatmentGoal?.toSorted(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          ),
          treatmentGoalSignature:
            treatmentPlanData?.data?.treatmentGoalSignature,
          schedule:
            treatmentPlanData?.data?.treatmentSchedule &&
            treatmentPlanData?.data?.treatmentSchedule[0] &&
            treatmentPlanData?.data.treatmentSchedule[0].time_slot,
          status: treatmentPlanData?.data?.status,
          parent_name: treatmentPlanData?.data?.parent_name,
          parent_email: treatmentPlanData?.data?.parent_email,
          parent_email_sent: treatmentPlanData?.data?.parent_email_sent,
          relation_to_participant:
            treatmentPlanData?.data?.relation_to_participant,
          id: treatmentPlanData?.data?.id,
        },
        treatmentPlanData?.data?.parent_name ?? "",
        treatmentPlanData?.data?.treatmentGoalSignature?.parent_signature_url ??
          "",
        treatmentPlanData?.data?.treatmentGoalSignature?.date_parent_signed ??
          ""
      );
      const uint8Array = await convertDocDefinitionToUint8Array(docDefinition);

      if (isValidArrayBuffer(uint8Array.buffer)) {
        setTreatmentPlanPdfDocument(uint8Array);
      } else {
        console.error("Invalid or detached ArrayBuffer");
      }
    } else {
      console.error("TREATMMENT PLAN NOT FOUND");
    }
  };

  useEffect(() => {
    if (treatmentPlanData) {
      handleConvertAndSetPdfDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, treatmentPlanData, imageURL]);

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const saveSignature = async () => {
    setIsSignatureModalOpen(false);

    try {
      if (signatureTab === "draw") {
        const canvasData = signatureRef.current
          ?.getTrimmedCanvas()
          .toDataURL("image/png");

        if (!canvasData || canvasData.length < 500) {
          toast({
            description: "Please sign the field",
            variant: "destructive",
          });
          setIsSignatureModalOpen(true);

          return;
        }

        setImageURL(canvasData);
      } else if (signatureTab === "type") {
        if (!initials) {
          toast({
            description: "Please type your initials",
            variant: "destructive",
          });
          setIsSignatureModalOpen(true);

          return;
        }

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          console.error("Couldn't get canvas context");
          return null;
        }

        // Set canvas size
        canvas.width = 200; // Width of the image
        canvas.height = 100; // Height of the image

        // Set font and styling
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = "40px Arial";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.textBaseline = "middle";

        // Draw initials
        context.fillText(initials, canvas.width / 2, canvas.height / 2);

        const imageUrl = canvas.toDataURL("image/png");
        setImageURL(imageUrl);
      } else if (signatureTab === "upload") {
        if (!imageURL) {
          toast({
            description: "Please upload your signature",
            variant: "destructive",
          });
          setIsSignatureModalOpen(true);

          return;
        }
      }
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const handleCompleteAndSendTreatmentPlan = async () => {
    try {
      setIsCompleting(true);
      const response = await handleSignAndCompleteTreatmentPlan(
        id,
        imageURL,
        treatmentPlanType,
        signatureTab === "upload"
      );

      await refetch();
      queryClient.invalidateQueries({
        queryKey: [
          "clientTreatmentPlanDetail",
          treatmentPlanData?.data.intake_full_id,
        ],
      });

      if (response.status === false) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      if (!isFetching) {
        setStep(2);
      }
    } catch (error) {
      console.error("ERROR COMPLETING TREATMENT PLAN", error);
    } finally {
      setIsCompleting(false);
    }
  };

  useEffect(() => {
    if (
      treatmentPlanData?.data?.treatmentGoalSignature?.parent_signed === true &&
      treatmentPlanData?.data?.status === "signed"
    ) {
      setStep(2);
    }
  }, [treatmentPlanData]);

  if (isFetchingTreatmentPlan) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg border text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800 mt-4">
            Treatment Plan Not Found
          </h2>
          <p className="text-gray-600 mt-2">
            We couldn&apos;t retrieve the client treatment plan. Please try
            again later.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-all duration-300"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <main className="lg:fixed w-full flex flex-col bg-[#F5F5FA] lg:h-screen lg:min-h-screen lg:max-h-screen">
        <header className="w-full flex gap-2 items-center bg-white h-[10vh] border-[1px] border-[#E4E4E7] shadow-md py-[16px] px-[32px]">
          <div className="flex w-full items-center gap-3">
            <div className="w-fit mx-auto flex items-center flex-wrap gap-2 justify-center">
              <h2 className="text-[#101828] text-[24px] font-[600]">
                Treatment Plan -{" "}
                {treatmentPlanData?.data?.basicInformation
                  ?.participant_first_name ?? ""}{" "}
                {treatmentPlanData?.data?.basicInformation
                  ?.participant_last_name ?? ""}
              </h2>
              <FormBadge
                status={
                  treatmentPlanData?.data?.treatmentGoalSignature
                    ?.parent_signed === true &&
                  treatmentPlanData?.data?.status === "signed"
                    ? "Signed"
                    : "Not Signed"
                }
              >
                {treatmentPlanData?.data?.treatmentGoalSignature
                  ?.parent_signed === true &&
                treatmentPlanData?.data?.status === "signed"
                  ? "Signed"
                  : "Not Signed"}
              </FormBadge>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row justify-between">
          <div className="w-full flex flex-col gap-5 h-[90vh] min-h-[90vh] max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-in-out relative lg:max-w-[600px] mx-auto">
            {/* PDF here */}
            {treatmentPlanPdfDocument && (
              <PdfPreviewComp pdfDocument={treatmentPlanPdfDocument} />
            )}
          </div>

          <aside className="w-full lg:w-[450px] fixed bottom-0 lg:relative bg-white h-fit lg:h-[90vh] lg:min-h-[90vh] lg:max-h-[90vh] flex flex-col gap-5 p-5 border-t lg:border-none">
            <div className="flex flex-col gap-3">
              {imageURL && imageURL.length > 0 ? (
                <button
                  disabled={isCompleting}
                  onClick={handleCompleteAndSendTreatmentPlan}
                  className="bg-[#2563EB] hover:bg-[#4f85f8] active:bg-[#335db6] w-full px-5 py-1 h-[44px] rounded-[6px] text-[16px] font-[400] text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isCompleting ? <Loader height="h-fit" /> : "Complete & Send"}
                </button>
              ) : (
                <button
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="bg-[#2563EB] hover:bg-[#4f85f8] active:bg-[#335db6] w-full px-5 py-1 h-[44px] rounded-[6px] text-[16px] font-[400] text-white"
                >
                  Sign Treatment Plan
                </button>
              )}

              <button
                onClick={() => setIsSignatureModalOpen(true)}
                className="w-full h-[250px] bg-[#F5F5FA] p-5 relative flex items-center mt-5"
              >
                {imageURL && (
                  <button
                    disabled={!imageURL}
                    onClick={() => setIsSignatureModalOpen(true)}
                    className="absolute top-0 right-0 mr-2 mt-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Edit className="w-5 h-5 text-[#707078]" />
                  </button>
                )}

                {imageURL && imageURL.length > 0 && (
                  <Image
                    src={imageURL}
                    width={300}
                    height={300}
                    alt="signature"
                    className="w-[200px] h-[150px] m-auto"
                  />
                )}
              </button>
            </div>
          </aside>
        </div>

        <Dialog
          onOpenChange={setIsSignatureModalOpen}
          open={isSignatureModalOpen}
        >
          <DialogContent className="flex flex-col w-full gap-6 justify-center items-center bg-white border-none xl:min-w-[640px]">
            <Tabs
              onValueChange={setSignatureTab}
              value={signatureTab}
              className="w-full"
            >
              <TabsList className="w-[197px]">
                <TabsTrigger value="draw">Draw</TabsTrigger>
                <TabsTrigger value="type">Type</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="draw">
                <div className="w-full p-5 flex flex-col gap-5 h-[250px] bg-[#F1F5F9] active:bg-[#F1F5F9]">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: "sigCanvas bg-[#F1F5F9] h-[150px] w-full",
                    }}
                  />

                  <hr className="w-full border-[0.5px] border-gray-300" />

                  <button
                    onClick={clearSignature}
                    className="w-fit text-[#EF4444] hover:text-[#ad4444] disabled:cursor-not-allowed text-[14px] ml-auto"
                  >
                    Clear
                  </button>
                </div>
              </TabsContent>
              <TabsContent value="type">
                <div className="w-full p-5 flex flex-col gap-5 h-[200px] bg-[#F1F5F9] active:bg-[#F1F5F9]">
                  <input
                    type="text"
                    placeholder="Type your Initials here"
                    value={initials}
                    onChange={(e) => setInitials(e.target.value)}
                    className="bg-transparent outline-none text-black text-[25px] font-[400] placeholder-[#18181B4D] h-[170px]"
                  />
                  <hr className="w-full border-[0.5px] border-gray-300" />
                  <button
                    onClick={() => {
                      setInitials("");
                    }}
                    className="w-fit text-[#EF4444] hover:text-[#ad4444] disabled:cursor-not-allowed text-[14px] ml-auto"
                    disabled={!initials}
                  >
                    Clear
                  </button>
                </div>
              </TabsContent>
              <TabsContent value="upload">
                <div className="w-full pt-5 flex flex-col gap-5 h-fit bg-white">
                  <FileUpload getFileUrl={(fileUrl) => setImageURL(fileUrl)} />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-5 flex justify-center md:justify-start items-center gap-3 ml-auto">
              <DialogClose className="h-fit py-3 m-0 bg-white border-none">
                <p className="text-[#2563EB] text-[14px] font-[500]">Cancel</p>
              </DialogClose>

              <button
                className="px-5 py-3 text-white bg-[#2563EB] hover:bg-[#2564ebd9] disabled:cursor-not-allowed rounded-[6px] h-fit w-fit text-[14px] font-[400] active:bg-[#4274e0f3]"
                onClick={saveSignature}
                type="button"
              >
                {imageURL.length > 10 ? "Update Signature" : "Add Signature"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    );
  }

  if (step === 2) {
    return (
      <DownloadTreatmentPlan
        treatmentPlanData={treatmentPlanData}
        status={
          treatmentPlanData?.data?.treatmentGoalSignature?.parent_signed ===
          true
            ? "Signed"
            : "Not Signed"
        }
      />
    );
  }
};

export default TreatmentPlanSignaturePage;
