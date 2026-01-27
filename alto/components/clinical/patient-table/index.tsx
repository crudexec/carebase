"use client";
import { PatientStatus } from "@prisma/client";
import { useRouter } from "next-nprogress-bar";
import { useQueryState } from "nuqs";
import * as React from "react";

import { DataTable, Shell } from "@/components/data-table";
import { clinicalPatientColumns, initialQuery } from "@/constants";
import { useGetPatients, useTable } from "@/hooks";
import { formatDate } from "@/lib";

export type tableDataType = {
  id: string;
  patientName: string;
  pan: string;
  dateAdmitted: string;
  dischargeDate: string;
  dateOfBirth: string;
  officeName: string;
};

function PatientTable({ title, route }: { title: string; route: string }) {
  const [active, setActive] = useQueryState("tab", { defaultValue: "active" });
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const { data, isLoading } = useGetPatients({
    status: active as PatientStatus,
  });
  const [query, setQuery] = React.useState(initialQuery);
  const router = useRouter();
  const [Data, setData] = React.useState<tableDataType[]>([]);

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: clinicalPatientColumns,
    query: query,
    setQuery: setQuery,
    name: "clinical-patient",
    resetTableState: active,
    columnProps: {
      selectable: false,
    },
  });

  React.useEffect(() => {
    const tableData = (data?.data?.patients || [])?.map((patient) => ({
      id: patient.id,
      patientName: `${patient?.firstName ?? ""} ${patient?.lastName ?? ""}`,
      pan: patient?.pan ?? "-",
      dateAdmitted:
        patient.patientAdmission[0]?.status === "ACTIVE" &&
        patient.patientAdmission[0]?.actionDate
          ? formatDate(patient.patientAdmission[0]?.actionDate as Date)
          : "-",
      dischargeDate:
        patient.patientAdmission[0]?.status === "DISCHARGED" &&
        patient.patientAdmission[0]?.actionDate
          ? formatDate(patient.patientAdmission[0]?.actionDate as Date)
          : "-",
      dateOfBirth: formatDate(patient?.dob as Date),
      officeName: patient?.provider?.providerName ?? "-",
    }));
    setData(tableData);
  }, [data]);

  return (
    <Shell>
      <DataTable
        table={table}
        tableKey={tableKey}
        title={title}
        subtitle={"Patient Admission"}
        onRowClick={(row) =>
          active === "active" && router.push(`/${route}/${row.id}`)
        }
        fetching={isLoading}
        columns={tableColumns}
        search={search}
        setSearch={setSearch}
        setQuery={setQuery}
        rawColumns={clinicalPatientColumns}
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
  );
}
export { PatientTable };
