"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Button from "../button/Button";
import { PlusIcon, Search } from "lucide-react";
import { ClientsTableContainer } from "./ClientsColumns";
import { ClientsTable } from "./ClientsTable";
import Image from "next/image";
import useCustomQuery from "@/hooks/useCustomQuery";
import { FullIntakeType } from "@/types/IntakeForm";
import {
  retrievFullIntakeForm,
  retrievEmployeeFullIntakeForm,
} from "@/use-cases/new-intake";
import { capitalizeFirstLetter, formatDate } from "@/utils";
import Loader from "../Loader";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import NewIntakeModal from "./NewIntakeModal";
import { draftColumns } from "./ClientDraftColumns";
import { truncateText } from "@/utils/helpers";

export const formatClientStatus = (
  status: string
):
  | "Active"
  | "Inactive"
  | "Not Admitted"
  | "Draft"
  | "Disengage"
  | "New Intake" => {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "not_admitted":
      return "Not Admitted";
    case "new_intake":
      return "New Intake";
    case "disengage":
      return "Disengage";
    case "draft":
      return "Draft";
    default:
      return "New Intake";
  }
};

export const formatSpecificNeedsStatus = (status: string): string => {
  switch (status) {
    case "not_started":
      return "Not Started";
    case "in_progress":
      return "In Progress";
    case "awaiting_approval":
      return "Awaiting Approval";
    case "approved":
      return "Approved";
    case "reviewed":
      return "Reviewed";
    case "completed":
      return "Completed";
    case "rejected":
      return "Rejected";
    case "submitted":
      return "Submitted";
    case "draft":
      return "Draft";
    case "not_filled":
      return "Not Filled";
    case "not_sent":
      return "Not Sent";
    case "awaiting_signature":
      return "Awaiting Signature";
    case "signed":
      return "Signed";
    default:
      return "Not Started";
  }
};

export const removeOrdinalSuffix = (dateString: string) => {
  return dateString.replace(/(\d+)(st|nd|rd|th)/, "$1");
};

export const sortDataByIntakeDate = (data: ClientsTableContainer[]) => {
  return data.sort((a, b) => {
    const cleanDateA = removeOrdinalSuffix(a.intakeDate);
    const cleanDateB = removeOrdinalSuffix(b.intakeDate);

    return new Date(cleanDateB).getTime() - new Date(cleanDateA).getTime();
  });
};

