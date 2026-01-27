"use client";
import { ArrowRightIcon, PlusIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next-nprogress-bar";
import { useQueryState } from "nuqs";
import * as React from "react";
import toast from "react-hot-toast";

import { DataTable, Shell } from "@/components/data-table";
import { EVVActionsCell } from "@/components/evv";
import { Alert, Button, DateInput, Modal, SelectInput } from "@/components/ui";
import { initialQuery, userColumns } from "@/constants";
import { evvColumns, unscheduledVisitColumns } from "@/constants/evv";
import { useAuth } from "@/context/AuthContext";
import {
  useDeleteSchedule,
  useDisclosure,
  useGetPatients,
  useGetSchedules,
  useGetUnScheduledVisits,
  useTable,
} from "@/hooks";
import { formatDateTime, getFullName } from "@/lib";
import {
  ActionType,
  PatientScheduleResponse,
  UnscheduledVisitResponse,
} from "@/types";

export interface TableProps<T> {
  data: T[];
  totalCount: number;
}

function ElectronicVisitVerificationView() {
  const [active, setActive] = useQueryState("tab", { defaultValue: "active" });
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const { authUser } = useAuth();
  const { data: patients, isLoading: loading } = useGetPatients({
    status: "ACTIVE",
  });
  const { data: scheduleVists, isLoading: loader } = useGetUnScheduledVisits(
    authUser?.id as string,
  );

  const [action, setAction] = React.useState<ActionType>();
  const [vvDate, setVvDate] = React.useState<Date | undefined>();
  const [selected, setSelected] = React.useState<
    PatientScheduleResponse | UnscheduledVisitResponse
  >();
  const { opened, onOpen, onClose } = useDisclosure();

  const [patient, setPatient] = React.useState<string>("");
  const router = useRouter();
  const [query, setQuery] = React.useState(initialQuery);

  const { data, isLoading, mutate } = useGetSchedules({
    caregiver: authUser?.id,
    status: active,
    date: vvDate,
  });
  const { data: deleteResponse, trigger, isMutating } = useDeleteSchedule();
  const [Data, setData] = React.useState<
    (PatientScheduleResponse | UnscheduledVisitResponse)[]
  >([]);

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: active === "unscheduled" ? unscheduledVisitColumns : evvColumns,
    query: query,
    setQuery: setQuery,
    name: active === "unscheduled" ? "unscheduled" : "evv",
    resetTableState: active,
    columnProps: {
      actionsCell: (
        row: Row<PatientScheduleResponse | UnscheduledVisitResponse>,
      ) => (
        <EVVActionsCell
          callback={(action) => {
            setAction(action);
            setSelected(row.original);
          }}
          activeTab={active}
          id={row?.original?.id}
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
        date: formatDateTime(schedule?.appointmentStartTime as Date),
        linkedToScheduler: "Yes",
        patSigned: schedule?.scheduleVisitVerification?.signature?.mediaId
          ? "Yes"
          : "No",
      })) || [];
    const unscheduledTableData =
      scheduleVists?.data?.map((schedule) => ({
        ...schedule,
        client: getFullName(
          schedule?.patient?.firstName,
          schedule?.patient?.lastName,
        ),
        date: formatDateTime(schedule?.createdAt as Date),
        linkedToScheduler: "No",
        patSigned: schedule?.patientSignature?.mediaId ? "Yes" : "No",
        cgSigned: schedule?.caregiverSignature?.mediaId ? "Yes" : "No",
        status:
          schedule?.startTime && schedule?.endTime
            ? "Completed"
            : schedule?.startTime
              ? "Started"
              : "-",
        startDate: formatDateTime(schedule?.startTime as Date),
        endDate: formatDateTime(schedule?.endTime as Date),
        // billingCode: schedule?.patient?.bill
      })) || [];

    setData(
      (active === "unscheduled" ? unscheduledTableData : tableData) || [],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <Alert
        title={active === "archived" ? "Activate Schedule" : "Archive Schedule"}
        description={`Are you sure you want to ${active === "archived" ? "activate" : "archive"} this schedule?`}
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

      <Modal title={"Select Patient"} open={opened} onClose={onClose}>
        <div className=" gap-2 items-center w-full">
          <p className="text-sm mb-2 font-semibold">Patient:</p>
          <SelectInput
            options={patients?.data?.patients?.map((patient) => ({
              label: `${patient.firstName} ${patient.lastName}`,
              value: patient.id,
            }))}
            field={{
              onChange: (value) => {
                setPatient(value);
              },
              value: patient,
            }}
            placeholder="Select a Patient"
            loading={loading}
            allowClear
            searchable
            modalSearch
          />
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              onClick={() => {
                router.push(`/evv/${patient}/unscheduled-visit?create=true`);
                onClose();
              }}
              rightIcon={<ArrowRightIcon />}
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>

      <DataTable
        table={table}
        title="Electronic Visit Verification"
        tableKey={tableKey}
        fetching={isLoading || loader}
        columns={tableColumns}
        search={search}
        setSearch={setSearch}
        setQuery={setQuery}
        subtitle={
          <p className="text-base">
            Caregiver:{" "}
            <span className="font-semibold uppercase">
              {authUser?.firstName}, {authUser?.lastName}
            </span>
          </p>
        }
        segmentedControl={{
          data: [
            { value: "active", label: "Active" },
            { value: "unscheduled", label: "Unscheduled" },
            { value: "archived", label: "Archived" },
          ],
          value: active,
          onChange: setActive,
        }}
        onRowClick={(row) =>
          active === "active"
            ? router.push(`/evv/${row.id}`)
            : active === "unscheduled"
              ? router.push(`/evv/${row.id}/unscheduled-visit`)
              : null
        }
        rawColumns={userColumns}
        extraToolbar={
          <>
            <Button type="button" onClick={onOpen}>
              <PlusIcon />
              Add Unscheduled Visit
            </Button>
            <DateInput
              onChange={(date) => setVvDate(date as Date)}
              placeholder="Visit Verification Date"
              value={vvDate}
            />
          </>
        }
      />
    </Shell>
  );
}

export default ElectronicVisitVerificationView;
