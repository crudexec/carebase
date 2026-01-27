import { PlusIcon } from "lucide-react";
import React, { useState } from "react";

import { DataTable, Shell } from "@/components/data-table";
import FormHeader from "@/components/form-header";
import { Button } from "@/components/ui";
import { DiagnosisColumns, initialQuery, ProcedureColumns } from "@/constants";
import { useDisclosure, useQueryParams, useTable } from "@/hooks";
import { formatDate, modifyDateFields } from "@/lib";
import { ObjectData } from "@/types";

import DiagnosisProcedureModal from "./create-modal";

const DiagnosesProcedure = ({
  scope,
  assessmentId,
  data,
  patientScheduleId,
  mutate,
  assessment,
  isQA,
}: {
  scope: "procedure" | "diagnosis";
  assessmentId: string;
  data?: ObjectData[];
  patientScheduleId: string;
  mutate: () => void;
  assessment?: ObjectData;
  isQA: boolean;
}) => {
  const [active, setActive] = useQueryParams(`${scope}Tab`, {
    defaultValue: "active",
  });
  const [search, setSearch] = useQueryParams("search", { defaultValue: "" });
  const [searchProc, setSearchProc] = useQueryParams("searchProc", {
    defaultValue: "",
  });
  const [query, setQuery] = React.useState(initialQuery);
  const [Data, setData] = useState<ObjectData[]>([]);
  const { opened, onOpen, onClose } = useDisclosure();
  const [localScopeState, setState] = useState("");

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: scope === "diagnosis" ? DiagnosisColumns : ProcedureColumns,
    query: query,
    setQuery: setQuery,
    name: scope === "diagnosis" ? "poc-diagnosis" : "poc-procedure",
    resetTableState: active,
  });

  React.useEffect(() => {
    const tableData =
      data?.map((item) =>
        modifyDateFields({
          ...item,
          diagnosisDate: formatDate(item.date),
          icdCode: item.icdCode,
          icdDescription: item.icdDescription,
          onSet: "OnSet",
        }),
      ) || [];
    setData(tableData);
  }, [data]);

  const closeModal = () => {
    onClose();
    setState("");
  };

  return (
    <div>
      <FormHeader className="mt-4">
        {scope === "diagnosis" ? "Diagnoses (ICD10)" : "Procedures (ICD10)"}
      </FormHeader>
      <DiagnosisProcedureModal
        title={
          scope === "diagnosis" ? "Diagnosis (ICD10)" : "Procedures (ICD10)"
        }
        open={opened}
        modalClose={closeModal}
        localScopeState={localScopeState}
        scope={scope}
        mutate={mutate}
        assessmentId={assessmentId}
        patientScheduleId={patientScheduleId}
        data={data ?? []}
        assessment={assessment}
      />

      <Shell className="!p-0 mt-4">
        <DataTable
          table={table}
          setQuery={setQuery}
          tableKey={tableKey}
          columns={tableColumns}
          rawColumns={
            scope === "diagnosis" ? DiagnosisColumns : ProcedureColumns
          }
          search={scope === "diagnosis" ? search : searchProc}
          setSearch={scope === "diagnosis" ? setSearch : setSearchProc}
          className={`!h-[calc(100vh-60vh)] ${Data?.length ? "md:!h-[calc(100vh-40vh)]" : "md:!h-[calc(100vh-60vh)]"}}`}
          extraToolbar={
            <>
              {active === "active" && !isQA && (
                <Button
                  type="button"
                  onClick={() => {
                    setState(scope);
                    onOpen();
                  }}
                  className="ml-auto h-8 lg:flex"
                >
                  <PlusIcon size={"xs"} />
                  Add
                </Button>
              )}
            </>
          }
          segmentedControl={{
            data: [
              { value: "active", label: "Active" },
              { value: "archived", label: "Archived" },
            ],
            value: active,
            onChange: setActive,
          }}
        />
      </Shell>
    </div>
  );
};

export default DiagnosesProcedure;
