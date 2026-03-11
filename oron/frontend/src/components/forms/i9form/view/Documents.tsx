"use client";

import { useState, useEffect } from "react";
import FormInput from "@/components/input-fields/FormInput";
import Button from "@/components/button/Button";
import { Label } from "@/components/ui/label";
import { UploadIcon, Loader2 } from "lucide-react";
import { DatePicker } from "../../../calendar/CalendarSelect";
import {
  DocumentAFormData,
  DocumentBAndCFormData,
  AllDocumentType,
  allDocumentSchema,
} from "@/utils/schemas/FormValidationSchema";
import { useToast } from "@/components/ui/use-toast";
import FormBanner from "../../../banner/FormBanner";
import {
  handleI9FormSingleDocumentSubmission,
  handleI9FormMultipleDocumentSubmission,
} from "@/actions/forms";
import { INineFormResponse } from "@/types/form-types/FormTypes";
import { handleDocumentUpload } from "@/actions/upload";
import { validationEngine, validateForm } from "@/utils/validators";
import { documentASchema, documentBAndCSchema } from "@/utils/schemas";
import Image from "next/image";
import useCustomMutation from "@/hooks/useCustomMutation";
import FileUpload from "@/components/file-upload/FileUpload";
import { formatDateToUTCString } from "@/utils/date-utils";

