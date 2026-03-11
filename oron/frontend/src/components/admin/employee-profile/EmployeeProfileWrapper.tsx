"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import { capitalizeFirstLetter } from "@/utils";
import useUserForms from "@/hooks/admin/useUserForms";
import useFormTableData from "@/hooks/forms/useFormTableData";
import { FORMS } from "@/constants";
import AdminFormContainer from "../user-forms/AdminFormContainer";
import FormReviewContainer from "../user-forms/FormReviewContainer";
import useFormSearch from "@/hooks/forms/useFormSearch";
import useTabChange from "@/hooks/forms/useTabChange";
import { format } from "date-fns";
import {
  GeneratedFormStatusWithIndex,
  GeneratedFormDateWithIndex,
} from "@/types/form-types/FormTypes";
import EmployeeQuickActions from "./EmployeeQuickActions";
import AdminDocumentContainer from "../user-documents/AdminDocumentContainer";
import DocumentReviewContainer from "../user-documents/DocumentReviewContainer";
import { useQuery } from "@tanstack/react-query";
import { AdmimUserDocument, SingleUser } from "@/types/AdminTypes";
import { fetchUserDocumentsById } from "@/use-cases/admin";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface EmployeeProfileWrapperProps {
  employeeId: string;
}

const fetchEmployeeData = async (employeeId: string, token: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1"}/users/all/users?size=1000&page=1&role=all`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  const data = await response.json();
  return data.data.usersData.find((user: SingleUser) => user.id === employeeId);
};

