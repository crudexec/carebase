"use client";

import OfferLetterPDFForm from "@/components/pdf/OfferLetterPDFForm";
import { Form } from "@pdfme/ui";
import React from "react";

const OfferLetterPreview = ({
  designerRef,
  designer,
  inputs,
}: {
  designerRef: React.MutableRefObject<HTMLElement | null>;
  designer: React.MutableRefObject<Form | null>;
  inputs?: string;
}) => {
  return (
    <section className="mt-5 flex-1 h-fit lg:pb-[150px] lg:min-h-[70vh] flex flex-col gap-5 max-w-[80vw] overflow-auto lg:w-full">
      <OfferLetterPDFForm
        inputs=""
        designer={designer}
        designerRef={designerRef}
      />
    </section>
  );
};

export default OfferLetterPreview;
