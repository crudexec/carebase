"use client";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useRouter } from "next-nprogress-bar";
import { useQueryState } from "nuqs";
import * as React from "react";
import toast from "react-hot-toast";

import { Cert485ActionsCell } from "@/components/clinical";
import { DataTable, Shell } from "@/components/data-table";
import PromptModal from "@/components/prompt-modal";
import { Alert, Button } from "@/components/ui";
import { initialQuery } from "@/constants";
import { cer485Columns } from "@/constants/clinical/cert485";
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

function Cert485({ params: { patientId } }: ParamType) {
  const [active, setActive] = useQueryState("tab", { defaultValue: "active" });
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [selected, setSelected] = React.useState<PlanOfCareResponse>();
  const { data, isLoading, mutate } = useGetPlanOfCares({
    patientId,
    status: active,
    isCert485: true,
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
  const { opened, onOpen } = useDisclosure();

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: cer485Columns,
    query: query,
    setQuery: setQuery,
    name: "Cert485 Summary",
    columnProps: {
      selectable: true,
      actionsCell: (row) => (
        <Cert485ActionsCell
          callback={async (action) => {
            if (action === "view") {
              router.push(
                `/clinical/cert485/${patientId}/create?planOfCareId=${row.original.id}&action=view`,
              );
              return;
            } else if (action === "edit") {
              router.push(
                `/clinical/cert485/${patientId}/create?planOfCareId=${row.original.id}&action=edit`,
              );
              return;
            } else if (action === "delete") {
              onOpenArchive();
              setSelected(row.original);
            }
            setSelected(row.original);
            await delay(1000);
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
      certStart: formatDate(item?.certStartDate),
      certEnd: formatDate(item?.certEndDate),
      status:
        !item.qAstatus || item.qAstatus === "in-use" ? "In Use" : "Completed",
      dateSent: formatDate(item?.signatureSentDate),
      recordedDate: formatDate(item?.createdAt),
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
        title={
          active === "active"
            ? "Archive 485 Ceritification & POC"
            : "Restore 485 Ceritification & POC"
        }
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
      <PromptModal
        title="New POC Plus"
        description="We recommend using POC Plus for Medicare CoP requirements."
        variant="destructive"
        open={opened}
        onClose={() => router.push(`/clinical/poc/${patientId}/create`)}
        callback={() => router.push(`/clinical/cert485/${patientId}/create`)}
        secondaryLabel="Go to POC Plus"
        primaryLabel="Continue Anyway"
        secondaryVariant="default"
      />

      <DataTable
        table={table}
        tableKey={tableKey}
        title={"485 Certification & POC"}
        subtitle={getFullName(
          patient?.data?.firstName,
          patient?.data?.lastName,
        )?.toUpperCase()}
        fetching={isLoading || isFetching}
        columns={tableColumns}
        setQuery={setQuery}
        rawColumns={cer485Columns}
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
            <Button type="button" onClick={onOpen} size="sm">
              <PlusIcon />
              Add
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
export default Cert485;
