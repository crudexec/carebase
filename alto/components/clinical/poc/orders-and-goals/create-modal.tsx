import { zodResolver } from "@hookform/resolvers/zod";
import { OrdersAndGoals } from "@prisma/client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Flex from "@/components/flex";
import PhraseHelperText from "@/components/phrase-helper";
import {
  Button,
  Checkbox,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  Modal,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { bodySystemOptions } from "@/constants";
import {
  useCreateOrdersAndGoals,
  useGetDisciplines,
  usePopulateForm,
  useUpdateOrdersAndGoals,
} from "@/hooks";
import {
  ordersAndGoalsDefaultValue,
  OrdersAndGoalsForm,
  ordersAndGoalsSchema,
} from "@/schema";

const OrdersAndGoalsModal = ({
  title,
  open,
  modalClose,
  refresh,
  selected,
  patientId,
  caregiverId,
  disabled,
  callback,
  planOfCareId,
}: {
  title: string;
  open: boolean;
  modalClose: () => void;
  refresh: () => void;
  selected?: OrdersAndGoals;
  patientId?: string;
  caregiverId?: string;
  disabled: boolean;
  callback: (planOfCare?: string) => void;
  planOfCareId: string;
}) => {
  const methods = useForm<OrdersAndGoalsForm>({
    resolver: zodResolver(ordersAndGoalsSchema),
    defaultValues: ordersAndGoalsDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { data, trigger, isMutating } = useCreateOrdersAndGoals();
  const {
    data: updateResponse,
    trigger: updateFrequency,
    isMutating: isUpdating,
  } = useUpdateOrdersAndGoals();
  const { data: disciplines } = useGetDisciplines();

  const closeModal = () => {
    modalClose();
    methods.reset(ordersAndGoalsDefaultValue);
  };

  useEffect(() => {
    if (data?.success || updateResponse?.success) {
      if (!selected?.id && data?.success) {
        callback(data?.data?.id);
        toast.success("Orders and goals created successfully");
      } else {
        toast.success("Orders and Goals updated successfully");
      }
      closeModal();
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, updateResponse]);

  usePopulateForm<OrdersAndGoalsForm, OrdersAndGoals>(methods.reset, selected);

  return (
    <Modal
      title={title}
      open={open}
      onClose={() => {
        closeModal();
      }}
      // className="xl:max-w-[30%]"
    >
      <Form {...methods}>
        <form
          className="max-h-[670px] overflow-auto flex flex-col gap-5 scrollbar-hide px-1"
          onSubmit={methods.handleSubmit(async (formData) => {
            if (selected?.id) {
              await updateFrequency({ ...formData, id: selected?.id });
            } else {
              await trigger({
                ...formData,
                patientId,
                caregiverId,
                planOfCareId,
              });
            }
          })}
        >
          <FormField
            control={methods.control}
            name={"disciplineId"}
            render={({ field }) => (
              <FormRender label={"Discipline Type"}>
                <SelectInput
                  disabled={disabled}
                  options={
                    disciplines?.data?.map((discipline) => ({
                      label: discipline.name,
                      value: discipline.id,
                    })) || []
                  }
                  field={field}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"bodySystem"}
            render={({ field }) => (
              <FormRender label={"Section/Body System"}>
                <SelectInput
                  options={bodySystemOptions}
                  field={field}
                  disabled={disabled}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"effectiveDate"}
            render={({ field }) => (
              <FormRender label={"Effective Date"}>
                <DateInput
                  {...field}
                  value={field.value as Date}
                  disabled={disabled}
                />
              </FormRender>
            )}
          />
          <div>
            <FormField
              control={methods.control}
              name={"orders"}
              render={({ field }) => (
                <FormRender label="Orders">
                  <Textarea
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
            {!disabled && (
              <PhraseHelperText
                formData={{
                  section: "orders",
                  description: methods.watch("orders") ?? "",
                }}
                callback={(text) => {
                  methods.setValue(
                    "orders",
                    `${methods.watch("orders") ?? ""} ${text}`,
                  );
                }}
              />
            )}
          </div>
          <FormField
            control={methods.control}
            name={"isFrequencyOrder"}
            render={({ field }) => (
              <FormRender>
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                  <span className="text-sm">This is a frequency order</span>
                </div>
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"orderexplanation"}
            render={({ field }) => (
              <FormRender label="Explanation for patient">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={disabled}
                />
              </FormRender>
            )}
          />
          <div>
            <FormField
              control={methods.control}
              name={"goals"}
              render={({ field }) => (
                <FormRender label="Goals">
                  <Textarea
                    {...field}
                    value={field.value as string}
                    disabled={disabled}
                  />
                </FormRender>
              )}
            />
            {!disabled && (
              <PhraseHelperText
                formData={{
                  section: "goals",
                  description: methods.watch("goals") ?? "",
                }}
                callback={(text) => {
                  methods.setValue(
                    "goals",
                    `${methods.watch("goals") ?? ""} ${text}`,
                  );
                }}
              />
            )}
          </div>
          <FormField
            control={methods.control}
            name={"goalsExplanation"}
            render={({ field }) => (
              <FormRender label="Explanation for patient">
                <Input
                  {...field}
                  value={field.value as string}
                  disabled={disabled}
                />
              </FormRender>
            )}
          />
          <Flex className="flex-wrap gap-x-4">
            <FormField
              control={methods.control}
              name={"goalsMet"}
              render={({ field }) => (
                <FormRender>
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">Goals Met</span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"goalsOngoing"}
              render={({ field }) => (
                <FormRender>
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">Ongoing/Goals not met</span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"discontinue"}
              render={({ field }) => (
                <FormRender>
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                    <span className="text-sm">Discontinue</span>
                  </div>
                </FormRender>
              )}
            />
          </Flex>
          <FormField
            control={methods.control}
            name={"goalsMetDate"}
            render={({ field }) => (
              <FormRender label={"Goals Met/Ended Date"}>
                <DateInput
                  {...field}
                  value={field.value as Date}
                  disabled={disabled || !methods.watch("goalsMet")}
                />
              </FormRender>
            )}
          />
          {!disabled && (
            <Button type="submit" loading={isMutating || isUpdating}>
              Submit
            </Button>
          )}
        </form>
      </Form>
    </Modal>
  );
};

export default OrdersAndGoalsModal;
