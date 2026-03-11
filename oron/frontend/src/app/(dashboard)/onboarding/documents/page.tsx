"use client";

import { useState, useEffect } from "react";
import { Input } from "../../../../components/ui/input";
import { DownloadIcon, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentTableType } from "./columns";
import { DocumentTable } from "./table";
import useCustomQuery from "@/hooks/useCustomQuery";
import { fetchUserDocuments, retrieveHandbook } from "@/use-cases/documents";
import { UserDocument, Document } from "@/types/Documents";
import Loader from "../../../../components/Loader";
import { formatDate } from "@/utils";
import PageContainer from "@/components/PageContainer";
import { formatDocumentStatus } from "@/lib/forms/helpers";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PDFReader from "@/components/pdf/PDFReader";
import Image from "next/image";
import { UploadIcon } from "@radix-ui/react-icons";
import FormBadge from "@/components/badge/FormBadge";
import DocumentUploadModal from "./document-upload-modal";
import PdfPreview from "@/components/pdf/PdfPreview";
import { EMPLOYEE_HANDBOOK_DOCUMENT_URL } from "@/constants";

const initialData: DocumentTableType[] = [
  {
    id: "1",
    documentName: "Employee Handbook",
    upload: "",
    dateUploaded: "",
    status: "Not Submitted",
    downloadLink: "",
    isHandBook: true,
    handBookPreviewUrl: EMPLOYEE_HANDBOOK_DOCUMENT_URL,
    reviewNotes: "",
  },
  {
    id: "2",
    documentName: "Resume",
    upload: "",
    dateUploaded: "",
    status: "Not Submitted",
    downloadLink: "",
    reviewNotes: "",
  },
  {
    id: "3",
    documentName: "Education Degree",
    upload: "",
    dateUploaded: "",
    status: "Not Submitted",
    downloadLink: "",
    reviewNotes: "",
  },
  {
    id: "4",
    documentName: "CPR",
    upload: "",
    dateUploaded: "",
    status: "Not Submitted",
    downloadLink: "",
    reviewNotes: "",
  },
  {
    id: "5",
    documentName: "Measles Mums Rubella Vaccine Record",
    upload: "",
    dateUploaded: "",
    status: "Not Submitted",
    downloadLink: "",
    reviewNotes: "",
  },
  {
    id: "6",
    documentName: "Influenza Vaccine Record",
    upload: "",
    dateUploaded: "",
    status: "Not Submitted",
    downloadLink: "",
    reviewNotes: "",
  },
  {
    id: "7",
    documentName:
      "Tuberculosis Vaccine Record (Quantiferon / PPD / Chest X-Ray)",
    upload: "",
    dateUploaded: "",
    status: "Not Submitted",
    downloadLink: "",
    reviewNotes: "",
  },
  {
    id: "8",
    documentName: "Driver's License",
    upload: "",
    dateUploaded: "",
    status: "Not Submitted",
    downloadLink: "",
    reviewNotes: "",
  },
];

