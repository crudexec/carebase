"use client";

import { useEffect, useRef, useState } from "react";
import FormBadge from "@/components/badge/FormBadge";
import OfferLetterPreview from "./OfferLetterPreview";
import Button from "@/components/button/Button";
import SignatureCanvas from "react-signature-canvas";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogHeader,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Form } from "@pdfme/ui";
import { handleSignOfferLetter } from "@/actions/forms/offer-letter";
import {
  GLOBAL_REDUCER_ACTION_TYPE,
  useGlobalState,
} from "@/context/global-state";
import { generateFormDataFromPDF } from "@/utils/pdf/pdfHelpers";
import { handleDocumentUpload } from "@/actions/upload";
import { useQuery } from "@tanstack/react-query";
import { OfferLetterResponse } from "@/types/OfferLetterTypes";
import { retrieveOfferLetterForm } from "@/use-cases/forms";
import Loader from "@/components/Loader";
import FormSuggestionDialog from "@/components/FormSuggestionDialog";
import BreadCrumb from "@/components/BreadCrumb";

const OfferLetterPageWrapper = () => {
  const [userHasSign, setUserHasSign] = useState<boolean>(false);
  const { toast } = useToast();
  const [imageURL, setImageURL] = useState("");
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);

  const [signLoading, setSignLoading] = useState<boolean>(false);
  const designerRef = useRef<HTMLDivElement | null>(null);
  const designer = useRef<Form | null>(null);

  const token = localStorage.getItem("token") as string;

  const { data: offerLetterData, isLoading: offerLetterLoading } = useQuery<
    OfferLetterResponse | undefined
  >({
    queryKey: ["offerLetter"],
    queryFn: async () => await retrieveOfferLetterForm(token),
  });

  const offerLetter =
    typeof offerLetterData !== "boolean" && typeof offerLetterData === "object"
      ? offerLetterData
      : undefined;

  const { dispatch, state } = useGlobalState();

  const updateOfferLetterGlobalState = async () => {
    if (offerLetter) {
      dispatch({
        type: GLOBAL_REDUCER_ACTION_TYPE.SET_CONTENT,
        payload: {
          loaded: true,
          data: offerLetter?.data,
        },
      });
    }
  };

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

      designer.current?.setInputs([
        {
          signature: canvasData,
        },
      ]);
      setImageURL(canvasData);
      setUserHasSign(true);
      setIsOpen(false);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const handleSubmit = async () => {
    setSignLoading(true);

    if (designer.current && token) {
      const template = designer.current.getTemplate();
      const inputs = designer.current.getInputs();

      const res: File = await generateFormDataFromPDF({
        template,
        inputs,
        filename: 'offer-letter.pdf'
      });

      const formData = new FormData();
      formData.append("document", res);

      try {
        const file_url = await handleDocumentUpload(formData, token);
        const { status, errorMessage } = await handleSignOfferLetter(
          file_url,
          token
        );

        if (!status) {
          return toast({
            variant: "destructive",
            description: errorMessage,
          });
        }

        setOpenModal(true);
      } catch (error: any) {
        throw new Error(error);
      }
    }
    setSignLoading(false);
  };

  useEffect(() => {
    dispatch({
      type: GLOBAL_REDUCER_ACTION_TYPE.SET_CONTENT,
      payload: {
        loaded: false,
        data: {},
      },
    });
    updateOfferLetterGlobalState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerLetterData]);

  if (offerLetterLoading) {
    return <Loader height="h-[80vh]" />;
  }

  return (
    <div className="w-full flex flex-col gap-5 relative">
      {openModal && (
        <FormSuggestionDialog
          formName="Offer Letter Form"
          openModal={openModal}
          closeModal={() => setOpenModal(false)}
          nextFormUrl="/onboarding/form/biodata"
          nextFormName="Biodata Form"
        />
      )}

      <div className="flex flex-col gap-5 bg-white">
        <BreadCrumb
          links={[
            {
              name: "Forms",
              route: "/onboarding/form",
            },
            {
              name: "Offer Letter",
              route: "/onboarding/form/offer-letter",
            },
          ]}
          fixed={true}
        />

        <div className="w-full flex flex-col">
          <div className="lg:fixed lg:mt-5 text-[30px] lg:z-[500] w-full xl:w-[80%] pr-10 bg-white font-[600] text-[#101828] xl:py-5 flex flex-col lg:flex-row lg:justify-between flex-wrap lg:items-center gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
              <span>Offer Letter</span>
              <FormBadge
                status={
                  offerLetter?.data?.signed === true ? "Approved" : "Not Filled"
                }
              >
                {offerLetter?.data?.signed === true ? "Approved" : "Not Filled"}
              </FormBadge>
            </div>

            <div className="hidden xl:flex mr-[10px] gap-5 w-fit items-center">
              {userHasSign || offerLetter?.data?.signed === true ? (
                <Button
                  onClick={handleSubmit}
                  disabled={signLoading || state.content?.data?.signed}
                >
                  {offerLetter?.data?.signed === true
                    ? "Signed"
                    : signLoading
                    ? "Loading ... "
                    : "Submit"}
                </Button>
              ) : (
                <div>
                  {imageURL.length < 10 && (
                    <Button
                      onClick={() => setIsOpen(true)}
                      disabled={state.content?.data?.signed}
                    >
                      Sign
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-5 w-full items-center xl:hidden lg:mt-28 mt-10 ml-auto">
            {userHasSign || offerLetter?.data?.signed === true ? (
              <Button
                onClick={handleSubmit}
                disabled={signLoading || state.content?.data?.signed}
              >
                {signLoading ? "Loading ... " : "Submit"}
              </Button>
            ) : (
              <div>
                {imageURL.length < 10 && (
                  <Button
                    onClick={() => setIsOpen(true)}
                    disabled={state.content?.data?.signed}
                  >
                    Sign
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        {imageURL.length > 10 && (
          <button className="bg-[#039855] w-fit h-fit rounded-[6px] p-[12px] text-white flex items-center gap-5">
            <CheckCircle /> Form Signed Successfully
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

      <section className="relative w-full flex flex-col lg:flex-row lg:mt-0 xl:mt-[90px] mt-0">
        <div className="flex flex-col gap-5 xl:ml-[100px] flex-1 lg:pl-10 max-w-[80vw] overflow-auto lg:w-full">
          <OfferLetterPreview
            designer={designer}
            designerRef={designerRef}
            inputs=""
          />
        </div>
      </section>
    </div>
  );
};

export default OfferLetterPageWrapper;
