"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Patient, PatientStatus } from "@prisma/client";
import {
  ExitIcon,
  PlusCircledIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next-nprogress-bar";
import { useQueryState } from "nuqs";
import * as React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import { DataTable, Shell } from "@/components/data-table";
import {
  AdmitPatientModal,
  CreateMedication,
  CreatePatient,
  CreatePhysicianModal,
  DischargePatientModal,
  PatientActionsCell,
  PatientDetailsPage,
} from "@/components/patient";
import {
  Alert,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  Modal,
  SegmentedControl,
  TabsContent,
} from "@/components/ui";
import { initialQuery, patientColumns } from "@/constants";
import {
  useDisclosure,
  useGetPatients,
  usePopulateForm,
  useTable,
  useUpdatePatientStatus,
} from "@/hooks";
import { getSelected, modifyDateFields, prepareTableData } from "@/lib";
import {
  medicationDefaultValue,
  medicationFormSchema,
  patientDefaultValue,
  PatientForm,
  patientFormSchema,
  PatientMedicationForm,
} from "@/schema";
import { ActionType, PatientResponse } from "@/types";

export interface TableProps<T> {
  data: T[];
  totalCount: number;
}

function PatientView() {
  const [action, setAction] = React.useState<ActionType | "discharged">();
  const [selected, setSelected] = React.useState<PatientResponse>();
  const [active, setActive] = useQueryState("tab", {
    defaultValue: "referred",
  });
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const { opened, onOpen, onClose } = useDisclosure();
  const {
    opened: opened2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const {
    opened: opened3,
    onOpen: onOpen3,
    onClose: onClose3,
  } = useDisclosure();
  const [selectedMedication, setSelectedMedication] = React.useState<
    (PatientMedicationForm & { id: string }) | null
  >(null);
  const [formTab, setFormTab] = React.useState("general-information");
  const [patientId, setPatientId] = React.useState("");
  const {
    data,
    isLoading,
    mutate: refreshPatient,
  } = useGetPatients({ status: active as PatientStatus });
  const [query, setQuery] = React.useState(initialQuery);
  const router = useRouter();
  const {
    data: dischargeorArchivePatient,
    trigger,
    isMutating,
  } = useSWRMutation("/api/patient/admission", useUpdatePatientStatus);
  const [Data, setData] = React.useState<PatientResponse[]>([]);

  const componentRef = React.useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${selected?.firstName ? selected?.firstName + "-" : selected?.lastName ? selected?.lastName + "-" : ""}Profile-${Date.now()}`,
  });

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: patientColumns,
    query: query,
    setQuery: setQuery,
    name: "patients",
    resetTableState: active,
    columnProps: {
      actionsCell: (row: Row<PatientResponse>) => (
        <PatientActionsCell
          callback={(action) => {
            setAction(action);
            const selectedMedication = getSelected(
              (row.original as PatientResponse).patientMedication,
            );
            const reformData = modifyDateFields(row.original);
            setSelected(reformData);
            setPatientId(row.original.id);
            setSelectedMedication(selectedMedication);
          }}
          handlePrint={async () => {
            const reformData = modifyDateFields(row.original);
            await setSelected(reformData);
            handlePrint();
          }}
          activeTab={active}
        />
      ),
    },
  });

  const methods = useForm<PatientForm>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patientDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const medicationForm = useForm<PatientMedicationForm>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: medicationDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  usePopulateForm<PatientForm, Patient>(
    methods.reset,
    selected as PatientResponse,
  );
  usePopulateForm<PatientMedicationForm, PatientMedicationForm>(
    medicationForm.reset,
    selectedMedication as PatientMedicationForm & { id: string },
  );

  const closeModal = () => {
    setAction(undefined);
    setSelected(undefined);
    onClose2();
    onClose3();
    onClose();
    setFormTab("general-information");
    methods.reset(patientDefaultValue);
    medicationForm.reset(medicationDefaultValue);
    setPatientId("");
    mutate("/api/patient?status=REFERRED");
  };

  React.useEffect(() => {
    if (dischargeorArchivePatient?.success) {
      refreshPatient();
      table.resetRowSelection();
      toast.success(`Success|${dischargeorArchivePatient?.message}`);
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dischargeorArchivePatient]);

  React.useEffect(() => {
    const tableData = prepareTableData(data?.data?.patients || []);
    setData(tableData);
  }, [data]);

  return (
    <Shell>
      <Alert
        title={"Archive Patient"}
        description={`Are you sure you want to archive this patient?`}
        variant={"destructive"}
        open={action === "delete"}
        onClose={closeModal}
        callback={async () => {
          await trigger({
            patients: selected
              ? [selected.patientAdmission?.[0]?.id]
              : table
                  .getSelectedRowModel()
                  .rows.map((row) => row.original.patientAdmission?.[0]?.id),
            status: action === "delete" ? "archived" : (action as string),
          });
        }}
        loading={isMutating}
      />
      <Modal
        title={
          action === "edit"
            ? "Edit Patient"
            : action === "view"
              ? "Patient Details"
              : "Add Patient"
        }
        open={opened2 || action === "edit" || action === "view"}
        onClose={closeModal}
        className="md:max-w-[700px]"
      >
        <SegmentedControl
          data={[
            { value: "general-information", label: "General Information" },
            { value: "medication", label: "Medication" },
          ]}
          value={formTab}
          transparent
          className="mx-auto flex w-full mb-2"
          stretch
          onChange={setFormTab}
          disabled={opened2}
        >
          <TabsContent value="general-information">
            <CreatePatient
              refreshTable={refreshPatient}
              mode={action === "edit" || action === "view" ? action : "create"}
              selected={selected as PatientResponse}
              setPatientId={setPatientId}
              setTab={setFormTab}
              patientId={patientId}
              methods={methods}
            />
          </TabsContent>
          <TabsContent value="medication">
            <CreateMedication
              refreshTable={refreshPatient}
              onClose={closeModal}
              mode={action === "edit" || action === "view" ? action : "create"}
              selected={
                selectedMedication as PatientMedicationForm & { id: string }
              }
              patientId={patientId}
              setTab={setFormTab}
              methods={medicationForm}
            />
          </TabsContent>
        </SegmentedControl>
      </Modal>

      <PatientDetailsPage ref={componentRef} selected={selected} />

      <AdmitPatientModal
        title={"Select Patient from Referral Intake"}
        open={opened3}
        onClose={() => {
          refreshPatient();
          setAction(undefined);
          onClose3();
        }}
      />
      <CreatePhysicianModal
        mode={"create"}
        title={"Create Physician"}
        open={opened}
        modalClose={closeModal}
      />
      <DischargePatientModal
        open={action === "discharged"}
        modalClose={closeModal}
        trigger={trigger}
        selected={
          selected
            ? [selected.patientAdmission?.[0]?.id]
            : table
                .getSelectedRowModel()
                .rows.map((row) => row.original.patientAdmission?.[0]?.id)
        }
        loading={isMutating}
      />
      <DataTable
        table={table}
        tableKey={tableKey}
        title="patients"
        onRowClick={(row) =>
          active !== "referred" &&
          active !== "archived" &&
          router.push(`/patient/${row.id}`)
        }
        fetching={isLoading}
        columns={tableColumns}
        setQuery={setQuery}
        search={search}
        setSearch={setSearch}
        rawColumns={patientColumns}
        segmentedControl={{
          data: [
            { value: "referred", label: "Referred" },
            { value: "active", label: "Active" },
            { value: "discharged", label: "Discharged" },
            { value: "archived", label: "Archived" },
          ],
          value: active,
          onChange: setActive,
        }}
        extraToolbar={
          <>
            <Button
              aria-label="add referral"
              size="sm"
              className="ml-auto h-8 lg:flex"
              onClick={onOpen2}
            >
              <PlusIcon />
              Add Patient
            </Button>
            <Button
              aria-label="add referral"
              size="sm"
              className="ml-auto h-8 lg:flex"
              onClick={onOpen}
            >
              <PlusIcon />
              Create Physician
            </Button>
            <Button
              aria-label="add referral"
              size="sm"
              className="ml-auto h-8 lg:flex"
              onClick={onOpen3}
            >
              <PlusCircledIcon />
              Admit Patient
            </Button>

            {(table.getIsSomeRowsSelected() ||
              table.getIsAllRowsSelected()) && (
              <>
                {active === "active" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label="add user group"
                        variant="default"
                        size="sm"
                        className="ml-auto h-8 lg:flex capitalize"
                      >
                        Bulk Action{" "}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[150px]">
                      <DropdownMenuItem onClick={() => setAction("discharged")}>
                        <div className="flex items-center gap-2">
                          <DropdownMenuShortcut>
                            <ExitIcon className="size-4" />
                          </DropdownMenuShortcut>
                          Discharge
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setAction("delete")}>
                        <div className="flex items-center gap-2">
                          <DropdownMenuShortcut>
                            <TrashIcon />
                          </DropdownMenuShortcut>
                          Archive
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {active !== "archived" && active !== "active" && (
                  <Button
                    aria-label="Activate or Archive"
                    variant={"destructive"}
                    size="sm"
                    className="ml-auto h-8 lg:flex"
                    onClick={() => setAction("delete")}
                  >
                    <TrashIcon className=" size-4" />
                    Archive{" "}
                  </Button>
                )}
              </>
            )}
          </>
        }
      />
    </Shell>
  );
}
export default PatientView;
