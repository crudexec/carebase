import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface FormFieldData {
  [key: string]: string;
}

const FormFields: React.FC<{ getAnnotationFields: () => any }> = ({
  getAnnotationFields,
}) => {
  const [formData, setFormData] = useState<FormFieldData>({});

  const handleFormFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const fields = getAnnotationFields();
  return fields.map((field: any) => (
    <div key={field.name}>
      <label htmlFor={field.name}>{field.name}</label>
      {field.fieldType === "Tx" && (
        <input
          type="text"
          id={field.name}
          name={field.name}
          value={formData[field.name] || ""}
          onChange={handleFormFieldChange}
        />
      )}
      {field.fieldType === "Btn" && (
        <button
          type="button"
          id={field.name}
          name={field.name}
          onClick={() => handleFormFieldChange(field.name)}
        >
          {formData[field.name] || "Click me"}
        </button>
      )}
    </div>
  ));
};

const FillablePDFForm: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
    }
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={handleFileUpload} />
      {pdfFile && (
        <Document file={pdfFile}>
          <Page
            pageNumber={1}
            renderAnnotationLayer={true}
            renderTextLayer={false}
          >
            {/* <FormFields getAnnotationFields={getAnnotationFields} /> */}
          </Page>
        </Document>
      )}
    </div>
  );
};

export default FillablePDFForm;
