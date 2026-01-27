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
import { Alert, Button } from "@/components/ui";
import { initialQuery, scheduleServices, userColumns } from "@/constants";
import { assessmentColumns } from "@/constants/assessment";
import {
  useDeleteSchedule,
  useGetPatient,
  useGetSchedules,
  useTable,
} from "@/hooks";
import { formatDate, formatDateTime, getFullName, getTime } from "@/lib";
import { PageProps, PatientScheduleResponse } from "@/types";

export interface TableProps<T> {
  data: T[];
  totalCount: number;
}

function Assessment({ params: { id } }: PageProps) {
  const [active, setActive] = useQueryState("tab", { defaultValue: "active" });
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const { data: patient, isLoading: isFetching } = useGetPatient({ id });
  const router = useRouter();
  const [action, setAction] = React.useState<string>();
  const [selected, setSelected] = React.useState<PatientScheduleResponse>();
  const [query, setQuery] = React.useState(initialQuery);

  const { data, isLoading, mutate } = useGetSchedules({
    patient: id,
    status: active,
  });
  const { data: deleteResponse, trigger, isMutating } = useDeleteSchedule();
  const [Data, setData] = React.useState<PatientScheduleResponse[]>([]);

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: assessmentColumns,
    query: query,
    setQuery: setQuery,
    name: "patient-assessment",
    resetTableState: active,
    columnProps: {
      actionsCell: (row: Row<PatientScheduleResponse>) => (
        <ActionsCell
          callback={(action) => {
            if (action === "verify") {
              router.push(
                `/evv/${row.original.id}${row.original?.scheduleVisitVerification?.signature ? "?view=true" : ""}`,
              );
              return;
            }
            if (action === "submit") {
              router.push(
                `/assessment/${row.original.id}/${row.original.service}?patient=${row.original.patientId}`,
              );
              return;
            }
            setAction(action);
            setSelected(row.original);
          }}
          activeTab={active}
          schedule={row?.original}
        />
      ),
    },
  });

  React.useEffect(() => {
    const tableData =
      data?.data?.schedules?.map((schedule) => ({
        ...schedule,
        patientName: getFullName(
          schedule?.patient?.firstName,
          schedule?.patient?.lastName,
        ),
        clinicalTask: scheduleServices?.find(
          (service) => service.value === schedule?.service,
        )?.label,
        endDate: formatDateTime(schedule?.appointmentEndTime as Date),
        caregiverName: getFullName(
          schedule?.caregiver?.firstName,
          schedule?.caregiver?.lastName,
        ),
        timeInOut: `${getTime(schedule?.appointmentStartTime as Date)} - ${getTime(schedule?.appointmentEndTime as Date)}`,
        dateCompleted: formatDate(schedule?.completedDate),
        assignedDate: formatDate(schedule?.appointmentStartTime),
        status: schedule?.Assessment?.qaStatus
          ? schedule?.Assessment?.qaStatus
          : schedule?.Assessment?.submittedAt
            ? "SENT TO QA"
            : schedule?.Assessment
              ? "PENDING"
              : "STILL DUE",
        evv: schedule?.scheduleVisitVerification?.signature
          ? "Verified"
          : "Not Verified",
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
        title="Patient Assessment"
        tableKey={tableKey}
        fetching={isLoading}
        columns={tableColumns}
        search={search}
        setSearch={setSearch}
        setQuery={setQuery}
        subtitle={getFullName(
          patient?.data?.firstName,
          patient?.data?.lastName,
        )?.toUpperCase()}
        segmentedControl={{
          data: [
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ],
          value: active,
          onChange: setActive,
        }}
        rawColumns={userColumns}
        extraToolbar={
          <>
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

export default Assessment;
