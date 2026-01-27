"use client";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useRouter } from "next-nprogress-bar";
import { useQueryState } from "nuqs";
import * as React from "react";
import toast from "react-hot-toast";
import generatePDF, { Options } from "react-to-pdf";
import { useReactToPrint } from "react-to-print";

import { ActionsCell } from "@/components/clinical/sn-note/action-button";
import PrintSNNote from "@/components/clinical/sn-note/print";
import { DataTable, Shell } from "@/components/data-table";
import CreateSNNotePrompt from "@/components/evv/modal/sn-note-prompt";
import PromptModal from "@/components/prompt-modal";
import { Alert, Button } from "@/components/ui";
import { initialQuery, skilledNursingNotesColumns } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useDisclosure, useGetPatient, useTable } from "@/hooks";
import {
  useArchiveorActivateSnNote,
  useGetSkilledNursingNote,
  useGetSkilledNursingNotes,
} from "@/hooks/request/clinical/sn-note";
import { delay, formatDate, getFullName } from "@/lib";
import { SkilledNursingNoteResponse } from "@/types";

type ParamType = {
  params: { patientId: string };
};

function SkilledNursingNote({ params: { patientId } }: ParamType) {
  const [active, setActive] = useQueryState("tab", { defaultValue: "active" });
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [selected, setSelected] = React.useState<SkilledNursingNoteResponse>();
  const { data, isLoading, mutate } = useGetSkilledNursingNotes({
    patientId,
    status: active,
  });
  const { data: snNoteData } = useGetSkilledNursingNote({
    skilledNursingNoteId: selected?.id,
  });
  const { data: patient, isLoading: isFetching } = useGetPatient({
    id: patientId,
  });
  const [query, setQuery] = React.useState(initialQuery);
  const [updateNoteType, setUpdateNoteType] = React.useState<string>("");
  const { opened, onOpen, onClose } = useDisclosure();
  const {
    opened: openedPrompt,
    onOpen: onOpenPrompt,
    onClose: onClosePrompt,
  } = useDisclosure();
  const {
    opened: openedArchive,
    onOpen: onOpenArchive,
    onClose: onCloseArchive,
  } = useDisclosure();
  const { authUser } = useAuth();
  const router = useRouter();
  const [Data, setData] = React.useState<SkilledNursingNoteResponse[]>([]);
  const { data: response, trigger, isMutating } = useArchiveorActivateSnNote();
  const componentRef = React.useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const options: Options = {
    overrides: {
      canvas: {
        onclone: (document: Document) => {
          const div = document.getElementById("print-box") as HTMLDivElement;
          div.style.display = "block";
        },
      },
    },
    filename: "Skilled Nursing Visit Note Summary",
  };

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: skilledNursingNotesColumns,
    query: query,
    setQuery: setQuery,
    name: "Skilled Nursing Visit Note Summary",
    columnProps: {
      selectable: true,
      actionsCell: (row) => (
        <ActionsCell
          callback={async (action) => {
            if (action === "view") {
              router.push(
                `/clinical/sn-note/${patientId}/create?skilledNursingNoteId=${row.original.id}&action=view${row.original.snNoteType === "poc" ? "&type=poc" : ""}`,
              );
              return;
            } else if (action === "edit") {
              router.push(
                `/clinical/sn-note/${patientId}/create?skilledNursingNoteId=${row.original.id}&action=edit${row.original.snNoteType === "poc" ? "&type=poc" : ""}`,
              );
              return;
            } else if (action === "delete") {
              onOpenArchive();
              setSelected(row.original);
            }
            await setSelected(row.original);
            await delay(1000);
            if (action === "print") {
              handlePrint();
            } else if (action === "print-pdf") {
              generatePDF(componentRef, options);
            }
          }}
          activeTab={active}
        />
      ),
    },
    resetTableState: active,
  });

  React.useEffect(() => {
    const tableData = (data?.data?.snNotes || [])?.map((item) => ({
      ...item,
      visitDate: formatDate(item.vitalSigns?.startTime),
      caregiverName: `${item.caregiver?.firstName} ${item.caregiver?.lastName}`,
      status:
        !item.qASignature?.status || item.qASignature?.status === "in-use"
          ? "In Use"
          : "Completed",
      nurseSigned: item.unscheduledVisit?.patientSignature ? "Yes" : "No",
      patientSigned: item.unscheduledVisit?.caregiverSignature ? "Yes" : "No",
      snap: item.snNoteType === "poc" ? "Yes" : "No",
    }));
    setData(tableData);
  }, [data]);

  React.useEffect(() => {
    if (updateNoteType) {
      if (updateNoteType === "poc") {
        router.push(`/clinical/sn-note/${patientId}/create?type=poc`);
      } else {
        router.push(`/clinical/sn-note/${patientId}/create`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateNoteType]);

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
          active === "active"
            ? "Archive Skilled Nursing Visit Note"
            : "Restore Skilled Nursing Visit Note"
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
      <PrintSNNote
        ref={componentRef}
        data={snNoteData?.data}
        qASignature={snNoteData?.data?.qASignature}
      />
      <PromptModal
        title="No POC Plus or 485"
        description="No Plan of Care Plus or 485 exists for this visit. Please follow procedure to notify the appropriate parties that a Plan of Care Plus or a 485 has not been completed. Are you sure you want to continue creating this SN Note?"
        variant="default"
        open={openedPrompt}
        onClose={onClosePrompt}
        callback={() => {
          onOpen();
          onClosePrompt();
        }}
      />
      <CreateSNNotePrompt
        open={opened}
        onClose={onClose}
        patientId={patientId as string}
        caregiverId={authUser?.id as string}
        setUpdateNoteType={setUpdateNoteType}
        updateNoteType={updateNoteType}
      />
      <DataTable
        table={table}
        tableKey={tableKey}
        title={"Skilled Nursing Visit Note"}
        subtitle={getFullName(
          patient?.data?.firstName,
          patient?.data?.lastName,
        )?.toUpperCase()}
        fetching={isLoading || isFetching}
        columns={tableColumns}
        setQuery={setQuery}
        rawColumns={skilledNursingNotesColumns}
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
            <Button type="button" onClick={onOpenPrompt} size="sm">
              <PlusIcon />
              Add Note
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
export default SkilledNursingNote;
