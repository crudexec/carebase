"use client";
import { Row } from "@tanstack/react-table";
import { useQueryState } from "nuqs";
import { TrashIcon } from "@radix-ui/react-icons";
import { useRouter } from "next-nprogress-bar";
import * as React from "react";
import toast from "react-hot-toast";

import AppLoader from "@/components/app-loader";
import ActionsCell from "@/components/assessment/action-button";
import { DataTable, Shell } from "@/components/data-table";
import { Alert, Button, SelectInput } from "@/components/ui";
import {
  initialQuery,
  qaColumns,
  scheduleServices,
  userColumns,
} from "@/constants";
import {
  useDeleteSchedule,
  useDisclosure,
  useGetPatients,
  useTable,
} from "@/hooks";
import { useGetAssessmentSubmissions } from "@/hooks/request/assessment";
import { formatDate, getFullName } from "@/lib";
import { AssessmentResponse } from "@/types";

export interface TableProps<T> {
  data: T[];
  totalCount: number;
}

function QAAssessment() {
  const [active, setActive] = useQueryState("tab", { defaultValue: "active" });
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const { data: patients, isLoading: isFetching } = useGetPatients({
    status: "ACTIVE",
  });
  const router = useRouter();
  const [action, setAction] = React.useState<string>();
  const [selected, setSelected] = React.useState<AssessmentResponse>();
  const [filter, setFilter] = React.useState("");
  const [query, setQuery] = React.useState(initialQuery);
  const { onClose, opened } = useDisclosure(true);

  const { data, isLoading, mutate } = useGetAssessmentSubmissions({
    patientId: filter,
    status: active,
  });
  const { data: deleteResponse, trigger, isMutating } = useDeleteSchedule();
  const [Data, setData] = React.useState<AssessmentResponse[]>([]);

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: qaColumns,
    query: query,
    setQuery: setQuery,
    name: "qa-manager",
    resetTableState: active,
    columnProps: {
      actionsCell: (row: Row<AssessmentResponse>) => (
        <ActionsCell
          callback={(action) => {
            setAction(action);
            setSelected(row.original);
          }}
          activeTab={active}
          isQAManager
        />
      ),
    },
  });

  React.useEffect(() => {
    const tableData =
      data?.data?.assessments?.map((assessment) => ({
        ...assessment,
        note: scheduleServices?.find(
          (service) => service.value === assessment?.patientSchedule?.service,
        )?.label,
        qad: assessment?.qaed ? "Yes" : "No",
        patientName: getFullName(
          assessment?.patientSchedule?.patient?.firstName,
          assessment?.patientSchedule?.patient?.lastName,
        ),
        caregiverName: getFullName(
          assessment?.caregiver?.firstName,
          assessment?.caregiver?.lastName,
        ),
        arrival: assessment?.timeIn,
        depart: assessment?.timeOut,
        visit: formatDate(assessment?.visitDate),
      })) || [];

    setData(tableData);
  }, [data]);

  const closeModal = () => {
    setAction(undefined);
    setSelected(undefined);
  };

  React.useEffect(() => {
    if (deleteResponse?.success) {
      mutate();
      table.resetRowSelection();
      toast.success(`Success|${deleteResponse?.message}`);
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteResponse]);

  return (
    <Shell>
      <AppLoader loading={isFetching} />
      <Alert
        title={<h2 className="text-2xl">Welcome to QA Manager</h2>}
        description={
          <ul className="text-base flex gap-2 flex-col mt-4 list-disc list-inside">
            <li>Select a Patient to begin.</li>
            <li>Only Completed tasks will be listed.</li>
            <li>
              After Approving OR Dis-approving the Assessment/Note, it will not
              show up in the list.
            </li>
            <li>
              Only 10 months old completed record from todays date, will be seen
              in the list.
            </li>
          </ul>
        }
        open={opened}
        callback={onClose}
      />
      <Alert
        title={active === "archived" ? "Activate Record" : "Archive Record"}
        description={`Are you sure you want to ${active === "archived" ? "activate" : "archive"} this record?`}
        variant={active === "archived" ? "default" : "destructive"}
        open={action === "delete"}
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

      <DataTable
        table={table}
        title="QA Management"
        tableKey={tableKey}
        fetching={isLoading}
        columns={tableColumns}
        search={search}
        setSearch={setSearch}
        setQuery={setQuery}
        segmentedControl={{
          data: [
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ],
          value: active,
          onChange: setActive,
        }}
        rawColumns={userColumns}
        onRowClick={(row) => {
          router.push(
            `/assessment/${row.patientScheduleId}/${row?.patientSchedule?.service}?patient=${row?.patientSchedule?.patientId}&isQA=true`,
          );
        }}
        extraToolbar={
          <>
            <SelectInput
              allowClear
              className="ring-offset-0  focus:outline-none focus:ring-0 focus:ring-ring focus:ring-offset-0"
              options={patients?.data?.patients?.map((item) => ({
                label: getFullName(item?.lastName, item?.firstName),
                value: item?.id,
              }))}
              placeholder="Select a patient"
              field={{ value: filter, onChange: (value) => setFilter(value) }}
            />
            {(table.getIsSomeRowsSelected() ||
              table.getIsAllRowsSelected()) && (
              <Button
                aria-label="Activate or Archive"
                variant={active === "active" ? "destructive" : "default"}
                size="sm"
                onClick={() => setAction("delete")}
              >
                <TrashIcon className=" size-4" />
                {active === "active" ? "Archive" : "Restore"}
              </Button>
            )}{" "}
          </>
        }
      />
    </Shell>
  );
}

export default QAAssessment;
