"use client";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useRouter } from "next-nprogress-bar";
import { useQueryState } from "nuqs";
import * as React from "react";
import toast from "react-hot-toast";

import { ActionsCell } from "@/components/clinical";
import { DataTable, Shell } from "@/components/data-table";
import Flex from "@/components/flex";
import PromptModal from "@/components/prompt-modal";
import { Alert, Button, Checkbox, DateInput } from "@/components/ui";
import { assessmentReasons, initialQuery } from "@/constants";
import { assessmentColumns } from "@/constants/clinical";
import {
  useArchiveAssessment,
  useDisclosure,
  useGetAssessments,
  useGetPatient,
  useTable,
} from "@/hooks";
import { delay, formatDate, getAssessment, getFullName } from "@/lib";
import { AssessmentResponse } from "@/types";

type ParamType = {
  params: { id: string };
};

function AssessmentSummary({ params: { id } }: ParamType) {
  const [active, setActive] = useQueryState("tab", { defaultValue: "active" });
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [selected, setSelected] = React.useState<AssessmentResponse>();
  const { data, isLoading, mutate } = useGetAssessments({
    patientId: id,
    status: active,
  });
  const { data: patient, isLoading: isFetching } = useGetPatient({ id });
  const [query, setQuery] = React.useState(initialQuery);
  const {
    opened: openedArchive,
    onOpen: onOpenArchive,
    onClose: onCloseArchive,
  } = useDisclosure();
  const router = useRouter();
  const [Data, setData] = React.useState<AssessmentResponse[]>([]);
  const { data: response, trigger, isMutating } = useArchiveAssessment();
  const { opened, onOpen, onClose } = useDisclosure();
  const [optionValue, setOptionValue] = React.useState<{
    dateCompleted?: Date;
    value: string;
  }>({ dateCompleted: undefined, value: "oasis" });

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: assessmentColumns,
    query: query,
    setQuery: setQuery,
    name: "Assessment Summary",
    columnProps: {
      selectable: true,
      actionsCell: (row) => (
        <ActionsCell
          callback={async (action) => {
            let url;
            if ((row.original.source as string) === "Non-Oasis") {
              url = `/clinical/assessment/${id}/${row.original.source?.toLowerCase()}/patient-tracking`;
            } else {
              url = `/clinical/assessment/${id}/${row.original.source?.toLowerCase()}`;
            }
            if (action === "view") {
              router.push(`${url}?assessmentId=${row.original.id}&action=view`);
              return;
            } else if (action === "edit") {
              router.push(`${url}?assessmentId=${row.original.id}&action=edit`);
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
    const tableData = (data?.data?.assessments || [])?.map((item) => ({
      ...item,
      completedDate: formatDate(item?.dateCompleted),
      reason: item?.reasons
        ?.map(
          (reason) => assessmentReasons?.find((r) => r.value === reason)?.label,
        )
        .join(", "),
      status:
        !item?.qaStatus || item?.qaStatus === "COMPLETED"
          ? "Completed"
          : "In Use",
      exportStatus: item?.exportStatus ? item?.exportStatus : "Not Locked",
      source: getAssessment(item?.source as string),
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
          active === "active" ? "Archive assessment" : "Restore assessment"
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
        title="Enter Assessment Completed Date"
        variant="destructive"
        open={opened}
        onClose={onClose}
        callback={() => {
          if (optionValue.dateCompleted && optionValue.value) {
            if (optionValue.value === "non-oasis") {
              router.push(
                `/clinical/assessment/${id}/${optionValue?.value}/patient-tracking?date=${optionValue?.dateCompleted?.toISOString().split("T")[0]}`,
              );
            } else {
              router.push(
                `/clinical/assessment/${id}/${optionValue?.value}?date=${optionValue?.dateCompleted?.toISOString().split("T")[0]}`,
              );
            }
          }
        }}
        primaryLabel="Continue"
        secondaryVariant="default"
        disabled={!optionValue.dateCompleted || !optionValue.value}
      >
        <p className="mb-4  font-semibold">
          (M00090) Date Assessment Completed
        </p>
        <DateInput
          value={optionValue.dateCompleted}
          onChange={(value) =>
            setOptionValue({ ...optionValue, dateCompleted: value as Date })
          }
        />
        <Flex col gap={4} className="mt-4 mb-8">
          {[
            { value: "oasis", label: "OASIS" },
            { value: "non-oasis", label: "Non-OASIS" },
            { value: "pediatric", label: "Pediatric Assessment" },
            { value: "non-skilled", label: "Non Skilled Assessment" },
          ].map((item) => (
            <Flex key={item.value}>
              <Checkbox
                checked={optionValue.value === item.value}
                onCheckedChange={() =>
                  setOptionValue({ ...optionValue, value: item.value })
                }
              >
                {item.label}
              </Checkbox>
              <span className="text-sm">{item?.label}</span>
            </Flex>
          ))}
        </Flex>
      </PromptModal>

      <DataTable
        table={table}
        tableKey={tableKey}
        title={"Assessments"}
        subtitle={getFullName(
          patient?.data?.firstName,
          patient?.data?.lastName,
        )?.toUpperCase()}
        fetching={isLoading || isFetching}
        columns={tableColumns}
        setQuery={setQuery}
        rawColumns={assessmentColumns}
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
export default AssessmentSummary;
