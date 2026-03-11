import React, { useEffect, useRef, useState } from "react";
import { Form, Viewer } from "@pdfme/ui";
import { Template, checkTemplate } from "@pdfme/common";
import { PDFDocument } from "pdf-lib";
import Button from "../button/Button";
import {
  downloadJsonFile,
  getFontsData,
  getPlugins,
} from "@/utils/pdf/pdfHelpers";
import { getTemplate } from "@/utils/pdf/pdfHelpers";
import { FormattedFormStatus } from "@/types/form-types/FormTypes";

const headerHeight = 65;

const AdminINineFormPDFReader = ({
  viewer,
  viewerRef,
  inputs,
  designerRef,
  designer,
  handleCompChange,
  status,
}: {
  viewerRef: React.MutableRefObject<HTMLElement | null>;
  viewer: React.MutableRefObject<Viewer | null> | any;
  inputs?: string;
  designerRef: React.MutableRefObject<HTMLElement | null>;
  designer: React.MutableRefObject<Form | null> | any;
  handleCompChange: () => void;
  status: FormattedFormStatus;
}) => {
  const designerIsDestroyed = useRef(false);
  const viewerIsDestroyed = useRef(false);

  useEffect(() => {
    if (designerRef.current) {
      let template: Template = getTemplate();
      let inputsVar = [{}];
      try {
        const inputsString = inputs;
        const inputsJson = inputsString ? JSON.parse(inputsString) : [{}];
        inputsVar = inputsJson;
      } catch {
        localStorage.removeItem("inputs");
      }

      getFontsData().then((font) => {
        if (designerRef.current) {
          designer.current = new Form({
            domContainer: designerRef.current,
            template,
            inputs: inputsVar,
            options: { font, scale: 2 },
            plugins: getPlugins(),
          });
        }
      });
      handleCompChange();
    }

    return () => {
      if (
        !designerIsDestroyed.current &&
        designer?.current &&
        typeof designer.current.destroy === "function"
      ) {
        designer.current.destroy();
        designerIsDestroyed.current = true; // Mark the instance as destroyed
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designerRef, inputs, status]);

  useEffect(() => {
    let template: Template = getTemplate();

    let inputsVar = [{}];

    try {
      const inputsString = inputs;
      const inputsJson = inputsString ? JSON.parse(inputsString) : [{}];
      inputsVar = inputsJson;
    } catch {
      localStorage.removeItem("inputs");
    }

    getFontsData().then((font) => {
      if (viewerRef.current) {
        viewer.current = new Viewer({
          domContainer: viewerRef.current,
          template,
          options: { font },
          plugins: getPlugins(),
          inputs: inputsVar,
        });

        handleCompChange();
      }
    });

    return () => {
      if (
        !viewerIsDestroyed.current &&
        viewer?.current &&
        typeof viewer.current.destroy === "function"
      ) {
        viewer.current.destroy();
        viewerIsDestroyed.current = true; // Mark the instance as destroyed
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerRef, inputs, status]);

  // return (
  //   <div>
  //     <div
  //       className='pdf'
  //       ref={viewerRef as React.MutableRefObject<HTMLDivElement | null>}
  //       style={{ width: '100%', height: `calc(100vh - ${headerHeight}px)` }}
  //     />{' '}
  //   </div>
  // );

  return (
    <div>
      <div
        ref={
          status === "Approved"
            ? (viewerRef as React.MutableRefObject<HTMLDivElement | null>)
            : (designerRef as React.MutableRefObject<HTMLDivElement | null>)
        }
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

export default AdminINineFormPDFReader;
