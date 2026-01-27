"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  OrdersAndGoals as OrdersAndGoalsClient,
  PlanOfCare as PlanOfCare,
  User,
} from "@prisma/client";
import { TrashIcon } from "@radix-ui/react-icons";
import { PlusIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import AppLoader from "@/components/app-loader";
import { DataTable, Shell } from "@/components/data-table";
import FormHeader from "@/components/form-header";
import {
  Alert,
  Button,
  Form,
  FormField,
  FormRender,
  Textarea,
} from "@/components/ui";
import { initialQuery, OrdersAndGoalsColumns } from "@/constants";
import {
  useArchiveorActivateOrdersAndGoals,
  useDisclosure,
  useGetOrdersAndGoals,
  usePopulateForm,
  useQueryParams,
  useSavePlanOfCare,
  useTable,
} from "@/hooks";
import { formatDate, modifyDateFields } from "@/lib";
import {
  planOfCareDefaultValue,
  PlanOfCareForm,
  planOfCareSchema,
} from "@/schema";
import { PlanOfCareResponse } from "@/types";

import { ActionsCell } from "./action-button";
import OrdersAndGoalsModal from "./create-modal";

const OrdersAndGoals = ({
  caregiver,
  patientId,
  callback,
  disabled,
  data: planOfCareData,
}: {
  patientId: string;
  callback: (planOfCare?: string) => void;
  caregiver?: User;
  disabled?: boolean;
  data?: PlanOfCareResponse;
}) => {
  const [active, setActive] = useQueryParams("orderTab", {
    defaultValue: "active",
  });
  const [search, setSearch] = useQueryParams("search", { defaultValue: "" });
  const [Data, setData] = useState<OrdersAndGoalsClient[]>([]);
  const [action, setAction] = useState("");
  const [selected, setSelected] = React.useState<OrdersAndGoalsClient>();
  const [query, setQuery] = React.useState(initialQuery);
  const { opened, onOpen, onClose } = useDisclosure();

  const { data, isLoading, mutate } = useGetOrdersAndGoals({
    planOfCareId: planOfCareData?.id as string,
    status: active,
  });
  const {
    data: archiveResponse,
    isMutating,
    trigger: archiveOrderandGoal,
  } = useArchiveorActivateOrdersAndGoals();
  const {
    data: response,
    trigger,
    isMutating: isCreating,
  } = useSavePlanOfCare();

  const { table, tableColumns, tableKey } = useTable({
    data: Data,
    columns: OrdersAndGoalsColumns,
    query: query,
    setQuery: setQuery,
    name: "orders-and-goals",
    resetTableState: active,
    columnProps: {
      actionsCell: (row) => (
        <ActionsCell
          callback={(action) => {
            setAction(action);
            setSelected(row.original);
          }}
          activeTab={active}
        />
      ),
    },
  });

  React.useEffect(() => {
    const tableData =
      data?.data?.ordersAndGoals?.map((item) =>
        modifyDateFields({
          ...item,
          disciplineType: item.discipline?.name,
          orderInformation: item.orders,
          dateEffective: formatDate(item.effectiveDate),
          associatedGoals: item.goals,
          bodySystem: item.bodySystem,
          goalsAndDate: item.goalsMet
            ? `Yes/${item.goalsMetDate ? formatDate(item.goalsMetDate) : "N/A"}`
            : "No",
        }),
      ) || [];
    setData(tableData);
  }, [data]);

  const closeModal = () => {
    setAction("");
    onClose();
    setSelected(undefined);
  };

  const methods = useForm<PlanOfCareForm>({
    resolver: zodResolver(planOfCareSchema),
    defaultValues: planOfCareDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  useEffect(() => {
    if (response?.success) {
      toast.success("Data saved successfully!");
      callback(response?.data?.id);
    } else if (archiveResponse?.success) {
      mutate();
      table.resetRowSelection();
      toast.success(`Success|${archiveResponse?.message}`);
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, archiveResponse]);

  const planOfCare = useMemo(() => {
    return modifyDateFields({ ...planOfCareData } as PlanOfCare);
  }, [planOfCareData]);

  usePopulateForm<PlanOfCareForm, PlanOfCare>(methods.reset, planOfCare);

  return (
    <div>
      <Alert
        title={
          active === "archived"
            ? "Activate Order & goal"
            : "Archive Order & goal"
        }
        description={`Are you sure you want to ${active === "archived" ? "activate" : "archive"} this order & goal?`}
        variant={active === "archived" ? "default" : "destructive"}
        open={action === "delete"}
        onClose={closeModal}
        callback={async () => {
          await archiveOrderandGoal({
            ids: selected
              ? [selected.id]
              : table.getSelectedRowModel().rows.map((row) => row.original.id),
            status: active === "archived" ? "archived" : "active",
          });
        }}
        loading={isMutating}
      />
      <AppLoader loading={isLoading} />
      <FormHeader className="mt-4">Orders & Goals</FormHeader>
      <OrdersAndGoalsModal
        title="Orders & Goals"
        open={opened || action === "edit" || action === "view"}
        modalClose={closeModal}
        refresh={() => {
          mutate();
        }}
        disabled={action === "view"}
        selected={selected}
        patientId={patientId}
        caregiverId={caregiver?.id}
        planOfCareId={planOfCare?.id}
        callback={(id) => callback(id)}
      />
      <Shell className="!p-0 mt-4">
        <DataTable
          table={table}
          setQuery={setQuery}
          tableKey={tableKey}
          columns={tableColumns}
          rawColumns={OrdersAndGoalsColumns}
          search={search}
          setSearch={setSearch}
          className={`!h-[calc(100vh-60vh)] ${Data?.length ? "md:!h-[calc(100vh-40vh)]" : "md:!h-[calc(100vh-60vh)]"}}`}
          extraToolbar={
            <>
              <Button
                type="button"
                onClick={onOpen}
                className="ml-auto h-8 lg:flex"
                disabled={disabled}
              >
                <PlusIcon size={"xs"} />
                Add
              </Button>

              {(table.getIsSomeRowsSelected() ||
                table.getIsAllRowsSelected()) && (
                <>
                  <Button
                    aria-label="Activate or Archive"
                    variant={active === "archived" ? "default" : "destructive"}
                    className="ml-auto h-8 lg:flex"
                    onClick={() => setAction("delete")}
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
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(async (formData) => {
            await trigger({
              ...formData,
              id: planOfCare?.id as string,
              caregiverId: caregiver?.id,
              patientId,
            });
          })}
        >
          <div>
            <FormHeader className="mt-4">
              Patient Stated Goals / Strengths and Weaknesses / Care Preferences
            </FormHeader>
            <FormField
              control={methods.control}
              name={"carePreferences"}
              render={({ field }) => (
                <FormRender>
                  <Textarea
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                    rows={20}
                  />
                </FormRender>
              )}
            />
          </div>

          <div className="flex justify-end text-end my-2">
            <Button
              className="px-6"
              loading={isCreating}
              disabled={disabled || isCreating}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export { OrdersAndGoals };
