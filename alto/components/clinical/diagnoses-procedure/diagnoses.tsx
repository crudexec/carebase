import { PlusIcon, TrashIcon } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

import AppLoader from "@/components/app-loader";
import { DataTable, Shell } from "@/components/data-table";
import FormHeader from "@/components/form-header";
import { Alert, Button } from "@/components/ui";
import { DiagnosisColumns, initialQuery, ProcedureColumns } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import {
  useDisclosure,
  useGetDiagnosisProcedure,
  useQueryParams,
  useTable,
} from "@/hooks";
import { formatDate, modifyDateFields } from "@/lib";
import { CreateDiagnosisProcedurePayload } from "@/schema";
import { ObjectData } from "@/types";

import { ActionsCell } from "./action-button";
import DiagnosisProcedureModal from "./create-modal";

type ArchiveCallbackProps = {
  ids: string[];
  status: "archived" | "active";
  scope: "diagnosis" | "procedure";
};

const DiagnosesProcedure = ({
  callback,
  isMutating,
  isArchiving,
  patientId,
  disabled,
  mutate,
  archiveCallback,
  createCallback,
  updateCallback,
  archiveResponse,
  createResponse,
  updateResponse,
  scope,
  parentId,
  url,
}: {
  callback: (value?: string) => void;
  isMutating: boolean;
  isArchiving: boolean;
  patientId: string;
  disabled?: boolean;
  mutate: () => void;
  archiveCallback: (data: ArchiveCallbackProps) => Promise<void>;
  createCallback: (data: CreateDiagnosisProcedurePayload) => Promise<void>;
  updateCallback: (data: CreateDiagnosisProcedurePayload) => Promise<void>;
  archiveResponse: ObjectData;
  createResponse: ObjectData;
  updateResponse: ObjectData;
  scope: "procedure" | "diagnosis";
  parentId: string;
  url: string;
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
  const [action, setAction] = useState("");
  const [selected, setSelected] = React.useState<ObjectData>();
  const [localScopeState, setState] = useState("");
  const {
    data: diagnosisData,
    isLoading: loading,
    mutate: refreshDiagnosis,
  } = useGetDiagnosisProcedure({ url, parentId, status: active, scope: scope });

  const { authUser: caregiver } = useAuth();

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: scope === "diagnosis" ? DiagnosisColumns : ProcedureColumns,
    query: query,
    setQuery: setQuery,
    name: scope === "diagnosis" ? "poc-diagnosis" : "poc-procedure",
    resetTableState: active,
    columnProps: {
      actionsCell: (row) => (
        <ActionsCell
          callback={(action) => {
            setAction(action);
            setState(scope);
            setSelected(row.original);
          }}
          activeTab={active}
        />
      ),
    },
  });

  React.useEffect(() => {
    const tableData =
      diagnosisData?.data?.diagnosisProcedures?.map((item) =>
        modifyDateFields({
          ...item,
          diagnosisDate: formatDate(item.date),
          icdCode: item.diagnosisProcedure?.code,
          icdDescription: item.diagnosisProcedure?.description,
          onSet: "OnSet",
        }),
      ) || [];
    setData(tableData);
  }, [diagnosisData]);

  const closeModal = () => {
    setAction("");
    onClose();
    setSelected(undefined);
    setState("");
  };

  React.useEffect(() => {
    if (archiveResponse?.success && localScopeState === scope) {
      mutate();
      refreshDiagnosis();
      table.resetRowSelection();
      toast.success(`Success|${archiveResponse?.message}`);
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archiveResponse, scope]);

  return (
    <div>
      <Alert
        title={
          active === "archived" ? "Activate Diagnosis" : "Archive Diagnosis"
        }
        description={`Are you sure you want to ${active === "archived" ? "activate" : "archive"} this diagnosis?`}
        variant={active === "archived" ? "default" : "destructive"}
        open={action === "delete"}
        onClose={closeModal}
        callback={async () => {
          await archiveCallback({
            ids: selected
              ? [selected.id]
              : table.getSelectedRowModel().rows.map((row) => row.original.id),
            status: active === "archived" ? "archived" : "active",
            scope: "diagnosis",
          });
        }}
        loading={isArchiving}
      />
      <AppLoader loading={loading} />
      <FormHeader className="mt-4">
        {scope === "diagnosis" ? "Diagnoses (ICD10)" : "Procedures (ICD10)"}
      </FormHeader>
      <DiagnosisProcedureModal
        title={
          scope === "diagnosis" ? "Diagnosis (ICD10)" : "Procedures (ICD10)"
        }
        open={opened || action === "edit" || action === "view"}
        modalClose={closeModal}
        refresh={() => {
          mutate();
          refreshDiagnosis();
          setState("");
        }}
        disabled={action === "view"}
        selected={selected}
        patientId={patientId}
        caregiverId={caregiver?.id}
        callback={(id) => callback(id)}
        scope={scope}
        createCallback={createCallback}
        updateCallback={updateCallback}
        createResponse={createResponse}
        updateResponse={updateResponse}
        isMutating={isMutating}
        parentId={parentId}
        localScopeState={localScopeState}
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
              {active === "active" && (
                <Button
                  type="button"
                  onClick={() => {
                    setState(scope);
                    onOpen();
                  }}
                  className="ml-auto h-8 lg:flex"
                  disabled={disabled}
                >
                  <PlusIcon size={"xs"} />
                  Add
                </Button>
              )}

              {(table.getIsSomeRowsSelected() ||
                table.getIsAllRowsSelected()) && (
                <>
                  <Button
                    aria-label="Activate or Archive"
                    variant={active === "archived" ? "default" : "destructive"}
                    className="ml-auto h-8 lg:flex"
                    onClick={() => {
                      setAction("delete");
                      setState(scope);
                    }}
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
            value: active,
            onChange: setActive,
          }}
        />
      </Shell>
    </div>
  );
};

export default DiagnosesProcedure;
