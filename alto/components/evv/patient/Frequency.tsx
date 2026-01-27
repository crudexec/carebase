import { PatientFrequency } from "@prisma/client";
import { Row } from "@tanstack/react-table";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import React, { useState } from "react";
import toast from "react-hot-toast";

import AppLoader from "@/components/app-loader";
import { DataTable, Shell } from "@/components/data-table";
import { Alert, Button } from "@/components/ui";
import { frequencyColumns, initialQuery } from "@/constants";
import {
  useArchiveFrequency,
  useDisclosure,
  useGetFrequencies,
  useTable,
} from "@/hooks";
import { formatDate, modifyDateFields } from "@/lib";
import { PatientFrequencyResponse } from "@/types";

import ActionsCell from "../action-button/frequency";
import { FrequencyModal } from "../modal";

const Frequency = ({ patientId }: { patientId?: string }) => {
  const { opened, onOpen, onClose } = useDisclosure();
  const [active, setActive] = useQueryState("tab", { defaultValue: "active" });
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const {
    opened: opened2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const { data, isLoading, mutate } = useGetFrequencies({
    id: patientId as string,
    status: active,
  });
  const { data: archiveResponse, isMutating, trigger } = useArchiveFrequency();
  const [query, setQuery] = React.useState(initialQuery);

  const [Data, setData] = useState<PatientFrequency[]>([]);
  const [action, setAction] = useState("");
  const [selected, setSelected] = React.useState<PatientFrequencyResponse>();

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: frequencyColumns,
    query: query,
    setQuery: setQuery,
    name: "patient-frequency",
    resetTableState: active,
    columnProps: {
      actionsCell: (row: Row<PatientFrequency>) => (
        <ActionsCell
          callback={(action) => {
            setAction(action);
            setSelected(row.original as PatientFrequencyResponse);
          }}
          activeTab={active}
        />
      ),
    },
  });

  React.useEffect(() => {
    const tableData =
      data?.data?.frequencies?.map((frequency) =>
        modifyDateFields({
          ...frequency,
          disciplineName: frequency?.discipline?.name,
          startDate: formatDate(frequency?.effectiveFrom as Date),
          endDate: formatDate(frequency?.effectiveThrough as Date),
        }),
      ) || [];
    setData(tableData);
  }, [data]);

  const closeModal = () => {
    onClose();
    onClose2();
    setAction("");
    setSelected(undefined);
  };

  React.useEffect(() => {
    if (archiveResponse?.success) {
      mutate();
      table.resetRowSelection();
      toast.success(`Success|${archiveResponse?.message}`);
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archiveResponse]);

  return (
    <div>
      <AppLoader loading={isLoading} />
      <Alert
        title={
          active === "archived" ? "Activate Frequency" : "Archive Frequency"
        }
        description={`Are you sure you want to ${active === "archived" ? "activate" : "archive"} this frequency?`}
        variant={active === "archived" ? "default" : "destructive"}
        open={action === "delete" || opened2}
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
      <FrequencyModal
        title="Frequency"
        open={opened || action === "edit"}
        modalClose={closeModal}
        refresh={() => {
          mutate();
        }}
        selected={selected}
        patientId={patientId}
      />
      <Shell className="!p-0 mt-4">
        <DataTable
          table={table}
          setQuery={setQuery}
          title={"Frequency"}
          tableKey={tableKey}
          columns={tableColumns}
          rawColumns={frequencyColumns}
          search={search}
          setSearch={setSearch}
          className="!h-[calc(100vh-60vh)] md:!h-[calc(100vh-40vh)]"
          extraToolbar={
            <>
              <Button
                type="button"
                onClick={onOpen}
                className="ml-auto h-8 lg:flex"
              >
                <PlusIcon size={"xs"} />
                Add Frequency
              </Button>

              {(table.getIsSomeRowsSelected() ||
                table.getIsAllRowsSelected()) && (
                <>
                  <Button
                    aria-label="Activate or Archive"
                    variant={active === "archived" ? "default" : "destructive"}
                    className="ml-auto h-8 lg:flex"
                    onClick={onOpen2}
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

export default Frequency;
