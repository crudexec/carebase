"use client";
import React, { useEffect, useRef, useState } from "react";
import PDFReader from "@/components/pdf/INinePDFForm";
import {
  FormattedFormStatus,
  INineFormResponse,
} from "@/types/form-types/FormTypes";
import { User } from "@/types/UserTypes";
import Button from "@/components/button/Button";
import ConfirmModal from "@/components/ConfirmDialog";
import useModal from "@/context/modal";
import { Form } from "@pdfme/ui";
import { submitPDFInputData } from "../logic/personal-information/useSubmission";
import { useToast } from "@/components/ui/use-toast";
import {
  GLOBAL_REDUCER_ACTION_TYPE,
  useGlobalState,
} from "@/context/global-state";
import FormBanner from "@/components/banner/FormBanner";

const I9FormPDFForm = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  pdfInfo,
  user,
  method,
  refetch,
  reviewNote,
  status,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  pdfInfo: boolean | INineFormResponse | undefined;
  user: User;
  method: "POST" | "PATCH";
  refetch: any;
  reviewNote: string;
  status: FormattedFormStatus;
}) => {
  const { openModal, closeModal } = useModal("CONFIRM_MODAL");
  const designerRef = useRef<HTMLDivElement | null>(null);
  const designer = useRef<Form | null>(null);
  const [loading, setLoading] = useState(false);
  const [compUpdate, setCompUpdate] = useState(false);
  const { dispatch, state } = useGlobalState();

  const handleCompChange = () => {
    setCompUpdate((prev) => !prev);
  };

  const { toast } = useToast();

  const sanitizeData = (data: any) => {
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed.map((item: any) => ({ ...item })));
    } catch {
      return "[{}]";
    }
  };

  useEffect(() => {
    dispatch({
      type: GLOBAL_REDUCER_ACTION_TYPE.SET_CONTENT,
      payload: {
        loaded: true,
        data: sanitizeData(
          pdfInfo && typeof pdfInfo !== "boolean"
            ? pdfInfo.data.i9Form.filled_pdf_json_data
            : "[{}]"
        ),
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designer.current, designerRef.current, compUpdate]);

  const onSaveInputs = async () => {
    if (designer.current) {
      const inputs = designer.current.getInputs();

      const inputString = JSON.stringify(inputs);
      const res = await submitPDFInputData({
        filled_pdf_json_data: inputString,
        method,
      });

      if (!res.status) {
        toast({
          variant: "destructive",
          description: res.errorMessage,
        });
      }
      if (res.status) {
        dispatch({
          type: GLOBAL_REDUCER_ACTION_TYPE.SET_CONTENT,
          payload: {
            loaded: true,
            data: inputString,
          },
        });

        handleChangeIndex(currentIndex + 1);
        handleNewCompletedSection(currentIndex);
        closeModal();
      }
      setLoading(false);
    }
  };

  return (
    <div className="px-4">
      {status === "Correction Required" && (
        <FormBanner variant="warning" text={reviewNote} />
      )}

      <div className="mb-4">
        <h4 className="text-[28px] font-[600] text-[#0F172A] mt-5">
          Step 2: Fill the i-9 form with your correct information
        </h4>
        <p>
          Please fill in your information correctly on the form and ensure that
          you fill it out completely.
        </p>
      </div>
      <PDFReader
        designer={designer}
        handleCompChange={handleCompChange}
        designerRef={designerRef}
        inputs={state.content}
      />

      <div className="pt-20 flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
        <Button
          onClick={() => handleChangeIndex(currentIndex - 1)}
          type="button"
          disabled={currentIndex === 1}
          variant="light"
        >
          Previous Section
        </Button>

        {currentIndex !== 6 && (
          <Button
            onClick={() => openModal()}
            type="button"
            disabled={!designer.current}
          >
            Next Section
          </Button>
        )}
      </div>
      <ConfirmModal
        isLoading={loading}
        confirmationText="Are you sure you  have Verified that all required fields are filled  correctly"
        handleConfirm={() => {
          setLoading(true);
          onSaveInputs();
        }}
        confirmMationHeader="Completed the Form ?"
      />
    </div>
  );
};

// lg:fixed bottom-0 right-0
export default I9FormPDFForm;
