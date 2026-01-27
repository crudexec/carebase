"use client";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useRouter } from "next-nprogress-bar";
import { useQueryState } from "nuqs";
import * as React from "react";
import toast from "react-hot-toast";
import generatePDF, { Options } from "react-to-pdf";
import { useReactToPrint } from "react-to-print";

import { ActionsCell } from "@/components/clinical/poc/action-button";
import { DataTable, Shell } from "@/components/data-table";
import { Alert, Button } from "@/components/ui";
import { initialQuery, planOfCareColumns } from "@/constants";
import {
  useArchiveorActivatePlanOfCare,
  useDisclosure,
  useGetPatient,
  useGetPlanOfCares,
  useTable,
} from "@/hooks";
import { delay, formatDate, getFullName } from "@/lib";
import { PlanOfCareResponse } from "@/types";

type ParamType = {
  params: { patientId: string };
};

function PlanOfCare({ params: { patientId } }: ParamType) {
  const [active, setActive] = useQueryState("tab", { defaultValue: "active" });
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [selected, setSelected] = React.useState<PlanOfCareResponse>();
  const { data, isLoading, mutate } = useGetPlanOfCares({
    patientId,
    status: active,
  });
  const { data: patient, isLoading: isFetching } = useGetPatient({
    id: patientId,
  });
  const [query, setQuery] = React.useState(initialQuery);
  const {
    opened: openedArchive,
    onOpen: onOpenArchive,
    onClose: onCloseArchive,
  } = useDisclosure();
  const router = useRouter();
  const [Data, setData] = React.useState<PlanOfCareResponse[]>([]);
  const {
    data: response,
    trigger,
    isMutating,
  } = useArchiveorActivatePlanOfCare();
  const componentRef = React.useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const options: Options = {
    overrides: {
      canvas: {
        onclone: (document: Document) => {
          const div = document.getElementById("print-box") as HTMLDivElement;
          div.style.display = "block";
        },
      },
    },
    filename: "POC Plus Summary",
  };

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: planOfCareColumns,
    query: query,
    setQuery: setQuery,
    name: "POC Plus Summary",
    columnProps: {
      selectable: true,
      actionsCell: (row) => (
        <ActionsCell
          callback={async (action) => {
            if (action === "view") {
              router.push(
                `/clinical/poc/${patientId}/create?planOfCareId=${row.original.id}&action=view`,
              );
              return;
            } else if (action === "edit") {
              router.push(
                `/clinical/poc/${patientId}/create?planOfCareId=${row.original.id}&action=edit`,
              );
              return;
            } else if (action === "delete") {
              onOpenArchive();
              setSelected(row.original);
            }
            setSelected(row.original);
            await delay(1000);
            if (action === "print") {
              handlePrint();
            } else if (action === "print-pdf") {
              generatePDF(componentRef, options);
            }
          }}
          activeTab={active}
        />
      ),
    },
    resetTableState: active,
  });

  React.useEffect(() => {
    const tableData = (data?.data?.planOfCares || [])?.map((item) => ({
      ...item,
      docType: "POC Plus",
      certFrom: formatDate(item.certStartDate),
      certTo: formatDate(item.certEndDate),
      sentDate: formatDate(item.signatureSentDate),
      receivedDate: formatDate(item.signatureReceivedDate),
      recordedDate: formatDate(item.createdAt),
      qAStatus:
        !item.qAstatus || item.qAstatus === "in-use" ? "In Use" : "Completed",
    }));
    setData(tableData);
  }, [data]);

  React.useEffect(() => {
    if (response?.success) {
      mutate();
      table.resetRowSelection();
      toast.success(`Success|${response?.message}`);
      onCloseArchive();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return (
    <Shell>
      <Alert
        title={active === "active" ? "Archive POC Plus" : "Restore POC Plus"}
        description={`Are you sure you want to ${active === "active" ? "archive" : "restore"} this document(s)?`}
        variant={active === "active" ? "destructive" : "default"}
        open={openedArchive}
        onClose={onCloseArchive}
        callback={async () => {
          await trigger({
            ids: selected
              ? [selected?.id]
              : table.getSelectedRowModel().rows.map((row) => row.original?.id),
            status: active,
          });
        }}
        loading={isMutating}
      />
      <DataTable
        table={table}
        tableKey={tableKey}
        title={"POC Plus"}
        subtitle={getFullName(
          patient?.data?.firstName,
          patient?.data?.lastName,
        )?.toUpperCase()}
        fetching={isLoading || isFetching}
        columns={tableColumns}
        setQuery={setQuery}
        rawColumns={planOfCareColumns}
        search={search}
        setSearch={setSearch}
        segmentedControl={{
          data: [
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ],
          value: active,
          onChange: setActive,
        }}
        extraToolbar={
          <>
            <Button
              type="button"
              onClick={() => {
                router.push(`/clinical/poc/${patientId}/create`);
              }}
              size="sm"
            >
              <PlusIcon />
              Add POC Plus
            </Button>
            {(table.getIsSomeRowsSelected() ||
              table.getIsAllRowsSelected()) && (
              <Button
                aria-label="Activate or Archive"
                variant={active === "active" ? "destructive" : "default"}
                size="sm"
                onClick={onOpenArchive}
              >
                <TrashIcon className=" size-4" />
                {active === "active" ? "Archive" : "Restore"}
              </Button>
            )}
          </>
        }
      />
    </Shell>
  );
}
export default PlanOfCare;
