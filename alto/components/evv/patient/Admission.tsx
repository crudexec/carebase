import { zodResolver } from "@hookform/resolvers/zod";
import { Patient, PatientStatus, Physician } from "@prisma/client";
import { Row } from "@tanstack/react-table";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import AppLoader from "@/components/app-loader";
import { DataTable, Shell } from "@/components/data-table";
import FormHeader from "@/components/form-header";
import { CreatePhysicianModal } from "@/components/patient";
import {
  Alert,
  Button,
  Checkbox,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  RadioInput,
  SelectInput,
} from "@/components/ui";
import {
  admissionSource,
  CBSACode,
  dischargeReasons,
  infectionTypes,
  initialQuery,
  insuranceColumns,
  referralSources,
  yesNoOptions,
} from "@/constants";
import {
  useArchiveInsurance,
  useDisclosure,
  useGetInsurances,
  useGetProviders,
  useGetUsers,
  usePopulateForm,
  useTable,
  useUpdateAdmission,
} from "@/hooks";
import { formatDate, getFullName, modifyDateFields, pickValues } from "@/lib";
import {
  admissionDefaultValue,
  AdmissionForm,
  admissionSchema,
  insuranceDefaultValue,
} from "@/schema";
import {
  ApiResponse,
  PatientInsuranceResponse,
  PatientResponse,
} from "@/types";

import ActionsCell from "../action-button/insurance";
import { InsuranceModal, PriorAuthorizationModal } from "../modal";

