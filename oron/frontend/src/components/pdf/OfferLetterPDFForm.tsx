import React, { useEffect, useState } from "react";
import { Form, Viewer } from "@pdfme/ui";
import { Template } from "@pdfme/common";
import {
  fetchPdfAsBase64,
  getFontsData,
  getOfferLetterTemplate,
  getPlugins,
} from "@/utils/pdf/pdfHelpers";
import { useGlobalState } from "@/context/global-state";
import Loader from "../Loader";

const headerHeight = 65;

const OfferLetterPDFForm = ({
  designerRef,
  designer,
  inputs,
}: {
  designerRef: React.MutableRefObject<HTMLElement | null>;
  designer: React.MutableRefObject<Form | Viewer | null>;
  inputs?: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  const { state } = useGlobalState();
  const [isLoading, setIsLoading] = useState(false);

  const injectPDFData = async () => {
    if (
      typeof state.content?.data === "object" &&
      Object.keys(state.content?.data).length > 0
    ) {
      setIsLoading(true);

      const base64String = await fetchPdfAsBase64(
        state.content.data.offer_letter_pdf_url as string
      );

      if (base64String && !loaded) {
        let template: Template = getOfferLetterTemplate(
          `data:application/pdf;base64,${base64String}`,
          state.content.data?.job_position
        );

        const inputsString = [{ signature: "" }];

        getFontsData().then((font) => {
          if (designerRef.current) {
              designer.current = new Viewer({
                domContainer: designerRef.current,
                template,
                inputs: inputsString,
                options: { font },
                plugins: getPlugins(),
              });

            setLoaded(true);
          }
        });
      }

      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (designerRef.current) {
      injectPDFData();
    }

    return () => {
      if (designer.current) {
        designer.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designerRef, state]);

  if (isLoading) {
    return <Loader height="h-[80vh]" />;
  }

  return (
    <div>
      <div
        ref={designerRef as React.MutableRefObject<HTMLDivElement | null>}
        // className="pdf"
        style={{
          // width: "100%",
          height: `calc(100vh - ${headerHeight}px)`,
          background: "white",
        }}
      />
    </div>
  );
};

export default OfferLetterPDFForm;
