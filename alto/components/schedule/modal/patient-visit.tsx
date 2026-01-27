import { VisitStatus } from "@prisma/client";
import { useQueryState } from "nuqs";
import React, { useState } from "react";

import { Checkbox, DateRangePicker, Modal, SelectInput } from "@/components/ui";
import {
  billingCode,
  initialQuery,
  scheduleColumns,
  scheduleListColumns,
  visitStatusOptions,
} from "@/constants";
import {
  useGetPatients,
  useGetProviders,
  useGetSchedules,
  useGetUsers,
  useTable,
} from "@/hooks";
import { addThousandSeparator, formatDateTime } from "@/lib";
import { PatientScheduleResponse } from "@/types";

import { DataTable, Shell } from "../../data-table";

type filterType = {
  visitStatus: string;
  billingCode: string;
  office: string;
  allOffice: boolean;
  date: (Date | undefined)[];
  caregiver: string;
  patient: string;
};
const initialFilter: filterType = {
  caregiver: "",
  patient: "",
  visitStatus: "",
  billingCode: "",
  office: "",
  allOffice: false,
  date: [undefined, undefined],
};

const PatientVisitModal = ({
  title,
  open,
  modalClose,
}: {
  title: string;
  open: boolean;
  modalClose: () => void;
}) => {
  const [Data, setData] = React.useState<PatientScheduleResponse[]>([]);
  const { data, isLoading } = useGetPatients({ status: "ACTIVE" });
  const { data: caregivers, isLoading: isLoadingCaregivers } = useGetUsers({
    tab: "caregiver",
  });
  const { data: providers, isLoading: isLoadingOffice } = useGetProviders();
  const [filter, setFilter] = useState<filterType>(initialFilter);
  const [query, setQuery] = useState(initialQuery);
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const { data: schedules } = useGetSchedules({
    patient: filter?.patient,
    caregiver: filter?.caregiver,
    visitStatus: filter?.visitStatus,
    office: filter?.allOffice ? "all" : filter?.office,
    billingCode: filter.billingCode,
    startDate: filter.date[0],
    endDate: filter.date[1],
  });

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: scheduleListColumns,
    query: query,
    setQuery: setQuery,
    name: "patient-visit",
    columnProps: {
      modal: true,
    },
  });

  React.useEffect(() => {
    const tableData =
      schedules?.data?.schedules?.map((schedule) => ({
        ...schedule,
        visitDateTime: formatDateTime(schedule.appointmentStartTime ?? ""),
        endDateTime: formatDateTime(schedule.appointmentEndTime ?? ""),
        patientName: `${schedule.patient?.firstName} ${schedule.patient?.lastName}`,
        caregiverName: `${schedule.caregiver?.firstName} ${schedule.caregiver?.lastName}`,
        visitStatus: visitStatusOptions.find(
          (option) => option.value === schedule.visitStatus,
        )?.label as VisitStatus,
      })) || [];
    setData(tableData);
  }, [schedules]);

  const totalHours = schedules?.data?.schedules?.reduce((total, schedule) => {
    const appointmentStart = new Date(schedule.appointmentStartTime ?? "");
    const appointmentEnd = new Date(schedule.appointmentEndTime ?? "");
    const duration = appointmentEnd.getTime() - appointmentStart.getTime();
    const durationInHours = duration / (1000 * 60 * 60);
    return total + durationInHours;
  }, 0);

  return (
    <Modal
      title={title}
      open={open}
      onClose={modalClose}
      className="md:max-w-[90%]"
    >
      <div className="h-[75vh] overflow-auto flex flex-col gap-5 scrollbar-hide">
        <div className="grid grid-col-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-10">
          <div className="flex gap-2 items-center w-full">
            <p className="text-sm">Date:</p>
            <div className="flex-1">
              <DateRangePicker
                onChange={(value) => {
                  setFilter((prevState) => ({
                    ...prevState,
                    date: value,
                  }));
                }}
                value={filter.date as Date[]}
              />
            </div>
          </div>

          <div className="flex gap-2 items-center w-full">
            <p className="text-sm">Patient:</p>
            <SelectInput
              options={data?.data?.patients?.map((patient) => ({
                label: `${patient.firstName} ${patient.lastName}`,
                value: patient.id,
              }))}
              field={{
                onChange: (value) => {
                  setFilter((prevState) => ({
                    ...prevState,
                    patient: value,
                  }));
                },
                value: filter.patient,
              }}
              placeholder="Select a Patient"
              loading={isLoading}
              allowClear
              searchable
              modalSearch
            />
          </div>

          <div className="flex gap-2 items-center w-full">
            <p className="text-sm">Caregiver:</p>
            <SelectInput
              options={
                caregivers?.data?.users?.map((caregiver) => ({
                  label: `${caregiver.firstName} ${caregiver.lastName}`,
                  value: caregiver.id,
                })) || []
              }
              field={{
                onChange: (value) => {
                  setFilter((prevState) => ({
                    ...prevState,
                    caregiver: value,
                  }));
                },
                value: filter.caregiver,
              }}
              allowClear
              searchable
              modalSearch
              placeholder="Select a Caregiver"
              loading={isLoadingCaregivers}
            />
          </div>

          <div className="flex gap-2 items-center w-full">
            <p className="text-sm">Billing Code:</p>
            <SelectInput
              options={billingCode}
              field={{
                onChange: (value) => {
                  setFilter((prevState) => ({
                    ...prevState,
                    billingCode: value,
                  }));
                },
                value: filter.billingCode,
              }}
              allowClear
              searchable
              modalSearch
              placeholder="Enter Billing Code"
            />
          </div>

          <div className="flex gap-2 items-center w-full">
            <p className="text-sm">Visit Status:</p>
            <SelectInput
              options={visitStatusOptions}
              field={{
                onChange: (value) => {
                  setFilter((prevState) => ({
                    ...prevState,
                    visitStatus: value,
                  }));
                },
                value: filter.visitStatus,
              }}
              allowClear
              searchable
              modalSearch
              placeholder="Enter Visit Status"
            />
          </div>

          <div className="flex gap-2 items-center w-full">
            <p className="text-sm">Office:</p>
            <SelectInput
              options={providers?.data?.providers?.map((provider) => ({
                label: provider.providerName as string,
                value: provider.id,
              }))}
              field={{
                onChange: (value) => {
                  setFilter((prevState) => ({
                    ...prevState,
                    office: value,
                  }));
                },
                value: filter.office,
              }}
              loading={isLoadingOffice}
              placeholder="Enter Office"
              allowClear
              searchable
              modalSearch
            />
            <div className="flex items-center gap-2">
              <Checkbox
                checked={filter.allOffice}
                onCheckedChange={() =>
                  setFilter((prevFilter) => ({
                    ...prevFilter,
                    allOffice: !prevFilter.allOffice,
                  }))
                }
              />
              <p className="text-sm">All</p>
            </div>
          </div>
        </div>

        <Shell className="max-w-full relative !p-0">
          <DataTable
            table={table}
            tableKey={tableKey}
            columns={tableColumns}
            rawColumns={scheduleColumns}
            search={search}
            setSearch={setSearch}
            className="!h-[calc(100vh-60vh)] md:!h-[calc(100vh-55vh)]"
            setQuery={setQuery}
            modal
          />
        </Shell>

        <div className="flex gap-2">
          <p className="bg-secondary p-2 w-full">
            Total Hours: {addThousandSeparator(totalHours ?? 0)}
          </p>
          <p className="bg-secondary p-2 w-full">
            Total Visits: {Number(Data?.length)}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default PatientVisitModal;