const ClientsPageWrapper = ({ admin, clientManager }: { admin?: boolean; clientManager?: boolean }) => {
  const router = useRouter();
  const [hasPreviousAttempt, setHasPreviousAttempt] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { data, isLoading } = useCustomQuery<FullIntakeType | undefined>(
    (admin || clientManager) ? "fullIntake" : "employeeFullIntake",
    (admin || clientManager) ? retrievFullIntakeForm : retrievEmployeeFullIntakeForm,
    true
  );
  const [openNewIntakeModal, setOpenNewIntakeModal] = useState(false);
  const [tab, setTab] = useState("all");

  let intakeForm: FullIntakeType | undefined;

  if (typeof data === "boolean") {
    intakeForm = undefined;
  } else if (data && "data" in data && Array.isArray(data?.data)) {
    intakeForm = data;
  }

  useEffect(() => {
    if (
      typeof data !== "boolean" &&
      data &&
      "data" in data &&
      Array.isArray(data?.data)
    ) {
      const prevIntakeAttempt = data?.data.find(
        (item) => item.status === "new_intake"
      );

      if (prevIntakeAttempt) {
        setHasPreviousAttempt(true);
      }
    }
  }, [data]);

  const modifiedData = useMemo(() => {
    return (
      intakeForm?.data?.map((item) => {
        const id = item?.id;
        const clientName = capitalizeFirstLetter(
          `${item.clientInformation?.first_name ?? item?.first_name ?? ""} ${
            item.clientInformation?.last_name ?? item?.last_name ?? ""
          }`
        );

        const location = item?.clientInformation?.address_or_street
          ? truncateText(item?.clientInformation?.address_or_street, 40)
          : !item?.clientInformation?.state && !item?.clientInformation?.country
          ? "-"
          : `${item?.clientInformation?.state ?? "-"}, ${
              item?.clientInformation?.country ?? "-"
            }`;
        const intakeDate = item?.created_at
          ? formatDate(new Date(item?.created_at))
          : "-";
        const waiverType: string = "";
        const status = formatClientStatus(item?.status ?? "");

        return {
          id: id,
          clientName: clientName,
          location: location,
          intakeDate: intakeDate,
          waiverType: waiverType,
          status: status,
          route: clientManager ? `/client-manager/clients/${id}` : admin ? `/admin/clients/${id}` : `/clients/${id}`,
        };
      }) ?? []
    );
  }, [intakeForm?.data, admin, clientManager]);

  const [filteredData, setFilteredData] =
    useState<ClientsTableContainer[]>(modifiedData);

  const removeIntakeWithEmptyNameField = (data: ClientsTableContainer[]) => {
    return data.filter((client) => {
      return (
        typeof client.clientName === "string" && client.clientName.trim() !== ""
      );
    });
  };

  useEffect(() => {
    const sortedData = sortDataByIntakeDate(modifiedData);
    setFilteredData(removeIntakeWithEmptyNameField(sortedData));
  }, [data, modifiedData]);

  const handleTabChange = (tabValue: string) => {
    // Filter data based on tab value
    let filtered;
    switch (tabValue) {
      case "active":
        filtered = modifiedData.filter((item) => item.status === "Active");
        break;
      case "inactive":
        filtered = modifiedData.filter((item) => item.status === "Inactive");
        break;
      case "notAdmitted":
        filtered = modifiedData.filter(
          (item) => item.status === "Not Admitted"
        );
        break;
      case "newIntake":
        filtered = modifiedData.filter((item) => item.status === "New Intake");
        break;
      case "disengage":
        filtered = modifiedData.filter((item) => item.status === "Disengage");
        break;
      case "draft":
        filtered = modifiedData.filter((item) => item.status === "Draft");
        break;
      default:
        // Default case: 'all'
        filtered = modifiedData.slice();
        break;
    }

    const sortedData = sortDataByIntakeDate(filtered);
    setFilteredData(removeIntakeWithEmptyNameField(sortedData));
  };

  useEffect(() => {
    let filtered;
    switch (tab) {
      case "active":
        filtered = modifiedData.filter((item) => item.status === "Active");
        break;
      case "inactive":
        filtered = modifiedData.filter((item) => item.status === "Inactive");
        break;
      case "notAdmitted":
        filtered = modifiedData.filter(
          (item) => item.status === "Not Admitted"
        );
        break;
      case "newIntake":
        filtered = modifiedData.filter((item) => item.status === "New Intake");
        break;
      case "disengage":
        filtered = modifiedData.filter((item) => item.status === "Disengage");
        break;
      case "draft":
        filtered = modifiedData.filter((item) => item.status === "Draft");
        break;
      default:
        // Default case: 'all'
        filtered = modifiedData.slice();
        break;
    }

    const sortedData = sortDataByIntakeDate(filtered);
    setFilteredData(removeIntakeWithEmptyNameField(sortedData));
  }, [tab, modifiedData]);

  const handleSearchInputChange = (event: { target: { value: string } }) => {
    const query = event.target.value.toLowerCase();

    const filtered = modifiedData.filter((item) =>
      item.clientName.toLowerCase().includes(query)
    );
    setFilteredData(removeIntakeWithEmptyNameField(filtered));
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="w-full flex flex-col gap-12">
      <div className="w-full flex flex-col lg:flex-row flex-wrap gap-5 justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-[30px] font-[600] text-[#101828]">Clients</h2>
          <p className="text-[16px] font-[400] text-[#475467]">
            Manage your clients here
          </p>
        </div>

        {!admin && !clientManager && (
          <div className="relative flex items-center">
            <div className="absolute left-0 pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-[#94A3B8]" />
            </div>
            <Input
              placeholder="Search clients..."
              className="pl-10 pr-5 border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black w-full md:w-[336px] outline-none focus:border-none"
              onChange={handleSearchInputChange}
            />
          </div>
        )}

        {openNewIntakeModal && (
          <NewIntakeModal
            openModal={openNewIntakeModal}
            closeModal={() => setOpenNewIntakeModal(false)}
          />
        )}

        {!hasPreviousAttempt && admin && !clientManager && (
          <Button
            data-testid="new-intake-button"
            type="button"
            onClick={() => setOpenNewIntakeModal(true)}
          >
            <PlusIcon className="text-white w-5 h-5" />
            New Intake
          </Button>
        )}

        {hasPreviousAttempt && admin && !clientManager && (
          <Button
            data-testid="new-intake-modal-button"
            onClick={() => setOpenModal(true)}
            type="button"
          >
            <PlusIcon className="text-white w-5 h-5" />
            New Intake
          </Button>
        )}
      </div>

      {hasPreviousAttempt && admin && !clientManager && (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[12px] flex flex-col gap-5"
            data-testid="existing-intake-dialog"
          >
            <div className="w-full flex gap-5 justify-center items-center ml-auto">
              <h2 className="text-[18px] w-full font-[600] text-[#101828] text-center">
                Unfinished Intake Entry
              </h2>
            </div>

            <p className="text-[15px] text-[#101828] text-center font-[400]">
              There&apos;s an incomplete intake entry. Do you want to continue
              or add a new intake?
            </p>

            <div className="flex items-center gap-5 lg:flex-nowrap flex-wrap mt-5">
              <button
                data-testid="complete-existing-intake"
                onClick={(e) => {
                  setOpenModal(false);
                  router.push("/admin/clients/new-intake?status=continue");
                }}
                className="w-full text-[14px] h-fit bg-[#dbdcdd] rounded-[6px] px-4 py-3 text-black disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 text-center justify-center"
              >
                Complete Existing Intake
              </button>

              <button
                data-testid="add-new-intake-from-dialog"
                onClick={(e) => {
                  setOpenModal(false);
                  setOpenNewIntakeModal(true);
                }}
                className="w-full text-[14px] h-fit bg-[#2563EB] hover:bg-[#2b5dca] rounded-[6px] px-4 py-3 text-white disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center text-center justify-center"
              >
                Add New Intake
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {(admin || clientManager) ? (
        <Tabs
          value={tab}
          onValueChange={(e) => setTab(e)}
          defaultValue="all"
          className="w-full"
        >
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <TabsList className="md:grid w-[320px] xl:w-[550px] md:min-w-[550px] md:grid-cols-5 pl-[17rem] overflow-auto flex gap-5 md:px-5 md:py-0 items-center">
              <TabsTrigger value="all" onClick={() => handleTabChange("all")}>
                All
              </TabsTrigger>
              <TabsTrigger
                value="active"
                onClick={() => handleTabChange("active")}
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="inactive"
                onClick={() => handleTabChange("inactive")}
              >
                Inactive
              </TabsTrigger>
              {/* <TabsTrigger
                value="notAdmitted"
                onClick={() => handleTabChange("notAdmitted")}
              >
                Not Admitted
              </TabsTrigger> */}
              <TabsTrigger
                value="newIntake"
                onClick={() => handleTabChange("newIntake")}
              >
                New Intake
              </TabsTrigger>
              {/* <TabsTrigger
                value="disengage"
                onClick={() => handleTabChange("disengage")}
              >
                Disengage
              </TabsTrigger> */}
              <TabsTrigger
                value="draft"
                onClick={() => handleTabChange("draft")}
              >
                Draft
              </TabsTrigger>
            </TabsList>

            <div className="relative flex items-center">
              <div className="absolute left-0 pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-[#94A3B8]" />
              </div>
              <Input
                placeholder="Search clients..."
                className="pl-10 pr-5 border-[#E4E4E7] border-[1.5px] placeholder:text-[#c9c9ca] text-black w-full md:w-[336px] outline-none focus:border-none"
                onChange={handleSearchInputChange}
              />
            </div>
          </div>

          {modifiedData.length < 1 ? (
            <div className="h-fit py-20 lg:h-[70vh] border-[1px] border-[#E4E4E7] rounded-[12px] mt-10 flex flex-col gap-5 items-center justify-center">
              <Image
                src="/assets/images/dashboard/emptyClient.svg"
                width={161}
                height={120}
                alt="empty client"
              />
              <h2 className="text-[18px] font-[600] text-[#0F172A]">
                {admin && !clientManager
                  ? "You haven't added any clients yet"
                  : "No client have been added yet"}
              </h2>
              {admin && !clientManager && (
                <p className="text-[16px] font-[400] text-[#667085] lg:w-[350px] text-center">
                  Click on the button below to add a new client intake
                </p>
              )}
              {admin && !clientManager && (
                <Button
                  type="button"
                  onClick={() => setOpenNewIntakeModal(true)}
                >
                  <PlusIcon className="text-white w-5 h-5" />
                  New Intake
                </Button>
              )}
            </div>
          ) : (
            <>
              <TabsContent value="all">
                <ClientsTable data={filteredData} />
              </TabsContent>
              <TabsContent value="active">
                <ClientsTable data={filteredData} />
              </TabsContent>
              <TabsContent value="inactive">
                <ClientsTable data={filteredData} />
              </TabsContent>
              {/* <TabsContent value="notAdmitted">
                <ClientsTable data={filteredData} />
              </TabsContent> */}
              <TabsContent value="newIntake">
                <ClientsTable data={filteredData} />
              </TabsContent>
              {/* <TabsContent value="disengage">
                <ClientsTable data={filteredData} />
              </TabsContent> */}
              <TabsContent value="draft">
                {admin ? (
                  <ClientsTable
                    customColumns={draftColumns}
                    data={filteredData}
                  />
                ) : (
                  <ClientsTable data={filteredData} />
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      ) : (
        <div className="w-full flex flex-col gap-6">
          {modifiedData.length < 1 ? (
            <div className="h-fit py-20 lg:h-[70vh] border-[1px] border-[#E4E4E7] rounded-[12px] mt-10 flex flex-col gap-5 items-center justify-center">
              <Image
                src="/assets/images/dashboard/emptyClient.svg"
                width={161}
                height={120}
                alt="empty client"
              />
              <h2 className="text-[18px] font-[600] text-[#0F172A]">
                {admin && !clientManager
                  ? "You haven't added any clients yet"
                  : "No client have been added yet"}
              </h2>
              {admin && !clientManager && (
                <p className="text-[16px] font-[400] text-[#667085] lg:w-[350px] text-center">
                  Click on the button below to add a new client intake
                </p>
              )}
              {admin && !clientManager && (
                <Button
                  type="button"
                  onClick={() => setOpenNewIntakeModal(true)}
                >
                  <PlusIcon className="text-white w-5 h-5" />
                  New Intake
                </Button>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col gap-6">
              <ClientsTable data={filteredData} />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ClientsPageWrapper;
