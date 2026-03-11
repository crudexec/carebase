import React, { useEffect, useRef, useState } from "react";
import { Form, Viewer } from "@pdfme/ui";
import { Template } from "@pdfme/common";
import {
  downloadJsonFile,
  getFontsData,
  getPlugins,
} from "@/utils/pdf/pdfHelpers";
import { getTemplate } from "@/utils/pdf/pdfHelpers";
import useLogic from "../forms/employee-demographic-form/logic/personal-information/useLogic";
import { useGlobalState } from "@/context/global-state";

const headerHeight = 65;

const PDFReader = ({
  designerRef,
  designer,
  inputs,
  handleCompChange,
}: {
  designerRef: React.MutableRefObject<HTMLElement | null>;
  designer: React.MutableRefObject<Form | null> | any;
  inputs?: string;
  handleCompChange: () => void;
}) => {
  const { state } = useGlobalState();

  useEffect(() => {
    if (designerRef.current) {
      let template: Template = getTemplate();
      let inputsVar = [{}];
      try {
        const inputsString = state.content.data;
        inputsVar = inputsString ? JSON.parse(inputsString) : [{}];
      } catch (error) {
        console.error("Error parsing inputs:", error);
        inputsVar = [{}];
      }

      getFontsData().then((font) => {
        if (designerRef.current && state.content.loaded) {
          designer.current = new Form({
            domContainer: designerRef.current,
            template,
            inputs: inputsVar,
            options: { font, scale: 2 },
            plugins: getPlugins(),
          });

          handleCompChange();
        }
      });
    }

    return () => {
      if (designer.current) {
        designer.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designerRef, state.content.loaded]);

  return (
    <div>
      <div
        ref={designerRef as React.MutableRefObject<HTMLDivElement | null>}
        className="pdf"
        style={{
          width: "100%",
          height: `calc(100vh - ${headerHeight}px)`,
          background: "white",
        }}
      />
    </div>
  );
};

export default PDFReader;