const DocumentsPage = () => {
  const { data, isLoading } = useCustomQuery<UserDocument>(
    "documents",
    fetchUserDocuments
  );
  const { data: handbookData, isLoading: handbookIsLoading } =
    useCustomQuery<any>("handBook", retrieveHandbook);

  const [modifiedData, setModifiedData] =
    useState<DocumentTableType[]>(initialData);
  const [filteredData, setFilteredData] =
    useState<DocumentTableType[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document>();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedDocumentName, setSelectedDocumentName] = useState("");
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState("");
  const [openUploadModal, setOpenUploadModal] = useState(false);

  useEffect(() => {
    setDocumentPreviewUrl(selectedDocument?.document_url ?? "");
  }, [selectedDocument]);

  const handleChangeDocumentName = (documentName: string) => {
    setSelectedDocumentName(documentName);
  };

  useEffect(() => {
    if (openDialog === false) {
      setSelectedDocumentName("");
    }
  }, [openDialog]);

  useEffect(() => {
    if (
      selectedDocumentName &&
      typeof selectedDocumentName === "string" &&
      selectedDocumentName.length > 1
    ) {
      setOpenDialog(true);
    }
  }, [selectedDocumentName]);

  useEffect(() => {
    if (data) {
      const selectedDocumentInApiResponse = data?.data.find(
        (doc) => doc.document_title === selectedDocumentName
      );
      const selectedDocumentInStaticData = initialData.find(
        (doc) => doc.documentName === selectedDocumentName
      );

      if (selectedDocumentInApiResponse) {
        setSelectedDocument(selectedDocumentInApiResponse);
      } else {
        setSelectedDocument({
          created_at: "",
          deleted_at: "",
          document_title: selectedDocumentInStaticData?.documentName ?? "-",
          document_url: "",
          id: "",
          owner: "",
          updated_at: "",
          status: "",
          review_notes: null,
        });
      }
    }
  }, [data, selectedDocumentName]);

  useEffect(() => {
    const updatedData: DocumentTableType[] = initialData.map((item) => {
      // Only update Employee Handbook data
      if (
        item.documentName === "Employee Handbook" &&
        handbookData !== undefined &&
        handbookData?.data !== null &&
        typeof handbookData?.data === "object" &&
        Object.keys(handbookData?.data).length > 0
      ) {
        return {
          ...item,
          downloadLink: handbookData?.data.document_url,
          dateUploaded: formatDate(
            new Date(handbookData?.data.date_of_agreement)
          ),
          status: "Awaiting Approval",
          reviewNotes: "", // Keep empty or populate as necessary
        };
      }

      // Return the item unchanged if it's not the Employee Handbook
      return item;
    });

    setModifiedData(updatedData);
    setFilteredData(updatedData);
  }, [handbookData]);

  useEffect(() => {
    if (
      data &&
      data?.data &&
      !isLoading &&
      Array.isArray(data?.data) &&
      data?.data.length > 0
    ) {
      const updatedData: DocumentTableType[] = initialData.map((item) => {
        let downloadUrl: string = "";
        let dateUploaded: string = "";
        let status:
          | "Not Submitted"
          | "Submitted"
          | "Awaiting Approval"
          | "Correction Required"
          | "Approved" = "Not Submitted";
        let reviewNotes: string = "";

        const matchingDoc = data?.data.find(
          (doc) =>
            doc.document_title === item.documentName &&
            doc.document_url.length > 1
        );

        if (
          item.documentName === "Employee Handbook" &&
          handbookData !== undefined &&
          handbookData?.data !== null &&
          typeof handbookData?.data === "object" &&
          Object.keys(handbookData?.data).length > 0
        ) {
          downloadUrl = handbookData?.data.document_url;
          status = "Awaiting Approval";
          dateUploaded = formatDate(
            new Date(handbookData?.data.date_of_agreement)
          );
        }

        if (matchingDoc) {
          downloadUrl = matchingDoc.document_url;
          dateUploaded = formatDate(new Date(matchingDoc.created_at));
          status =
            matchingDoc.status === "not_started" &&
            matchingDoc.document_url.length > 1
              ? "Awaiting Approval"
              : (formatDocumentStatus(matchingDoc.status) as
                  | "Not Submitted"
                  | "Submitted"
                  | "Awaiting Approval"
                  | "Correction Required"
                  | "Approved");
          reviewNotes = matchingDoc?.review_notes ?? "";
        }

        return {
          ...item,
          downloadLink: downloadUrl,
          dateUploaded: dateUploaded,
          status: status,
          reviewNotes: reviewNotes,
        };
      });

      setModifiedData(updatedData);
      setFilteredData(updatedData);
    }
  }, [data, isLoading, handbookData]);

  const handleSearchInputChange = (event: { target: { value: string } }) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = modifiedData.filter((item) =>
      item.documentName.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  const handleTabChange = (tabValue: string) => {
    // Filter data based on tab value
    let filtered;
    switch (tabValue) {
      case "awaitingApproval":
        filtered = modifiedData.filter(
          (item) => item.status === "Awaiting Approval"
        );
        break;
      case "submitted":
        filtered = modifiedData.filter((item) => item.status === "Submitted");
        break;
      case "notFilled":
        filtered = modifiedData.filter(
          (item) => item.status === "Not Submitted"
        );
        break;
      default:
        // Default case: 'all'
        filtered = modifiedData.slice();
        break;
    }
    // Apply search query to filtered data
    const searchedFiltered = filtered.filter((item) =>
      item.documentName.toLowerCase().includes(searchQuery)
    );
    setFilteredData(searchedFiltered);
  };

  return (
    <PageContainer>
      {openDialog && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="w-full md:w-[90%] lg:w-[80%] max-w-full h-[90vh] overflow-auto">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-5">
                <h1
                  className={`text-[#101828] text-[30px] font-[700] ${
                    selectedDocument?.review_notes ? "text-center" : "text-left"
                  }`}
                >
                  {selectedDocument?.document_title ?? "-"}
                </h1>

                <a href={selectedDocument?.document_url ?? ""} download>
                  <DownloadIcon className="w-5 h-5 text-gray-500" />
                </a>

                <FormBadge
                  status={
                    selectedDocument?.status === "not_started" &&
                    selectedDocument?.document_url.length > 10
                      ? "Awaiting Approval"
                      : formatDocumentStatus(selectedDocument?.status ?? "")
                  }
                >
                  {selectedDocument?.status === "not_started" &&
                  selectedDocument?.document_url.length > 10
                    ? "Awaiting Approval"
                    : formatDocumentStatus(selectedDocument?.status ?? "")}
                </FormBadge>
              </div>

              {selectedDocument?.review_notes &&
                typeof selectedDocument?.review_notes === "string" &&
                selectedDocument?.review_notes?.length > 0 && (
                  <div className="flex flex-wrap justify-between items-center gap-3 p-5 border-[2px] border-[#FEC84B] bg-[#FFFCF5] rounded-[8px]">
                    <div className="flex gap-3 items-start">
                      <Image
                        src="/assets/images/dashboard/warningIcon.svg"
                        width={17}
                        height={17}
                        alt="info icon"
                        className="mt-1"
                      />
                      <p className="text-[14px] font-[400] text-[#B54708]">
                        {selectedDocument?.review_notes}
                      </p>
                    </div>

                    {!uploadLoading && (
                      <button
                        className="flex items-center gap-2 bg-[#DC6803] text-white text-[14px] font-[500] px-[16px] py-[8px] rounded-[6px] cursor-pointer"
                        onClick={() => setOpenUploadModal(true)}
                      >
                        <UploadIcon className="w-5 h-5" />
                        Reupload Document
                      </button>
                    )}

                    {openUploadModal && (
                      <DocumentUploadModal
                        documentName={selectedDocument?.document_title ?? "-"}
                        isOpen={openUploadModal}
                        closeModal={() => setOpenUploadModal(false)}
                        showTrigger={false}
                        isReuploading={true}
                        getUploadStatus={(status) => setUploadLoading(status)}
                        documentId={selectedDocument.id}
                      />
                    )}

                    {uploadLoading && (
                      <button
                        disabled
                        className="flex items-center gap-2 bg-[#DC6803] text-white text-[14px] font-[500] px-[16px] py-[8px] rounded-[6px] cursor-not-allowed"
                      >
                        <Loader height="h-fit" />
                      </button>
                    )}
                  </div>
                )}

              {selectedDocument?.document_url &&
              selectedDocument?.document_url.length > 1 ? (
                <PdfPreview pdfUrl={documentPreviewUrl} />
              ) : (
                <p className="text-[#101828] text-[20px] font-[400] text-center">
                  {selectedDocument?.document_title} Has not been uploaded
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <section className="w-full flex flex-col gap-12">
        <div className="w-full flex flex-wrap gap-5 justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-[30px] font-[600] text-[#101828]">Documents</h2>
            <p className="text-[16px] font-[400] text-[#475467]">
              Upload and manage your documents here
            </p>
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-0 pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-[#94A3B8]" />
            </div>
            <Input
              placeholder="Search documents"
              className="pl-10 pr-5 border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black md:w-[336px] outline-none focus:border-none"
              onChange={handleSearchInputChange}
            />
          </div>
        </div>

        {isLoading || handbookIsLoading ? (
          <Loader height="h-[40vh]" />
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="md:grid w-[320px] md:w-[600px] md:grid-cols-4 pl-[14rem] overflow-auto flex gap-5 md:px-5 md:py-0 items-center">
              <TabsTrigger value="all" onClick={() => handleTabChange("all")}>
                All
              </TabsTrigger>
              <TabsTrigger
                value="awaitingApproval"
                onClick={() => handleTabChange("awaitingApproval")}
              >
                Awaiting Approval
              </TabsTrigger>
              <TabsTrigger
                value="submitted"
                onClick={() => handleTabChange("submitted")}
              >
                Signed/Submitted
              </TabsTrigger>
              <TabsTrigger
                value="notFilled"
                onClick={() => handleTabChange("notFilled")}
              >
                Not Submitted
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <DocumentTable
                data={filteredData}
                handleChangeDocumentName={handleChangeDocumentName}
              />
            </TabsContent>
            <TabsContent value="awaitingApproval">
              <DocumentTable
                data={filteredData}
                handleChangeDocumentName={handleChangeDocumentName}
              />
            </TabsContent>
            <TabsContent value="submitted">
              <DocumentTable
                data={filteredData}
                handleChangeDocumentName={handleChangeDocumentName}
              />
            </TabsContent>
            <TabsContent value="notFilled">
              <DocumentTable
                data={filteredData}
                handleChangeDocumentName={handleChangeDocumentName}
              />
            </TabsContent>
          </Tabs>
        )}
      </section>
    </PageContainer>
  );
};

export default DocumentsPage;
