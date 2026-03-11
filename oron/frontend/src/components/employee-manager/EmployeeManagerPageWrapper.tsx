"use client";

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Search, UserPlus } from "lucide-react";
import Button from "@/components/button/Button";
import CreateUserModal from "../admin/CreateUserModal";
import { UserTableContainer } from "../admin/UsersColumns";
import { UsersTable } from "../admin/UsersTable";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { capitalizeFirstLetter } from "@/utils";
import {
  GeneratedFormStatusWithIndex,
  GeneratedFormDateWithIndex,
} from "@/types/form-types/FormTypes";
import useFormTableData from "@/hooks/forms/useFormTableData";
import { format } from "date-fns";
import { fetchUsersWithForms, fetchUserDocumentsById } from "@/use-cases/admin";
import { AdmimUserDocument, AllUsersResponse } from "@/types/AdminTypes";
import { FORMS } from "@/constants";
import FormReviewContainer from "../admin/user-forms/FormReviewContainer";
import AdminFormContainer from "../admin/user-forms/AdminFormContainer";
import useUserForms from "@/hooks/admin/useUserForms";
import useFormSearch from "@/hooks/forms/useFormSearch";
import useTabChange from "@/hooks/forms/useTabChange";
import useUserData from "@/hooks/admin/useUserData";
import { searchEmployee } from "@/actions/admin/search-employee-table";
import { debounce } from "@/utils/helpers";
import AdminDocumentContainer from "../admin/user-documents/AdminDocumentContainer";
import DocumentReviewContainer from "../admin/user-documents/DocumentReviewContainer";
import { useQuery } from "@tanstack/react-query";

