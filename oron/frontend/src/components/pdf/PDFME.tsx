import React, { useEffect, useRef, useState } from "react";
import { Designer, Form, Viewer } from "@pdfme/ui";
import { Template, checkTemplate } from "@pdfme/common";
import { PDFDocument } from "pdf-lib";
import Button from "../button/Button";
import {
  downloadJsonFile,
  getFontsData,
  getPlugins,
} from "@/utils/pdf/pdfHelpers";
import { getTemplate } from "@/utils/pdf/pdfHelpers";

const headerHeight = 65;

const PDFReader = () => {
  const designerRef = useRef<HTMLDivElement | null>();
  const designer = useRef<Designer | null>();
  useEffect(() => {
    let template: Template = getTemplate();

    getFontsData().then((font) => {
      if (designerRef.current) {
        designer.current = new Designer({
          domContainer: designerRef.current,
          template,
          options: { font },
          plugins: getPlugins(),
        });

        designer.current.onSaveTemplate(onSaveTemplate);
      }
    });

    return () => {
      if (designer.current) {
        designer.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designerRef]);

  const onSaveTemplate = (template?: Template) => {
    if (designer.current) {
      localStorage.setItem(
        "template",
        JSON.stringify(template || designer.current.getTemplate())
      );
      alert("Saved!");
    }
  };

  const onDownloadTemplate = () => {
    if (designer.current) {
      downloadJsonFile(designer.current.getTemplate(), "template");
    }
  };

  return (
    <div>
      <button onClick={onDownloadTemplate}>Download</button>
      <div
        ref={designerRef as React.MutableRefObject<HTMLDivElement | null>}
        style={{ width: "100%", height: `calc(100vh - ${headerHeight}px)` }}
      />{" "}
    </div>
  );
};

export default PDFReader;
