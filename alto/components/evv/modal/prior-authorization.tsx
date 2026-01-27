import { Row } from "@tanstack/react-table";
import { PlusIcon, RedoIcon, TrashIcon } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

import AppLoader from "@/components/app-loader";
import { DataTable, Shell } from "@/components/data-table";
import Detail from "@/components/detail";
import { Alert, Button, Modal } from "@/components/ui";
import { initialQuery, priorAuthorizationColumns } from "@/constants";
import {
  useArchivePriorAuthorization,
  useDisclosure,
  useGetPriorAuthorization,
  useTable,
} from "@/hooks";
import { formatDate, modifyDateFields } from "@/lib";
import { PatientResponse, PriorAuthorizationResponse } from "@/types";

import { PriorAuthActionsCell } from "../action-button";
import { AddPriorAuthorizationModal, AddRecurrenceModal } from ".";

const PriorAuthorization = ({
  title,
  open,
  modalClose,
  patient,
  patientInsuranceId,
}: {
  title: string;
  open: boolean;
  modalClose: () => void;
  patient?: PatientResponse;
  patientInsuranceId?: string;
}) => {
  const [active, setActive] = useState("active");
  const [search, setSearch] = useState("");
  const [Data, setData] = useState<PriorAuthorizationResponse[]>([]);
  const [action, setAction] = useState("");
  const [selected, setSelected] = useState<PriorAuthorizationResponse>();
  const { opened, onOpen, onClose } = useDisclosure();
  const [query, setQuery] = useState(initialQuery);
  const {
    opened: opened2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const {
    opened: opened3,
    onOpen: onOpen3,
    onClose: onClose3,
  } = useDisclosure();
  const { data, isLoading, mutate } = useGetPriorAuthorization({
    id: patientInsuranceId as string,
    status: active,
  });
  const {
    data: archiveResponse,
    isMutating,
    trigger,
  } = useArchivePriorAuthorization();

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: priorAuthorizationColumns,
    query: query,
    setQuery: setQuery,
    name: "authorizations",
    resetTableState: active,
    columnProps: {
      modal: true,
      actionsCell: (row: Row<PriorAuthorizationResponse>) => (
        <PriorAuthActionsCell
          callback={(action) => {
            setAction(action);
            setSelected(row.original as PriorAuthorizationResponse);
          }}
          activeTab={active}
        />
      ),
    },
  });

  React.useEffect(() => {
    const tableData =
      data?.data?.priorAuthorizations?.map((priorAuthorization) =>
        modifyDateFields({
          ...priorAuthorization,
          disciplineName: priorAuthorization?.discipline?.name,
          startDate: formatDate(priorAuthorization?.effectiveFrom as Date),
          endDate: formatDate(priorAuthorization?.effectiveThrough as Date),
        }),
      ) || [];
    setData(tableData);
  }, [data]);

  const closeModal = () => {
    onClose();
    onClose2();
    onClose3();
    setAction("");
    setSelected(undefined);
  };

  React.useEffect(() => {
    if (archiveResponse?.success) {
      mutate();
      table.resetRowSelection();
      toast.success(`Success|${archiveResponse?.message}`);
      setAction("");
      onClose3();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archiveResponse]);

  return (
    <div>
      <AppLoader loading={isLoading} />
      <Alert
        title={
          active === "archived"
            ? "Activate Insurance Authorization"
            : "Archive Insurance Authorization"
        }
        description={`Are you sure you want to ${active === "archived" ? "activate" : "archive"} this insurance authorization?`}
        variant={active === "archived" ? "default" : "destructive"}
        open={opened3 || action === "delete"}
        onClose={closeModal}
        callback={async () => {
          await trigger({
            ids: selected
              ? [selected.id]
              : table.getSelectedRowModel().rows.map((row) => row.original.id),
            status: active === "archived" ? "archived" : "active",
          });
        }}
        loading={isMutating}
      />
      <AddPriorAuthorizationModal
        title="Add Prior Authorization"
        open={opened || action === "edit"}
        modalClose={closeModal}
        patientInsuranceId={patientInsuranceId}
        mutate={mutate}
        selected={selected}
      />
      <AddRecurrenceModal
        title="Recurring Prior Authorization"
        open={opened2}
        modalClose={closeModal}
        patientInsuranceId={patientInsuranceId}
        mutate={mutate}
      />
      <Modal
        title={title}
        open={open}
        onClose={modalClose}
        className="md:max-w-[90%] sm:max-w-full"
        openOnOutsideClick
      >
        <div className="h-[80vh] overflow-auto scrollbar-hide">
          <div>
            <p className="font-bold pb-2 text-lg uppercase">
              {patient?.firstName}, {patient?.lastName}
            </p>
            <div className="grid grid-col-1 md:grid-cols-2 gap-2 bg-secondary p-3 mb-4">
              <Detail title="PAN" detail={patient?.pan} />
              <Detail
                title="Payer"
                detail={patient?.patientAdmission?.[0]?.payer}
              />
              <Detail
                title="Admit Date"
                detail={formatDate(patient?.patientAdmission?.[0]?.createdAt)}
              />
              <Detail title="Ins Eff From" detail={"01/01/2001"} />
              <Detail
                title="Discharge Date"
                detail={formatDate(patient?.patientAdmission?.[0]?.createdAt)}
              />
            </div>
          </div>
          <Shell className="!p-0">
            <DataTable
              table={table}
              tableKey={tableKey}
              columns={tableColumns}
              rawColumns={priorAuthorizationColumns}
              className="!h-[calc(100vh-60vh)] md:!h-[calc(100vh-55vh)]"
              setQuery={setQuery}
              search={search}
              setSearch={setSearch}
              modal
              extraToolbar={
                <>
                  <Button
                    type="button"
                    className="ml-auto h-8 lg:flex"
                    onClick={onOpen}
                  >
                    <PlusIcon size={"xs"} />
                    Add Authorization
                  </Button>
                  <Button
                    type="button"
                    className="ml-auto h-8 lg:flex"
                    onClick={onOpen2}
                  >
                    <RedoIcon size={"xs"} />
                    Add Recurrence
                  </Button>

                  {(table.getIsSomeRowsSelected() ||
                    table.getIsAllRowsSelected()) && (
                    <>
                      <Button
                        aria-label="Activate or Archive"
                        variant={
                          active === "archived" ? "default" : "destructive"
                        }
                        className="ml-auto h-8 lg:flex"
                        onClick={onOpen3}
                      >
                        <TrashIcon className=" size-4" />
                        {active === "archived" ? "Activate" : "Archive"}
                      </Button>
                    </>
                  )}
                </>
              }
              segmentedControl={{
                data: [
                  { value: "active", label: "Active" },
                  { value: "archived", label: "Archived" },
                ],
                value: active || "active",
                onChange: setActive,
              }}
            />
          </Shell>
        </div>
      </Modal>
    </div>
  );
};

export default PriorAuthorization;