const Documents = ({
  handleNewCompletedSection,
  currentIndex,
  handleChangeIndex,
  data,
  method,
  refetch,
}: {
  handleNewCompletedSection: (newSection: number) => void;
  currentIndex: number;
  handleChangeIndex: (newIndex: number) => void;
  data: boolean | INineFormResponse | undefined;
  method: "POST" | "PATCH";
  refetch: any;
}) => {
  const { toast } = useToast();
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [documentA, setDocumentA] = useState<{
    passport: string;
    issuingAuthority: string;
    documentNumber: string;
    expDate: Date | undefined;
  }>({
    passport: "",
    issuingAuthority: "",
    documentNumber: "",
    expDate: undefined,
  });
  const [documentB, setDocumentB] = useState<{
    passport: string;
    issuingAuthority: string;
    documentNumber: string;
    expDate: Date | undefined;
  }>({
    passport: "",
    issuingAuthority: "",
    documentNumber: "",
    expDate: undefined,
  });
  const [documentC, setDocumentC] = useState<{
    passport: string;
    issuingAuthority: string;
    documentNumber: string;
    expDate: Date | undefined;
  }>({
    passport: "",
    issuingAuthority: "",
    documentNumber: "",
    expDate: undefined,
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    documentA: "",
    documentB: "",
    documentC: "",
  });

  const [documentASelectedDate, setDocumentASelectedDate] = useState<Date>();
  const [documentBSelectedDate, setDocumentBSelectedDate] = useState<Date>();
  const [documentCSelectedDate, setDocumentCSelectedDate] = useState<Date>();

  const [error, setError] = useState<{
    field: string[];
    message: string[];
  }>({
    field: [],
    message: [],
  });

  let formDisabled: boolean = false;
  let isFormAwaitingApproval: boolean = false;

  if (typeof data !== "boolean") {
    formDisabled =
      data?.status === "awaiting_approval" || data?.status === "approved";
    isFormAwaitingApproval = data?.status === "awaiting_approval";
  }

  useEffect(() => {
    if (typeof data !== "boolean" && data) {
      const documents = data.data.documents;

      if (Array.isArray(documents)) {
        if (documents.length === 3) {
          setDocumentA({
            passport: documents[0].title ?? "",
            issuingAuthority: documents[0].issuing_authority ?? "",
            documentNumber: documents[0].document_number ?? "",
            expDate:
              documents[0]?.expiration_date?.length > 1
                ? new Date(documents[0].expiration_date)
                : undefined,
          });
          setDocumentB({
            passport: documents[1].title ?? "",
            issuingAuthority: documents[1].issuing_authority ?? "",
            documentNumber: documents[1].document_number ?? "",
            expDate:
              documents[1]?.expiration_date?.length > 1
                ? new Date(documents[1].expiration_date)
                : undefined,
          });
          setDocumentC({
            passport: documents[2].title ?? "",
            issuingAuthority: documents[2].issuing_authority ?? "",
            documentNumber: documents[2].document_number ?? "",
            expDate:
              documents[2].expiration_date?.length > 1
                ? new Date(documents[2].expiration_date)
                : undefined,
          });
          setUploadedFiles((prevState) => ({
            ...prevState,
            documentA: documents[0].file_url,
            documentB: documents[1].file_url,
            documentC: documents[2].file_url,
          }));
          setDocumentASelectedDate(
            documents[0]?.expiration_date?.length > 1
              ? new Date(documents[0].expiration_date)
              : undefined
          );
          setDocumentBSelectedDate(
            documents[1]?.expiration_date?.length > 1
              ? new Date(documents[1].expiration_date)
              : undefined
          );
          setDocumentCSelectedDate(
            documents[2].expiration_date?.length > 1
              ? new Date(documents[2].expiration_date)
              : undefined
          );
        } else if (documents.length === 2) {
          setDocumentB({
            passport: documents[0].title ?? "",
            issuingAuthority: documents[0].issuing_authority ?? "",
            documentNumber: documents[0].document_number ?? "",
            expDate:
              documents[0]?.expiration_date?.length > 1
                ? new Date(documents[0].expiration_date)
                : undefined,
          });
          setDocumentC({
            passport: documents[1].title ?? "",
            issuingAuthority: documents[1].issuing_authority ?? "",
            documentNumber: documents[1].document_number ?? "",
            expDate:
              documents[1]?.expiration_date?.length > 1
                ? new Date(documents[1].expiration_date)
                : undefined,
          });
          setUploadedFiles((prevState) => ({
            ...prevState,
            documentB: documents[0].file_url,
            documentC: documents[1].file_url,
          }));
          setDocumentBSelectedDate(
            documents[0]?.expiration_date?.length > 1
              ? new Date(documents[0].expiration_date)
              : undefined
          );
          setDocumentCSelectedDate(
            documents[1]?.expiration_date?.length > 1
              ? new Date(documents[1].expiration_date)
              : undefined
          );
        } else if (documents.length === 1) {
          setDocumentA({
            passport: documents[0].title ?? "",
            issuingAuthority: documents[0].issuing_authority ?? "",
            documentNumber: documents[0].document_number ?? "",
            expDate:
              documents[0]?.expiration_date?.length > 1
                ? new Date(documents[0].expiration_date)
                : undefined,
          });
          setUploadedFiles((prevState) => ({
            ...prevState,
            documentA: documents[0].file_url,
          }));
          setDocumentASelectedDate(
            documents[0]?.expiration_date?.length > 1
              ? new Date(documents[0].expiration_date)
              : undefined
          );
        }
      }
    }
  }, [data]);

  const handleDocumentA = async (
    documentA: string,
    issuingAuthority: string,
    documentNumber: string
  ) => {
    try {
      if (!uploadedFiles.documentA) {
        toast({
          variant: "destructive",
          description: "Document A Document must be uploaded",
        });

        return;
      }

      const data: DocumentAFormData = {
        documentA: documentA,
        documentAIssuingAuthority: issuingAuthority,
        documentADocumentNumber: documentNumber,
        documentAExpirationDate:
          formatDateToUTCString(documentASelectedDate!) ?? "",
        documentAFile: uploadedFiles.documentA,
      };

      const validationResult = validationEngine(
        data,
        validateForm,
        documentASchema
      );
      if (validationResult.field.length > 0) {
        setError(validationResult);
        toast({
          variant: "destructive",
          description: "There is an error in the input fields",
        });
        return;
      }

      setError({
        field: [],
        message: [],
      });

      const token = localStorage.getItem("token") as string;
      const response = await handleI9FormSingleDocumentSubmission(
        data,
        token,
        uploadedFiles.documentA,
        method
      );

      refetch();

      // Handle submission response
      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const handleDocumentBAndC = async (
    formData: FormData,
    documentB: string,
    documentC: string
  ) => {
    try {
      const documentBIssuingAuthority = formData.get(
        "documentBIssuingAuthority"
      ) as string;
      const documentBDocumentNumber = formData.get(
        "documentBDocumentNumber"
      ) as string;
      const documentCIssuingAuthority = formData.get(
        "documentCIssuingAuthority"
      ) as string;
      const documentCDocumentNumber = formData.get(
        "documentCDocumentNumber"
      ) as string;

      if (!uploadedFiles.documentB || !uploadedFiles.documentC) {
        toast({
          variant: "destructive",
          description: "Document B and C Document must be uploaded",
        });

        return;
      }

      const data: DocumentBAndCFormData = {
        documentB: documentB,
        documentBIssuingAuthority,
        documentBDocumentNumber,
        documentBExpirationDate:
          formatDateToUTCString(documentBSelectedDate!) ?? "",
        documentBFile: uploadedFiles.documentB,
        documentC: documentC,
        documentCIssuingAuthority,
        documentCDocumentNumber,
        documentCExpirationDate:
          formatDateToUTCString(documentCSelectedDate!) ?? "",
        documentCFile: uploadedFiles.documentC,
      };

      const validationResult = validationEngine(
        data,
        validateForm,
        documentBAndCSchema
      );
      if (validationResult.field.length > 0) {
        setError(validationResult);
        toast({
          variant: "destructive",
          description: "There is an error in the input fields",
        });
        return;
      }

      setError({
        field: [],
        message: [],
      });

      const token = localStorage.getItem("token") as string;
      const response = await handleI9FormMultipleDocumentSubmission(
        data,
        token,
        uploadedFiles.documentB,
        uploadedFiles.documentC,
        method
      );

      refetch();

      // Handle submission response
      if (!response.status) {
        toast({
          variant: "destructive",
          description: response.errorMessage,
        });
        return;
      }

      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  function validateDocuments(data: AllDocumentType) {
    const errors: {
      field: string[];
      message: string[];
    } = {
      field: [],
      message: [],
    };

    const isDocumentAComplete =
      data.documentA.length > 0 ||
      data.documentAIssuingAuthority.length > 0 ||
      data.documentAFile.length > 10;

    const isDocumentBComplete =
      data.documentB.length > 0 ||
      data.documentBIssuingAuthority.length > 0 ||
      data.documentBFile.length > 10;

    const isDocumentCComplete =
      data.documentC.length > 0 ||
      data.documentCIssuingAuthority.length > 0 ||
      data.documentCFile.length > 10;

    if (isDocumentAComplete && (isDocumentBComplete || isDocumentCComplete)) {
      errors.field.push(
        "Document A field is filled but only Document A or the combination of Document B and Document C can be filled.",
        "Document B field is filled but only Document A or the combination of Document B and Document C can be filled.",
        "Document C field is filled but only Document A or the combination of Document B and Document C can be filled."
      );
      errors.message.push(
        "Document A field is filled but only Document A or the combination of Document B and Document C can be filled.",
        "Document B field is filled but only Document A or the combination of Document B and Document C can be filled.",
        "Document C field is filled but only Document A or the combination of Document B and Document C can be filled."
      );
    } else if (isDocumentBComplete && !isDocumentCComplete) {
      errors.field.push("Document C field");
      errors.message.push(
        "Document C field must also be filled, because Document B is filled.",
        "Document C Issuing Authority must also be filled, because Document B is filled.",
        "Document C File must also be filled, because Document B is filled."
      );
    } else if (!isDocumentBComplete && isDocumentCComplete) {
      errors.field.push("Document B field");
      errors.message.push(
        "Document B field must also be filled, because Document C is filled.",
        "Document B Issuing Authority must also be filled, because Document C is filled.",
        "Document B File must also be filled, because Document C is filled."
      );
    } else if (isDocumentBComplete && isDocumentCComplete) {
      // This is the valid scenario where Document B and Document C are filled.
      return true;
    }

    if (errors.field.length > 0) {
      setError(errors);
      return false;
    }

    return true;
  }

  const handleFormSubmit = async (formData: FormData): Promise<void> => {
    // If form is disabled go to next section without making any api request
    if (formDisabled) {
      handleChangeIndex(currentIndex + 1);
      handleNewCompletedSection(currentIndex);
      return;
    }

    try {
      // Document A data
      const documentA = formData.get("documentA") as string;
      const documentAIssuingAuthority = formData.get(
        "documentAIssuingAuthority"
      ) as string;
      const documentADocumentNumber = formData.get(
        "documentADocumentNumber"
      ) as string;
      const documentAFile = uploadedFiles.documentA;

      // Document B data
      const documentB = formData.get("documentB") as string;
      const documentBIssuingAuthority = formData.get(
        "documentBIssuingAuthority"
      ) as string;
      const documentBDocumentNumber = formData.get(
        "documentBDocumentNumber"
      ) as string;
      const documentBFile = uploadedFiles.documentB;

      // Document C data
      const documentC = formData.get("documentC") as string;
      const documentCIssuingAuthority = formData.get(
        "documentCIssuingAuthority"
      ) as string;
      const documentCDocumentNumber = formData.get(
        "documentCDocumentNumber"
      ) as string;
      const documentCFile = uploadedFiles.documentC;

      const data: AllDocumentType = {
        documentA,
        documentAIssuingAuthority,
        documentADocumentNumber,
        documentAFile,
        documentB,
        documentBIssuingAuthority,
        documentBDocumentNumber,
        documentBFile,
        documentC,
        documentCIssuingAuthority,
        documentCDocumentNumber,
        documentCFile,
      };

      const validationResult = validationEngine(
        data,
        validateForm,
        allDocumentSchema
      );

      if (
        documentA.length < 1 &&
        documentAIssuingAuthority.length < 1 &&
        documentAFile.length < 10 &&
        documentB.length < 1 &&
        documentBIssuingAuthority.length < 1 &&
        documentAFile.length < 10 &&
        documentC.length < 1 &&
        documentCIssuingAuthority.length < 1 &&
        documentAFile.length < 10
      ) {
        setError(validationResult);
        toast({
          variant: "destructive",
          description:
            "Please fill either Document A or Document B and Document C",
        });
        return;
      }

      setError({ field: [], message: [] });

      const isValid = validateDocuments(data);

      if (!isValid) {
        toast({
          variant: "destructive",
          description: "Please fix all error messages in the form",
        });
        return;
      }

      if (documentA.length > 1) {
        await handleDocumentA(
          documentA,
          documentAIssuingAuthority,
          documentADocumentNumber
        );
      } else if (documentB.length > 1 || documentC.length > 1) {
        await handleDocumentBAndC(formData, documentB, documentC);
      } else {
        toast({
          variant: "destructive",
          description: "Input fields cannot be blank",
        });
      }
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const { mutate } = useCustomMutation<FormData>(handleFormSubmit, [
    "i9form",
    "formData",
    "offerLetter",
  ]);

  const getDocmentADate = (date: Date) => setDocumentASelectedDate(date);
  const getDocmentBDate = (date: Date) => setDocumentBSelectedDate(date);
  const getDocmentCDate = (date: Date) => setDocumentCSelectedDate(date);

  return (
    <form
      action={mutate}
      className="flex-1 lg:min-h-[80vh] lg:pb-[150px] h-fit flex flex-col gap-10 lg:pl-10 lg:mt-0"
    >
      <div className="flex flex-col gap-5 mt-[5vh] select-none">
        {!formDisabled && (
          <FormBanner
            text="All documents containing an expiration date must be unexpired. If you
        have DOCUMENT A, you don't need to attach other documents. If you
        don't have a passport, you can also attach your Green Card or
        Foreign Passport, Form 1766 Employment Authorization Document Card, or
        Form I-94."
          />
        )}

        {isFormAwaitingApproval && (
          <FormBanner
            variant="warning"
            text="Your form has been submitted successfully and is now undergoing approval. We will notify you once the review process is complete. Please note that editing the form is no longer possible at this stage."
          />
        )}

        <Image
          src="/assets/images/dashboard/documentTableHeader.svg"
          width={200}
          height={200}
          alt="table header"
          className="h-full w-full"
          draggable={false}
        />
        <Image
          src="/assets/images/dashboard/documentTable.svg"
          width={200}
          height={200}
          alt="table"
          className="h-full w-full"
          draggable={false}
        />
      </div>

      <div className="flex flex-col gap-5 mt-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-[28px] font-[600] text-[#0F172A]">
            List A Documents
          </h2>
          <p className="text-[16px] font-[400] text-[#334155]">
            Identity and employment authorization
          </p>
        </div>

        <FormInput
          disabled={formDisabled}
          defaultValue={documentA.passport}
          name="documentA"
          placeholder="U.S. Passport"
          type="text"
          labelText="Document A"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("Document A field")
          )}
          isError={
            !!error.field.find((field) => field.includes("Document A field"))
          }
        />
        <FormInput
          disabled={formDisabled}
          defaultValue={documentA.issuingAuthority}
          name="documentAIssuingAuthority"
          placeholder="US Department of State"
          type="text"
          labelText="Issuing Authority"
          isAuth={false}
          errorMessage={error.message.find((message) =>
            message.includes("Document A Issuing")
          )}
          isError={
            !!error.field.find((field) => field.includes("Document A Issuing"))
          }
        />

        <div className="flex flex-wrap lg:flex-nowrap justify-between gap-5">
          <FormInput
            disabled={formDisabled}
            defaultValue={documentA.documentNumber}
            name="documentADocumentNumber"
            placeholder="Enter document number"
            type="text"
            labelText="Document Number (If any)"
            isAuth={false}
          />

          <DatePicker
            disabled={formDisabled}
            label=" Expiration Date (If any)"
            defaultDate={documentA.expDate}
            getDate={getDocmentADate}
          />
        </div>

        <div className="grid w-full items-center gap-2">
          <Label className="text-[15px] text-[#0F172A] w-fit">
            Upload Document A
          </Label>

          <div className="xl:w-[50%]" onClick={(e) => e.stopPropagation()}>
            <FileUpload
              xkey={1}
              getFileUrl={(fileUrl) =>
                setUploadedFiles((prevState) => ({
                  ...prevState,
                  documentA: fileUrl,
                }))
              }
              getUploadStatus={(status) => setUploadLoading(status)}
              defaultFileUrl={uploadedFiles.documentA}
              defaultText={
                uploadedFiles.documentA?.length > 0 ? "Document A" : undefined
              }
            />
          </div>
        </div>
      </div>

      <div className="flex gap-5 items-center py-20">
        <hr className="border-[1px] border-gray-200 w-full" />
        <h4 className="text-[18px] font-[500] text-[#101828]">OR</h4>
        <hr className="border-[1px] border-gray-200 w-full" />
      </div>

      <section className="flex flex-col gap-10">
        <FormBanner
          text="Select a combination of one document from List B and one document
            from List C"
        />

        <div className="flex gap-10 flex-wrap">
          <div className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-[28px] font-[600] text-[#0F172A]">
                List B Documents
              </h2>
              <p className="text-[16px] font-[400] text-[#334155]">
                Identity and employment authorization
              </p>
            </div>

            <FormInput
              disabled={formDisabled}
              defaultValue={documentB.passport}
              name="documentB"
              placeholder="U.S. Passport"
              type="text"
              labelText="Document B"
              isAuth={false}
              errorMessage={error.message.find((message) =>
                message.includes("Document B field")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Document B field")
                )
              }
            />
            <FormInput
              disabled={formDisabled}
              defaultValue={documentB.issuingAuthority}
              name="documentBIssuingAuthority"
              placeholder="US Department of State"
              type="text"
              labelText="Issuing Authority"
              isAuth={false}
              errorMessage={error.message.find((message) =>
                message.includes("Document B Issuing Authority")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Document B Issuing Authority")
                )
              }
            />

            <div className="flex flex-wrap lg:flex-nowrap justify-between gap-5">
              <FormInput
                disabled={formDisabled}
                defaultValue={documentB.documentNumber}
                name="documentBDocumentNumber"
                placeholder="Enter document number"
                type="text"
                labelText="Document Number (If any)"
                isAuth={false}
                errorMessage={error.message.find((message) =>
                  message.includes("Document B Document Number")
                )}
                isError={
                  !!error.field.find((field) =>
                    field.includes("Document B Document Number")
                  )
                }
              />
              <DatePicker
                disabled={formDisabled}
                label=" Expiration Date (If any)"
                defaultDate={documentB.expDate}
                getDate={getDocmentBDate}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className="text-[15px] text-[#0F172A]">
                Upload Document B
              </Label>
              <div className="xl:w-[50%]" onClick={(e) => e.stopPropagation()}>
                <FileUpload
                  xkey={2}
                  getFileUrl={(fileUrl) =>
                    setUploadedFiles((prevState) => ({
                      ...prevState,
                      documentB: fileUrl,
                    }))
                  }
                  getUploadStatus={(status) => setUploadLoading(status)}
                  defaultFileUrl={uploadedFiles.documentB}
                  defaultText={
                    uploadedFiles.documentB?.length > 0
                      ? "Document B"
                      : undefined
                  }
                />
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-[28px] font-[600] text-[#0F172A]">
                List C Documents
              </h2>
              <p className="text-[16px] font-[400] text-[#334155]">
                Employment authorization
              </p>
            </div>

            <FormInput
              disabled={formDisabled}
              defaultValue={documentC.passport}
              name="documentC"
              placeholder="U.S. Passport"
              type="text"
              labelText="Document C"
              isAuth={false}
              errorMessage={error.message.find((message) =>
                message.includes("Document C field")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Document C field")
                )
              }
            />
            <FormInput
              disabled={formDisabled}
              defaultValue={documentC.issuingAuthority}
              name="documentCIssuingAuthority"
              placeholder="US Department of State"
              type="text"
              labelText="Issuing Authority"
              isAuth={false}
              errorMessage={error.message.find((message) =>
                message.includes("Document C Issuing Authority")
              )}
              isError={
                !!error.field.find((field) =>
                  field.includes("Document C Issuing Authority")
                )
              }
            />

            <div className="flex justify-between flex-wrap lg:flex-nowrap gap-5">
              <FormInput
                disabled={formDisabled}
                defaultValue={documentC.documentNumber}
                name="documentCDocumentNumber"
                placeholder="Enter document number"
                type="text"
                labelText="Document Number (If any)"
                isAuth={false}
              />
              <DatePicker
                disabled={formDisabled}
                label=" Expiration Date (If any)"
                defaultDate={documentC.expDate}
                getDate={getDocmentCDate}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className="text-[15px] text-[#0F172A]">
                Upload Document C
              </Label>
              <div className="xl:w-[50%]" onClick={(e) => e.stopPropagation()}>
                <FileUpload
                  xkey={3}
                  getFileUrl={(fileUrl) =>
                    setUploadedFiles((prevState) => ({
                      ...prevState,
                      documentC: fileUrl,
                    }))
                  }
                  getUploadStatus={(status) => setUploadLoading(status)}
                  defaultFileUrl={uploadedFiles.documentC}
                  defaultText={
                    uploadedFiles.documentC?.length > 0
                      ? "Document C"
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-5 justify-end mt-auto lg:border-t-[1px] lg:fixed bottom-0 right-0 lg:pr-10 lg:py-5 lg:bg-white lg:w-[70%]">
        {currentIndex !== 1 && (
          <Button
            onClick={() => handleChangeIndex(currentIndex - 1)}
            variant="light"
            type="button"
          >
            Previous Section
          </Button>
        )}

        {currentIndex !== 6 && (
          <Button disabled={uploadLoading} type="submit">
            {uploadLoading ? <span>Uploading</span> : <span>Next Section</span>}
          </Button>
        )}
      </div>
    </form>
  );
};

export default Documents;
