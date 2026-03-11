"use client";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/button/Button";
import SignatureCanvas from "react-signature-canvas";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  DialogHeader,
} from "@/components/ui/dialog";
import Image from "next/image";
import { CheckCircle, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useCustomMutation from "@/hooks/useCustomMutation";
import { handleCJISSignatureSubmission } from "@/actions/forms/cjis-form";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";
import Loader from "@/components/Loader";
import { CJIS_DOCUMENT_URL } from "@/constants";

const AttestationAndSignature = ({
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
  const { toast } = useToast();
  const [imageURL, setImageURL] = useState("");
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);
  const token = localStorage.getItem("token") as string;
  const [imageCanvasData, setImageCanvasData] = useState("");

  const { mutate, isPending } = useCustomMutation(
    async (imageURL: string) => {
      const base64Response = await fetch(imageURL);
      const blob = await base64Response.blob();
      const file = new File([blob], "signature.png", { type: "image/png" });

      const form = new FormData();
      form.append("file", file);

      const response = await handleCJISSignatureSubmission(form, token, method);

      refetch();

      // Handle submission response
      if (!response.status) {
        return toast({
          variant: "destructive",
          description: response.errorMessage,
        });
      }

      setDownloadModalOpen(true);
    },
    ["cjisForm", "formData"]
  );

  const clearSignature = () => {
    signatureRef.current?.clear();
    setImageURL("");
  };

  const saveSignature = async () => {
    setIsOpen(false);
    const canvasData = signatureRef.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");

    try {
      if (!canvasData || canvasData.length < 500) {
        toast({
          description: "Please sign the field",
          variant: "destructive",
        });
        setIsOpen(true);

        return;
      }

      setImageURL(canvasData);

      setImageCanvasData(canvasData);

      if (!isPending) {
        setIsOpen(false);
      }
    } catch (error: any) {
      throw new Error(error);
    }
  };

  useEffect(() => {
    if (
      typeof formInfo !== "boolean" &&
      formInfo?.data.signatureForm?.signature_data
    ) {
      setImageURL(formInfo?.data.signatureForm.signature_data ?? "");
    }
  }, [formInfo]);

  const hasInitiallySubmitted =
    formInfo?.data?.cjisForm?.pre_registration_id !== null;

  return (
    <section className="flex-1 h-fit lg:pb-[150px] lg:min-h-[70vh] flex flex-col gap-5">
      <h3 className="text-[#0F172A] text-[24px] font-[600]">Attestation</h3>

      <div className="flex flex-col gap-5 mt-5 pb-10">
        <p className="text-[#334155] text-[16px] font-[400]">
          I, the undersigned employee of Creed Medical Group, hereby acknowledge
          my responsibilities and obligations regarding the handling and
          protection of Criminal Justice Information (CJI) in compliance with
          COMAR 10.09.56.04 and all applicable CJIS security requirements. I
          understand that compliance with CJIS security requirements is
          essential for ensuring the privacy and security of individuals
          receiving Autism Waiver services, particularly children with autism.
          <br />
          <br />
          As an employee of Creed Medical Group providing Autism Waiver
          services, I attest to the following:
        </p>

        <ol className="list-decimal flex flex-col gap-5 text-[#334155] text-[16px] font-[400]">
          <li className="ml-5">
            I have received specialized CJIS security awareness training that
            includes an understanding of COMAR 10.09.56.04,
          </li>
          <li className="ml-5">
            I understand the importance of protecting the confidentiality,
            integrity, and availability of CJI in compliance with COMAR
            10.09.56.04.
          </li>
          <li className="ml-5">
            I will not disclose, share, or disseminate CJI related to Autism
            Waiver services to unauthorized individuals or entities.
          </li>
          <li className="ml-5">
            I will comply with all CJIS security policies, procedures, and
            guidelines, including those specific to Autism Waiver services,
            while performing my duties.
          </li>
          <li className="ml-5">
            I further understand that my compliance with CJIS security policies
            is a condition of my employment with Creed Medical Group and is
            especially crucial when providing Autism Waiver services to children
            with autism.
          </li>
          <li className="ml-5">
            I will go to the specified CJIS location for fingerprinting and
            Background check. I further understand that my employment depends on
            getting a satisfactory CJIS report.
          </li>
        </ol>
      </div>

      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        {imageURL.length === 0 && (
          <DialogTrigger
            disabled={signatureDisabled}
            onClick={() => setIsOpen(true)}
            className="flex justify-start"
          >
            <Button disabled={signatureDisabled} type="button">
              Sign Form
            </Button>
          </DialogTrigger>
        )}

        {imageURL.length > 10 && (
          <button className="bg-[#039855] w-fit h-fit rounded-[6px] p-[12px] text-white flex items-center gap-5">
            <CheckCircle /> Form Signed Successfully
          </button>
        )}

        {isPending && (
          <button className="bg-[#cea42f] w-fit h-fit rounded-[6px] p-[12px] text-white flex items-center gap-5">
            <Loader height="h-fit" />
          </button>
        )}

        <DialogContent className="flex flex-col w-full gap-6 justify-center items-center bg-[#0F172A] border-none xl:min-w-[640px]">
          <DialogHeader className="mr-auto">
            <h2 className="text-white text-[18px] font-[600] mr-auto">
              Sign here
            </h2>
          </DialogHeader>

          <div className="w-full p-5 flex flex-col gap-5 h-[300px] bg-white active:bg-white">
            <SignatureCanvas
              ref={signatureRef}
              // penColor="black"
              canvasProps={{
                className: "sigCanvas bg-white h-[200px] w-full",
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

          <DialogFooter className="mt-5 flex justify-center md:justify-start items-center gap-3 ml-auto">
            <DialogClose
              onClick={() => setIsOpen(false)}
              className="h-fit py-3 m-0 bg-[#0F172A] border-none hover:bg-[#0F172A]"
            >
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

      {imageURL && (
        <div className="flex flex-col gap-5 w-[250px] h-[200px] mt-5">
          <button
            disabled={
              status === "Awaiting Approval" ||
              status === "Approved" ||
              status === "Correction Required"
            }
            onClick={() => setIsOpen(true)}
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
          />
        </div>
      )}

      <Dialog onOpenChange={setDownloadModalOpen} open={downloadModalOpen}>
        <DialogContent className="flex flex-col w-full gap-6 justify-center items-center bg-white border-none xl:min-w-[640px]">
          <Image
            src="/assets/images/dashboard/checkmark.svg"
            width={80}
            height={80}
            alt="checkmark"
          />

          <h2 className="text-[20px] font-[600] text-[#101828]">
            CJIS Form Submitted Successfully
          </h2>

          <p className="text-[#475569] text-[14px] font-[400] xl:w-[90%] text-center pb-5">
            Please download, print, and fill in the applicant information
            section only of this document and take to your nearest CJIS
            fingerprint and background check center for fingerprinting.
            <br /> <br />
            After completing the fingerprinting process, return to this form and
            upload the receipt of completion in the document upload
            section.
          </p>

          <hr className="border-[1px] border-gray-200 w-full pt-" />

          <div className="flex items-center gap-5 flex-wrap justify-end ml-auto w-fit">
            <Button
              type="button"
              variant="light"
              onClick={() => {
                setDownloadModalOpen(false);
              }}
            >
              Cancel
            </Button>

            <button
              onClick={() => {
                setDownloadModalOpen(false);
              }}
            >
              <a
                className="flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] disabled:bg-[#2564eb69] disabled:hover:bg-[#2564eb69] disabled:text-white disabled:cursor-not-allowed rounded-[6px] h-fit w-[174px] min-w-[174px] text-[14px] font-[400] active:bg-[#4274e0f3] text-white"
                href={CJIS_DOCUMENT_URL}
                download
                target="_blank"
              >
                Download
              </a>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
        <Button
          variant="light"
          onClick={() => handleChangeIndex(currentIndex - 1)}
          type="button"
          disabled={currentIndex === 1 || isPending}
        >
          Previous Section
        </Button>

        <Button
          onClick={() => {
            if (hasInitiallySubmitted) {
              handleNewCompletedSection(currentIndex);
              handleChangeIndex(currentIndex + 1);
            } else {
              mutate(imageCanvasData);
            }
          }}
          disabled={!imageURL || isPending}
          type="button"
          isLoading={isPending}
        >
          {hasInitiallySubmitted ? "Next" : "Submit"}
        </Button>
      </div>
    </section>
  );
};

export default AttestationAndSignature;
