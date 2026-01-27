import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  Modal,
  RadioInput,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { frequencyOptions } from "@/constants";
import { useAddPriorAuthorizationRecurrence, useGetDisciplines } from "@/hooks";
import { getRecurringDates, pickValues, resetTime } from "@/lib";
import {
  priorAuthorizationSchema,
  recurrenceDefaultValue,
  RecurrenceForm,
  recurrenceSchema,
} from "@/schema";

const AddRecurrence = ({
  title,
  open,
  modalClose,
  mutate,
  patientInsuranceId,
}: {
  title: string;
  open: boolean;
  modalClose: () => void;
  mutate: () => void;
  patientInsuranceId?: string;
}) => {
  const { data: disciplines } = useGetDisciplines();
  const methods = useForm<RecurrenceForm>({
    resolver: zodResolver(recurrenceSchema),
    defaultValues: recurrenceDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { data, trigger, isMutating } = useAddPriorAuthorizationRecurrence();

  useEffect(() => {
    if (data?.success) {
      toast.success(`Success|${data?.message}`);
      modalClose();
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Modal
      title={title}
      open={open}
      onClose={modalClose}
      className="md:max-w-[700px] sm:max-w-full"
    >
      <Form {...methods}>
        <form
          className="h-[75vh] overflow-auto flex flex-col gap-5 scrollbar-hide px-1"
          onSubmit={methods.handleSubmit(async (data) => {
            const filteredData = { ...data, patientInsuranceId };
            const dates = getRecurringDates({
              ...data,
              isEveryday: data?.pattern === "DAILY",
              weekFrequency: data?.dayFrequency,
              dayMonthFrequency: data?.dayFrequency,
              yearFrequency: data?.dayFrequency,
            });
            await trigger(
              pickValues({
                ...priorAuthorizationSchema.parse(filteredData),
                dates: dates.map((date) => resetTime(date)),
              }),
            );
          })}
        >
          <p className="p-4 border border-l-[4px] border-l-primary rounded">
            If you need to add multiple prior authorization entries following a
            pattern for the same discipline, you may use this option to
            automatically create multiple prior authorization entries.
          </p>

          <div>
            <FormHeader className="mt-4"> Recurrence Pattern</FormHeader>

            <div className="grid grid-col-1 md:grid-cols-2 gap-5">
              <FormField
                control={methods.control}
                name={"pattern"}
                render={({ field }) => (
                  <FormRender formClassName="md:col-span-2">
                    <RadioInput
                      className="flex !flex-row items-center gap-5"
                      {...field}
                      options={frequencyOptions}
                    />
                  </FormRender>
                )}
              />

              <FormField
                control={methods.control}
                name={"dayFrequency"}
                render={({ field }) => (
                  <FormRender label={"Recur Every"}>
                    <div className="flex gap-3 items-center">
                      <div className="flex-1">
                        <Input {...field} value={field.value as string} />
                      </div>
                      <p className="text-sm lowercase">
                        {methods.watch("pattern") === "DAILY"
                          ? "Day"
                          : methods.watch("pattern")?.slice(0, -2)}
                        (s)
                      </p>
                    </div>
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"disciplineId"}
                render={({ field }) => (
                  <FormRender label={"Discipline"}>
                    <SelectInput
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
                name={"authCode"}
                render={({ field }) => (
                  <FormRender label={"Authorization Code"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"visitAuth"}
                render={({ field }) => (
                  <FormRender label={"Visits Auth"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"hoursAuth"}
                render={({ field }) => (
                  <FormRender label={"AHours Auth (HH.MM)"}>
                    <Input {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"units"}
                render={({ field }) => (
                  <FormRender label={"Units"}>
                    <Input
                      {...field}
                      value={field.value as string}
                      type="number"
                    />
                  </FormRender>
                )}
              />
              <FormField
                control={methods.control}
                name={"notes"}
                render={({ field }) => (
                  <FormRender label={"Notes:"} formClassName="md:col-span-2">
                    <Textarea {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <FormHeader> Range of Recurrence</FormHeader>

            <div className="grid grid-col-1 gap-5">
              <FormField
                control={methods.control}
                name={"startDate"}
                render={({ field }) => (
                  <FormRender label={"Start"}>
                    <DateInput {...field} value={field.value as Date} />
                  </FormRender>
                )}
              />

              <div className="flex items-center gap-5">
                <FormField
                  control={methods.control}
                  name={"endAfter"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(value) => {
                            field.onChange(value);
                            methods.resetField("endBy");
                          }}
                        />
                        <span className="text-sm">End After</span>
                      </div>
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"occurence"}
                  render={({ field }) => (
                    <FormRender formClassName="flex-1">
                      <Input
                        {...field}
                        value={field.value as string}
                        type="number"
                        disabled={!methods.watch("endAfter")}
                      />
                    </FormRender>
                  )}
                />
                <p className="text-sm font-medium">occurrence(s)</p>
              </div>

              <div className="flex items-center gap-5">
                <FormField
                  control={methods.control}
                  name={"endBy"}
                  render={({ field }) => (
                    <FormRender>
                      <div className="flex gap-2 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(value) => {
                            field.onChange(value);
                            methods.resetField("endAfter");
                          }}
                        />
                        <span className="text-sm">End By</span>
                      </div>
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"endDate"}
                  render={({ field }) => (
                    <FormRender formClassName="flex-1">
                      <DateInput
                        {...field}
                        value={field.value as Date}
                        disabled={!methods.watch("endBy")}
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
          </div>

          <Button loading={isMutating} disabled={isMutating}>
            Submit
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default AddRecurrence;
