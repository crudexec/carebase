"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDocumentTable } from "./AdminDocumentTable";
import { AdminDocumentType } from "./AdminDocumentsColumns";
import { formatDate } from "@/utils";
import Loader from "@/components/Loader";
import { AdmimUserDocument } from "@/types/AdminTypes";
import { formatDocumentStatus } from "@/lib/forms/helpers";

export const DATA: AdminDocumentType[] = [
  {
    id: "1",
    documentName: "Employee Handbook",
    dateUploaded: "",
    status: "Not Submitted",
    fileUrl: "",
  },
  {
    id: "2",
    documentName: "Resume",
    dateUploaded: "",
    status: "Not Submitted",
    fileUrl: "",
  },
  {
    id: "3",
    documentName: "Education Degree",
    dateUploaded: "",
    status: "Not Submitted",
    fileUrl: "",
  },
  {
    id: "4",
    documentName: "CPR",
    dateUploaded: "",
    status: "Not Submitted",
    fileUrl: "",
  },
  {
    id: "5",
    documentName: "Measles Mums Rubella Vaccine Record",
    dateUploaded: "",
    status: "Not Submitted",
    fileUrl: "",
  },
  {
    id: "6",
    documentName: "Influenza Vaccine Record",
    dateUploaded: "",
    status: "Not Submitted",
    fileUrl: "",
  },
  {
    id: "7",
    documentName:
      "Tuberculosis Vaccine Record (Quantiferon / PPD / Chest X-Ray)",
    dateUploaded: "",
    status: "Not Submitted",
    fileUrl: "",
  },
  {
    id: "8",
    documentName: "Driver's License",
    dateUploaded: "",
    status: "Not Submitted",
    fileUrl: "",
  },
];

const STATUS_ORDER = [
  "Approved",
  "Submitted",
  "Correction Required",
  "Awaiting Approval",
  "Not Submitted",
];

const sortByStatusOrder = (data: AdminDocumentType[]) => {
  return data.sort((a, b) => {
    return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
  });
};

const AdminDocumentContainer = ({
  userDocument,
  userDocumentLoading,
}: {
  userDocument: AdmimUserDocument | undefined;
  userDocumentLoading: boolean;
}) => {
  const [modifiedData, setModifiedData] = useState<AdminDocumentType[]>(DATA);
  const [filteredData, setFilteredData] = useState<AdminDocumentType[]>(DATA);

  useEffect(() => {
    if (userDocument) {
      const updatedData: AdminDocumentType[] = DATA.map((item) => {
        let documentId: string = "";
        let downloadUrl: string = "";
        let dateUploaded: string = "";
        let status:
          | "Not Submitted"
          | "Submitted"
          | "Awaiting Approval"
          | "Correction Required"
          | "Approved" = "Not Submitted";

        const matchingDoc = userDocument?.data.find(
          (doc: any) =>
            doc.document_title === item.documentName &&
            doc.document_url.length > 1
        );

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
          documentId = matchingDoc.id;
        }

        return {
          ...item,
          id: documentId,
          fileUrl: downloadUrl,
          dateUploaded: dateUploaded,
          status: status,
        };
      });

      const sortedData = sortByStatusOrder(updatedData);
      setModifiedData(sortedData);
      setFilteredData(sortedData);
    }
  }, [userDocument]);

  const handleSearchInputChange = (event: { target: { value: string } }) => {
    const query = event.target.value.toLowerCase();

    const filtered = modifiedData.filter((item) =>
      item.documentName.toLowerCase().includes(query)
    );
    setFilteredData(sortByStatusOrder(filtered));
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
      case "approved":
        filtered = modifiedData.filter((item) => item.status === "Approved");
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

    setFilteredData(sortByStatusOrder(filtered));
  };

  if (userDocumentLoading) {
    return <Loader height="h-[60vh]" />;
  }

  return (
    <div className="flex flex-col h-full gap-5">
      <Tabs defaultValue="all" className="w-full h-full">
        <div className="flex items-center gap-5 justify-between flex-col xl:flex-row">
          <TabsList className="md:grid w-full xl:w-auto grid-cols-4 gap-2">
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
              value="approved"
              onClick={() => handleTabChange("approved")}
            >
              Approved
            </TabsTrigger>
            <TabsTrigger
              value="notFilled"
              onClick={() => handleTabChange("notFilled")}
            >
              Not Submitted
            </TabsTrigger>
          </TabsList>
          <div className="relative flex items-center w-full xl:w-auto">
            <div className="absolute left-0 pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-[#94A3B8]" />
            </div>
            <Input
              placeholder="Search document"
              className="pl-10 pr-5 border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black w-full xl:w-[336px]"
              onChange={handleSearchInputChange}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden mt-5">
          <TabsContent value="all" className="h-full">
            <AdminDocumentTable data={filteredData} />
          </TabsContent>
          <TabsContent value="awaitingApproval" className="h-full">
            <AdminDocumentTable data={filteredData} />
          </TabsContent>
          <TabsContent value="approved" className="h-full">
            <AdminDocumentTable data={filteredData} />
          </TabsContent>
          <TabsContent value="notFilled" className="h-full">
            <AdminDocumentTable data={filteredData} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminDocumentContainer;
