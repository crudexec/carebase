"use client";

import { useRef, useState, useEffect } from "react";
import Button from "@/components/button/Button";
import { User } from "@/types/UserTypes";
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
import { capitalizeFirstLetter } from "@/utils";
import { MMRFormResponse } from "@/types/form-types/MMRFormTypes";
import { handleMMRSignatureSubmission } from "@/actions/forms";
import FormBanner from "@/components/banner/FormBanner";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import useCustomMutation from "@/hooks/useCustomMutation";
import { submitForm } from "@/actions/forms/submit-form";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";

const Signature = ({
  user,
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  method,
  refetch,
  data,
  signatureDisabled,
  status,
  refetchFormStatus,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  user: User;
  method: "POST" | "PATCH";
  refetch: any;
  data: MMRFormResponse | boolean | undefined;
  signatureDisabled: boolean;
  status: FormattedFormStatus;
  refetchFormStatus: any;
}) => {
  const token = localStorage.getItem("token") as string;
  const [isLoading, setIsLoading] = useState(false);

  const { mutate, isPending } = useCustomMutation(
    async (imageURL: string) => {
      const base64Response = await fetch(imageURL);
      const blob = await base64Response.blob();
      const file = new File([blob], "signature.png", { type: "image/png" });

      const form = new FormData();
      form.append("file", file);
      const response = await handleMMRSignatureSubmission(form, token, method);

      refetch();

      // Handle submission response
      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }
    },
    ["MMRForm", "formData", "offerLetter"]
  );

  const router = useRouter();
  const { toast } = useToast();
  const [imageURL, setImageURL] = useState("");
  const [signed, setSigned] = useState(false);
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [signMonitor, setSignMonitor] = useState(false);

  const clearSignature = () => {
    signatureRef.current?.clear();
    setImageURL("");
  };

  const saveSignature = async () => {
    const canvasData = signatureRef.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");

    if (!canvasData) {
      return;
    }

    try {
      setImageURL(canvasData);
      if (!canvasData || canvasData.length < 500) {
        setSigned(false);
        toast({
          description: "Please sign the field",
          variant: "destructive",
        });
        setIsOpen(true);

        return;
      }
      mutate(canvasData);

      if (!isPending) {
        setIsOpen(false);
        setSignMonitor(true);
        setSigned(true);
      }
    } catch (error: any) {
      throw new Error(error);
    }
  };

  useEffect(() => {
    if (
      typeof data !== "boolean" &&
      data?.data.mmrSignatureForm?.signature_data
    ) {
      setImageURL(data?.data.mmrSignatureForm.signature_data ?? "");

      setSigned(true);
    }
  }, [data]);

  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <h3 className="text-[#0F172A] text-[18px] font-[600]">Signature</h3>
        <p className="text-[#334155] text-[16px] font-[400]">
          I,{" "}
          <span className="font-[700]">
            {capitalizeFirstLetter(
              `${user.data.first_name} ${user.data.last_name}`
            )}
          </span>{" "}
          attest that this information is true and correct. I understand that
          this declination will be void if I later choose to be vaccinated.
        </p>
      </div>

      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        {!signed && !isPending && (
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

        {signed && !isPending && (
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
              {signed ? "Update Signature" : "Add Signature"}
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
    </section>
  );
};

export default Signature;