const Admission = ({
  data,
  mutate: refresh,
}: {
  data?: PatientResponse & { admissionId?: string };
  mutate: () => void;
}) => {
  const { data: providers, isLoading: loading } = useGetProviders();
  const [active, setActive] = useQueryState("tab", { defaultValue: "active" });
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const { data: caregivers } = useGetUsers({ tab: "caregiver" });

  const { opened, onOpen, onClose } = useDisclosure();
  const {
    opened: opened2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const {
    data: updatePatient,
    trigger,
    isMutating,
  } = useSWRMutation(`/api/patient/${data?.id}`, useUpdateAdmission);
  const { data: meta, mutate: refreshMeta } =
    useSWR<ApiResponse<Physician[]>>(`/api/physician`);
  const {
    data: insurances,
    isLoading,
    mutate,
  } = useGetInsurances({ id: data?.id as string, status: active });
  const [Data, setData] = useState<PatientInsuranceResponse[]>([]);
  const [action, setAction] = useState("");
  const [selected, setSelected] = React.useState<PatientInsuranceResponse>();
  const {
    data: archiveResponse,
    isMutating: mutating,
    trigger: archiveInsurance,
  } = useArchiveInsurance();
  const [query, setQuery] = React.useState(initialQuery);

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: insuranceColumns,
    query: query,
    setQuery: setQuery,
    name: "patient-insurance",
    resetTableState: active,
    columnProps: {
      actionsCell: (row: Row<PatientInsuranceResponse>) => (
        <ActionsCell
          callback={(action) => {
            setAction(action);
            const selected = {
              ...row.original,
              relatedCaregiver: row.original.relatedCaregiver.length
                ? row.original.relatedCaregiver.map((item) => ({ ...item }))
                : insuranceDefaultValue.relatedCaregiver,
            };
            setSelected(selected as PatientInsuranceResponse);
          }}
          activeTab={active}
        />
      ),
    },
  });

  const methods = useForm<AdmissionForm>({
    resolver: zodResolver(admissionSchema),
    defaultValues: admissionDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  React.useEffect(() => {
    const tableData =
      insurances?.data?.insurances?.map((insurance) =>
        modifyDateFields({
          ...insurance,
          payerName: insurance?.payer?.name,
          startDate: formatDate(insurance?.effectiveFrom as Date),
          endDate: formatDate(insurance?.effectiveThrough as Date),
        }),
      ) || [];
    setData(tableData || []);
  }, [insurances]);

  usePopulateForm<AdmissionForm, Patient>(methods.reset, data);

  useEffect(() => {
    if (updatePatient?.success) {
      refresh();
      toast.success("Patient updated successfully");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePatient]);

  const modalClose = () => {
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
      modalClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archiveResponse]);

  return (
    <div className="flex flex-col gap-5">
      <Alert
        title={
          active === "archived" ? "Activate Insurance" : "Archive Insurance"
        }
        description={`Are you sure you want to ${active === "archived" ? "activate" : "archive"} this insurance?`}
        variant={active === "archived" ? "default" : "destructive"}
        open={action === "delete" || opened2}
        onClose={modalClose}
        callback={async () => {
          await archiveInsurance({
            ids: selected
              ? [selected.id]
              : table.getSelectedRowModel().rows.map((row) => row.original.id),
            status: active === "archived" ? "archived" : "active",
          });
        }}
        loading={mutating}
      />

      <CreatePhysicianModal
        mode={"create"}
        title={"Create Physician"}
        open={action === "create-physician"}
        modalClose={() => {
          refreshMeta();
          setAction("");
        }}
      />
      <AppLoader loading={isLoading} />
      <InsuranceModal
        title="Insurance"
        open={opened || action === "edit"}
        modalClose={modalClose}
        refresh={() => {
          mutate();
        }}
        patient={data}
        selected={selected}
      />

      <PriorAuthorizationModal
        title="Prior Authorization"
        open={action === "authorization"}
        modalClose={modalClose}
        patient={data}
        patientInsuranceId={selected?.id}
      />

      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(async (formData) => {
            const {
              admitDate: _admitDate,
              dischargeDate: _dischargdDate,
              ...rest
            } = formData;
            await trigger({
              ...pickValues({ ...rest, admissionId: data?.admissionId }),
              reason: formData?.reason,
              otherReason: formData?.otherReason,
            });
          })}
        >
          <div>
            <FormHeader className="mt-4"> Admission</FormHeader>
            <div className="flex justify-end text-end my-2">
              <Button loading={isMutating} disabled={loading || isMutating}>
                Save Changes
              </Button>
            </div>

            <div className="grid grid-col-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <FormField
                  control={methods.control}
                  name={"status"}
                  render={({ field }) => {
                    return (
                      <FormRender label={"Admission Status"}>
                        <RadioInput
                          className="grid md:grid-cols-3 gap-5 items-center"
                          {...field}
                          options={[
                            { value: PatientStatus.ACTIVE, label: "Admitted" },
                            {
                              value: PatientStatus.DISCHARGED,
                              label: "Discharged",
                            },
                            {
                              value: PatientStatus.REFERRED,
                              label: "Not Admitted",
                            },
                          ]}
                        />
                      </FormRender>
                    );
                  }}
                />
              </div>
              <FormField
                control={methods.control}
                name={"admitDate"}
                render={({ field }) => (
                  <FormRender label={"Admit Date"}>
                    <DateInput
                      {...field}
                      value={
                        methods.watch("status") === PatientStatus.ACTIVE
                          ? (field.value as Date)
                          : undefined
                      }
                      disabled={true}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"pan"}
                render={({ field }) => (
                  <FormRender label={"Patient Account Number (PAN)"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"providerId"}
                render={({ field }) => (
                  <FormRender label={"Office"}>
                    <SelectInput
                      options={providers?.data?.providers?.map((provider) => ({
                        label: provider.providerName as string,
                        value: provider.id,
                      }))}
                      field={field}
                      loading={loading}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"county"}
                render={({ field }) => (
                  <FormRender label={"County/CBSA"}>
                    <SelectInput
                      options={CBSACode}
                      field={field}
                      loading={loading}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"physicianId"}
                render={({ field }) => (
                  <FormRender label={"Physician"}>
                    <SelectInput
                      options={[
                        ...(meta?.data?.map((item) => ({
                          value: item.id as string,
                          label: getFullName(
                            item?.lastName,
                            item?.firstName,
                            "Name not available",
                          ),
                        })) ?? []),
                        {
                          value: "create-physician",
                          label: "+ Create new physician",
                        },
                      ]}
                      field={{
                        ...field,
                        onChange: (value) => {
                          if (value === "create-physician") {
                            setAction("create-physician");
                          } else {
                            field.onChange(value);
                          }
                        },
                      }}
                      placeholder="Select Physician"
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"caregiverId"}
                render={({ field }) => (
                  <FormRender label={"Case Manager/Primary RN"}>
                    <SelectInput
                      options={
                        caregivers?.data?.users?.map((caregiver) => ({
                          label: `${caregiver.firstName} ${caregiver.lastName}`,
                          value: caregiver.id,
                        })) || []
                      }
                      field={field}
                      loading={loading}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"admissionSource"}
                render={({ field }) => (
                  <FormRender label={"Source of Admission"}>
                    <SelectInput
                      options={admissionSource}
                      field={field}
                      loading={loading}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"referralSource"}
                render={({ field }) => (
                  <FormRender label={"Referral Source"}>
                    <SelectInput
                      options={referralSources}
                      field={field}
                      loading={loading}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"transferredFrom"}
                render={({ field }) => (
                  <FormRender>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">
                        Transferred from another Home Health Agency
                      </span>
                    </div>
                  </FormRender>
                )}
              />
              <div>
                <FormField
                  control={methods.control}
                  name={"dnr"}
                  render={({ field }) => (
                    <FormRender label={"DNR"}>
                      <RadioInput
                        className="grid grid-cols-3 gap-5 items-center"
                        {...field}
                        options={[
                          { value: "YES", label: "Yes" },
                          { value: "NO", label: "No" },
                        ]}
                      />
                    </FormRender>
                  )}
                />
              </div>
              <FormField
                control={methods.control}
                name={"infectionControl"}
                render={({ field }) => (
                  <FormRender label={"Infection Control"}>
                    <SelectInput
                      options={infectionTypes}
                      field={field}
                      loading={loading}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"admitInfection"}
                render={({ field }) => (
                  <FormRender label={"Infection on Admit"}>
                    <SelectInput
                      options={yesNoOptions}
                      field={field}
                      loading={loading}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"dischargeDate"}
                render={({ field }) => (
                  <FormRender label={"Discharge Date"}>
                    <DateInput
                      {...field}
                      value={
                        methods.watch("status") === PatientStatus.DISCHARGED
                          ? (field.value as Date)
                          : undefined
                      }
                      disabled={true}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"reason"}
                render={({ field }) => (
                  <FormRender label={"Discharge Code"}>
                    <SelectInput
                      options={dischargeReasons}
                      field={field}
                      loading={loading}
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"otherReason"}
                render={({ field }) => (
                  <FormRender label={"Other Reason"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      placeholder="Enter other discharge reasons"
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>
          <div className="flex justify-end text-end my-2">
            <Button loading={isMutating} disabled={loading || isMutating}>
              Save Changes
            </Button>
          </div>
        </form>
      </Form>

      <div className="border-b border-dashed" />
      <Shell className="!p-0">
        <DataTable
          table={table}
          title={"Insurance & Prior Auth"}
          tableKey={tableKey}
          columns={tableColumns}
          rawColumns={insuranceColumns}
          setQuery={setQuery}
          search={search}
          setSearch={setSearch}
          className="!h-[calc(100vh-60vh)] md:!h-[calc(100vh-55vh)]"
          extraToolbar={
            <>
              <Button
                type="button"
                onClick={onOpen}
                className="ml-auto h-8 lg:flex"
              >
                <PlusIcon size={"xs"} />
                Add Insurance
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
            value: active || "active",
            onChange: setActive,
          }}
        />
      </Shell>
    </div>
  );
};

export default Admission;