const EmployeeManagerPageWrapper = () => {
  const router = useRouter();
  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("token") as string)
      : "";
  const { data: allFormsData, isLoading: formLoading } = useUserForms();
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [sectionTab, setSectionTab] = useState<"form" | "document">("form");
  const [searchEnabled, setSearchEnabled] = useState(false);

  const { formData } = useFormTableData(
    allFormsData?.status,
    allFormsData?.submittedDate,
    allFormsData?.progress,
    FORMS,
    allFormsData?.createdDate,
    allFormsData?.formIds
  );

  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [totalUsersInPage, setTotalUsersInPage] = useState(0);

  const [allUsers, setAllUsers] = useState<AllUsersResponse | boolean>();
  const [allUsersLoading, setAllUsersLoading] = useState<boolean>(false);

  const fetchUsers = useCallback(
    async (newPage?: number, newSize?: number) => {
      setAllUsersLoading(true);
      const res = await fetchUsersWithForms(
        token,
        newPage ?? page,
        newSize ?? size,
        "STANDARD" // Employee Manager only sees STANDARD users
      );

      setAllUsersLoading(false);
      setAllUsers(res);
    },
    [token, page, size]
  );

  useEffect(() => {
    fetchUsers(1, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const id = searchParams.get("id");
  const tab = searchParams.get("tab");
  const form = searchParams.get("form");

  const document = searchParams.get("documentName");
  const documentId = searchParams.get("documentId");

  const [updatedData, setUpdatedData] = useState(formData);

  const { data: userDocument, isLoading: userDocumentLoading } =
    useQuery<AdmimUserDocument>({
      queryKey: ["userDocument", id],
      queryFn: async () => await fetchUserDocumentsById(id!, token),
      enabled: typeof id === "string" && id.length > 0,
    });

  const { filteredData: formFilteredData, handleSearchInputChange } =
    useFormSearch(updatedData, allFormsData!);
  const { filteredData: tabFilteredData, handleTabChange } = useTabChange(
    updatedData,
    allFormsData!
  );

  const [filteredData, setFilteredData] = useState(formData);

  const { isLoading, userData, transformUserData } = useUserData(allUsers!);

  const [filteredUsers, setFilteredUsers] =
    useState<UserTableContainer[]>(userData);

  const [showForms, setShowForms] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  useEffect(() => {
    const handleEscapeKey = (event: { key: string }) => {
      if (event.key === "Escape" && showForms) {
        setShowForms(false);
        router.push("/employee-manager");
      }
    };

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showForms, router]);

  useEffect(() => {
    if (form) {
      setSelectedForm(form);
    } else {
      setSelectedForm(null);
    }
  }, [form]);

  useEffect(() => {
    if (document) {
      setSelectedDocument(document);
    } else {
      setSelectedDocument(null);
    }
  }, [document]);

  useEffect(() => {
    if (documentId) {
      setSelectedDocumentId(documentId);
    } else {
      setSelectedDocumentId(null);
    }
  }, [documentId]);

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
    if (name && id) {
      setShowForms(true);
    } else {
      setShowForms(false);
    }
  }, [name, id]);

  useEffect(() => {
    setFilteredUsers(userData);
  }, [userData]);

  useEffect(() => {
    if (showForms === false) {
      setSectionTab("form");
    }
  }, [showForms]);

  useEffect(() => {
    if (typeof allUsers !== "boolean" && allUsers) {
      setTotalUsersInPage(allUsers?.data?.total);
    }
  }, [allUsers]);

  const handlePageChange = async (mode: "increment" | "decrement") => {
    setPage((prevPage) => (mode === "increment" ? prevPage + 1 : prevPage - 1));
    setAllUsersLoading(true);
    await fetchUsers(mode === "increment" ? page + 1 : page - 1);
    setAllUsersLoading(false);
  };

  const handleSizeChange = async (newSize: number) => {
    setSize(newSize);
    setAllUsersLoading(true);
    await fetchUsers(page, newSize);
    setAllUsersLoading(false);
  };

  const handleUsersSearchInputChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const query = event.target.value.trim().toLowerCase();

    if (query.length > 0) {
      setSearchEnabled(true);
    }

    if (query.length === 0) {
      setFilteredUsers(userData);
      setTotalUsersInPage(
        typeof allUsers !== "boolean" && allUsers ? allUsers?.data?.total : 0
      );
      setSearchEnabled(false);
      return;
    }

    setAllUsersLoading(true);
    const response = await searchEmployee(query, token);

    if (!response?.data?.usersData || response?.data?.usersData?.length === 0) {
      setAllUsersLoading(false);
      setFilteredUsers([]);
      setTotalUsersInPage(0);
      return;
    }

    const modifiedData = await transformUserData(response);
    setTotalUsersInPage(modifiedData.length);
    setAllUsersLoading(false);
    setFilteredUsers(modifiedData);
  };

  const debouncedHandleUsersSearchInputChange = debounce(
    handleUsersSearchInputChange,
    500
  );

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

  return (
    <section className="w-full flex flex-col gap-5">
      <div className="w-full flex flex-wrap gap-10 justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-[30px] font-[600] text-[#101828]">Employees</h2>
          <p className="text-[16px] font-[400] text-[#475467]">
            Manage all employees here
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <div className="absolute left-0 pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-[#94A3B8]" />
            </div>
            <Input
              placeholder="Search employees"
              className="pl-10 pr-5 border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black w-full md:w-[336px] outline-none focus:border-none"
              onChange={debouncedHandleUsersSearchInputChange}
            />
          </div>
          <Button
            type="button"
            onClick={() => setShowCreateUserModal(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Create User
          </Button>
        </div>
      </div>

      <CreateUserModal
        open={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onUserCreated={() => fetchUsers()}
        employeeManagerMode={true}
      />

      <UsersTable
        allUsersLoading={allUsersLoading}
        isLoading={isLoading}
        total={totalUsersInPage}
        handlePageChange={handlePageChange}
        handleSizeChange={handleSizeChange}
        data={filteredUsers}
        page={page}
        searchEnabled={searchEnabled}
        isEmployeeManager={true}
      />

      <Dialog onOpenChange={setShowForms} open={showForms}>
        <DialogContent
          redirect={true}
          className="w-[95%] max-w-[1200px] h-[90vh] p-6 overflow-auto flex flex-col"
        >
          {selectedForm && selectedForm !== null && (
            <div className="relative flex-1 overflow-auto">
              <FormReviewContainer
                formInfo={allFormsData}
                name={name!}
                selectedForm={selectedForm}
                id={id!}
              />
            </div>
          )}

          {selectedDocument && selectedDocument !== null && (
            <div className="relative flex-1 overflow-auto">
              <DocumentReviewContainer
                name={name!}
                selectedDocument={selectedDocument}
                documentId={selectedDocumentId}
                userId={id!}
                userDocument={userDocument}
              />
            </div>
          )}

          {selectedForm === null && selectedDocument === null && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex justify-between w-full mb-6">
                <h2 className="text-[24px] font-[600] text-[#101828] text-center w-full">
                  {capitalizeFirstLetter(name ?? "-")}
                </h2>
              </div>

              <div className="flex flex-col flex-1 min-h-0">
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

                <div className="flex-1 min-h-0 overflow-auto">
                  {sectionTab === "form" && (
                    <AdminFormContainer
                      handleTabChange={handleTabChange}
                      handleSearchInputChange={handleSearchInputChange}
                      data={filteredData}
                      formLoading={formLoading}
                      tab={tab}
                      id={id!}
                      isEmployeeManager={true}
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
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default EmployeeManagerPageWrapper;
