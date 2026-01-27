import { NoteIntervention, User } from "@prisma/client";
import { PlusIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { useQueryState } from "nuqs";
import * as React from "react";
import { PiWarningCircleFill } from "react-icons/pi";

import { DataTable, Shell } from "@/components/data-table";
import { Button } from "@/components/ui";
import { initialQuery, interventionSummaryColumns } from "@/constants";
import { useDisclosure, useTable } from "@/hooks";
import { formatDate, modifyDateFields } from "@/lib";
import { ActionType } from "@/types";

import { InterventionActionsCell } from "../action-button";
import { AddInterventionSummary } from "../modal";

function InterventionSummary({
  caregiver,
  unscheduledVisitId,
  skilledNursingNoteId,
  patientId,
  data,
  snNoteType,
  callback,
  disabled,
}: {
  patientId: string;
  unscheduledVisitId?: string;
  skilledNursingNoteId?: string;
  caregiver?: User;
  data: NoteIntervention[];
  snNoteType: string;
  callback: (skilledNursingNote?: string) => void;
  disabled?: boolean;
}) {
  const [action, setAction] = React.useState<ActionType>();
  const [selected, setSelected] = React.useState<NoteIntervention>();
  const { opened, onOpen, onClose } = useDisclosure();
  const [query, setQuery] = React.useState(initialQuery);
  const [Data, setData] = React.useState<NoteIntervention[]>([]);

  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: interventionSummaryColumns,
    query: query,
    setQuery: setQuery,
    name: "intervention",
    columnProps: {
      actionsCell: (row: Row<NoteIntervention>) => (
        <InterventionActionsCell
          callback={(action) => {
            setAction(action);
            setSelected(modifyDateFields(row.original));
          }}
        />
      ),
    },
  });

  React.useEffect(() => {
    const tableData =
      data?.map((intervention) => ({
        ...intervention,
        startDate: formatDate(intervention?.effectiveDate),
      })) || [];
    setData(tableData || []);
  }, [data]);

  const closeModal = () => {
    setAction(undefined);
    setSelected(undefined);
    onClose();
  };

  return (
    <Shell className="!p-0 mt-5">
      <AddInterventionSummary
        title="Save Intervention"
        open={opened || action === "edit"}
        modalClose={closeModal}
        unscheduledVisitId={unscheduledVisitId}
        skilledNursingNoteId={skilledNursingNoteId}
        selected={selected as NoteIntervention}
        refresh={(res) => {
          callback(res);
        }}
        caregiver={caregiver}
        patientId={patientId}
        snNoteType={snNoteType}
      />

      <div>
        <div className="bg-primary/20 flex text-sm py-5 px-4 items-center gap-3 my-2">
          <PiWarningCircleFill size={24} />
          <p>
            All ordered interventions from all body systems are included in this
            summary to allow you to review all tasks as indicated in the Plan of
            Care in a central location. You may edit any entries in this
            section, and the same information will be reflected in the
            corresponding body system interventions section.
          </p>
        </div>
        <Shell className="!p-0">
          <DataTable
            table={table}
            tableKey={tableKey}
            title="intervention"
            columns={tableColumns}
            setQuery={setQuery}
            rawColumns={interventionSummaryColumns}
            search={search}
            setSearch={setSearch}
            extraToolbar={
              <>
                <Button type="button" onClick={onOpen} disabled={disabled}>
                  <PlusIcon />
                  Add Intervention
                </Button>
              </>
            }
            className="!h-[calc(100vh-60vh)] md:!h-[calc(100vh-55vh)]"
          />
        </Shell>
      </div>
    </Shell>
  );
}

export default InterventionSummary;