export default function EmployeeProfileWrapper({
  employeeId,
}: EmployeeProfileWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("token") as string)
      : "";

  const name = searchParams.get("name");
  const form = searchParams.get("form");
  const document = searchParams.get("documentName");
  const documentId = searchParams.get("documentId");
  const tab = searchParams.get("tab");

  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [sectionTab, setSectionTab] = useState<"form" | "document">("form");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const { data: allFormsData, isLoading: formLoading } = useUserForms();

  const { formData } = useFormTableData(
    allFormsData?.status,
    allFormsData?.submittedDate,
    allFormsData?.progress,
    FORMS,
    allFormsData?.createdDate,
    allFormsData?.formIds
  );

  const [updatedData, setUpdatedData] = useState(formData);
  const [filteredData, setFilteredData] = useState(formData);

  const { data: userDocument, isLoading: userDocumentLoading } =
    useQuery<AdmimUserDocument>({
      queryKey: ["userDocument", employeeId],
      queryFn: async () => await fetchUserDocumentsById(employeeId, token),
      enabled: typeof employeeId === "string" && employeeId.length > 0,
    });

  const { data: employeeData, refetch: refetchEmployee } = useQuery<SingleUser>({
    queryKey: ["employee", employeeId],
    queryFn: async () => await fetchEmployeeData(employeeId, token),
    enabled: typeof employeeId === "string" && employeeId.length > 0,
  });

  const { filteredData: formFilteredData, handleSearchInputChange } =
    useFormSearch(updatedData, allFormsData!);
  const { filteredData: tabFilteredData, handleTabChange } = useTabChange(
    updatedData,
    allFormsData!
  );

  useEffect(() => {
    if (form) {
      setSelectedForm(form);
      setShowFormModal(true);
    } else {
      setSelectedForm(null);
      setShowFormModal(false);
    }
  }, [form]);

  useEffect(() => {
    if (document) {
      setSelectedDocument(document);
      setShowDocumentModal(true);
    } else {
      setSelectedDocument(null);
      setShowDocumentModal(false);
    }
  }, [document]);

  useEffect(() => {
    if (documentId) {
      setSelectedDocumentId(documentId);
    } else {
      setSelectedDocumentId(null);
    }
  }, [documentId]);

  const handleCloseFormModal = () => {
    router.push(`/admin/employees/${employeeId}?name=${name}`);
  };

  const handleCloseDocumentModal = () => {
    router.push(`/admin/employees/${employeeId}?name=${name}`);
  };

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showFormModal || showDocumentModal) {
          router.push(`/admin/employees/${employeeId}?name=${name}`);
        }
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showFormModal, showDocumentModal, router, employeeId, name]);

  useEffect(() => {
    setUpdatedData(formData);
  }, [formData]);

  useEffect(() => {
    setFilteredData(formFilteredData);
  }, [formFilteredData]);

  useEffect(() => {
    setFilteredData(tabFilteredData);
  }, [tabFilteredData]);

  useEffect(() => {
    if (!tab || tab === null || !allFormsData || !formData) return;

    let filtered;

    switch (tab) {
      case "inProgress":
        filtered = formData.filter((item) => item.status === "In Progress");
        break;
      case "awaitingApproval":
        filtered = formData.filter(
          (item) => item.status === "Awaiting Approval"
        );
        break;
      case "approved":
        filtered = formData.filter((item) => item.status === "Approved");
        break;
      case "notFilled":
        filtered = formData.filter((item) => item.status === "Not Filled");
        break;
      default:
        filtered = formData.slice();
        break;
    }

    const updatedFilteredData = filtered.map((form) => {
      const startDate =
        allFormsData?.createdDate &&
        typeof allFormsData?.createdDate !== "boolean"
          ? (allFormsData?.createdDate as GeneratedFormDateWithIndex)[form.id]
          : null;

      const submittedDate =
        allFormsData?.submittedDate &&
        typeof allFormsData?.submittedDate !== "boolean"
          ? (allFormsData?.submittedDate as GeneratedFormDateWithIndex)[form.id]
          : null;

      const formattedStartDate =
        startDate && !isNaN(new Date(startDate).getTime())
          ? format(new Date(startDate), "PPP")
          : "";

      const formattedSubmittedDate =
        submittedDate && !isNaN(new Date(submittedDate).getTime())
          ? format(new Date(submittedDate), "PPP")
          : "";

      const progress =
        allFormsData?.progress && typeof allFormsData?.progress !== "boolean"
          ? (allFormsData?.progress as GeneratedFormDateWithIndex)[form.id]
          : null;

      return {
        ...form,
        status:
          allFormsData?.status && typeof allFormsData?.status !== "boolean"
            ? (allFormsData?.status as GeneratedFormStatusWithIndex)[form.id]
            : form.status,
        started: formattedStartDate,
        submittedDate: formattedSubmittedDate,
        progress: progress ? parseInt(progress) : 0,
      };
    });

    setFilteredData(updatedFilteredData);
  }, [tab, allFormsData, formData]);

  const handleBack = () => {
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Employees</span>
          </button>
        </div>

        {/* Employee Info Card */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {capitalizeFirstLetter(name ?? "Employee")}
                </h1>
                <p className="text-sm text-gray-600">{employeeData?.email || ""}</p>
              </div>
            </div>
            {employeeData?.status && (
              <div>
                {employeeData.status === "ACTIVE" && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Active
                  </div>
                )}
                {employeeData.status === "INACTIVE" && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    Inactive
                  </div>
                )}
                {employeeData.status === "DISENGAGED" && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-700">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Disengaged
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Section */}
        <EmployeeQuickActions
          employeeId={employeeId}
          employeeName={name || employeeData?.first_name + " " + employeeData?.last_name || "Employee"}
          employeeEmail={employeeData?.email || ""}
          currentStatus={employeeData?.status || "ACTIVE"}
          onStatusChange={() => {
            refetchEmployee();
          }}
        />

        {/* Forms & Documents Section */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Forms & Documents
            </h2>
          </div>

          <div className="p-6">
            <div className="w-full flex gap-5 border-b-[1px] border-[#EAECF0] mb-5">
              <button
                onClick={() => setSectionTab("form")}
                className={`text-[16px] font-[600] pb-3 ${
                  sectionTab === "form"
                    ? "text-[#1A48AD] border-b-2 border-[#1A48AD]"
                    : "text-[#667085]"
                }`}
              >
                Forms
              </button>
              <button
                onClick={() => setSectionTab("document")}
                className={`text-[16px] font-[600] pb-3 ${
                  sectionTab === "document"
                    ? "text-[#1A48AD] border-b-2 border-[#1A48AD]"
                    : "text-[#667085]"
                }`}
              >
                Documents
              </button>
            </div>

            <div className="min-h-[400px]">
              {sectionTab === "form" && (
                <AdminFormContainer
                  handleTabChange={handleTabChange}
                  handleSearchInputChange={handleSearchInputChange}
                  data={filteredData}
                  formLoading={formLoading}
                  tab={tab}
                  id={employeeId}
                  baseRoute={`/admin/employees/${employeeId}`}
                />
              )}

              {sectionTab === "document" && (
                <AdminDocumentContainer
                  userDocumentLoading={userDocumentLoading}
                  userDocument={userDocument}
                />
              )}
            </div>
          </div>
        </div>

        {/* Form Review Modal */}
        <Dialog open={showFormModal} onOpenChange={handleCloseFormModal}>
          <DialogContent
            redirect={true}
            className="w-[95%] max-w-[1200px] h-[90vh] p-6 overflow-auto flex flex-col"
          >
            {selectedForm && (
              <div className="relative flex-1 overflow-auto">
                <FormReviewContainer
                  formInfo={allFormsData}
                  name={name!}
                  selectedForm={selectedForm}
                  id={employeeId}
                  baseRoute={`/admin/employees/${employeeId}`}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Document Review Modal */}
        <Dialog open={showDocumentModal} onOpenChange={handleCloseDocumentModal}>
          <DialogContent
            redirect={true}
            className="w-[95%] max-w-[1200px] h-[90vh] p-6 overflow-auto flex flex-col"
          >
            {selectedDocument && (
              <div className="relative flex-1 overflow-auto">
                <DocumentReviewContainer
                  name={name!}
                  selectedDocument={selectedDocument}
                  documentId={selectedDocumentId}
                  userId={employeeId}
                  userDocument={userDocument}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
