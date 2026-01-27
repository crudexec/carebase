import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";

import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  DateInput,
  Form,
  FormField,
  FormRender,
  Input,
  RadioInput,
  SelectInput,
} from "@/components/ui";
import {
  dayPeriods,
  extendedDayOptions,
  months,
  RecurringDayOptions,
} from "@/constants";
import { useCreateRecurrence } from "@/hooks";
import { cn, getRecurringDates, pickValues, resetTime } from "@/lib";
import { scheduleRecurrenceSchema } from "@/schema";
import { FormReturn, ISetState, PatientScheduleResponse } from "@/types";

type formType = FormReturn<typeof scheduleRecurrenceSchema>;
const RecurrenceModal = ({
  refreshTable,
  onClose,
  setTab,
  methods,
  schedule,
}: {
  refreshTable: () => void;
  onClose: () => void;
  schedule?: PatientScheduleResponse;
  setTab: ISetState<string>;
  methods: formType;
}) => {
  const { data, trigger, isMutating } = useCreateRecurrence();

  const modalClose = () => {
    onClose();
  };

  useEffect(() => {
    if (data?.success) {
      refreshTable();
      toast.success(`Success|${data?.message}`);
      modalClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Form {...methods}>
      <form
        className="h-[670px] overflow-auto flex flex-col gap-5 p-2 scrollbar-hide"
        onSubmit={methods.handleSubmit(async (data) => {
          const filteredData = {
            ...data,
            scheduleId: schedule?.id as string,
          };
          if (!schedule?.scheduleRecurrence?.id) {
            let dates: Date[] = [];
            if (data?.isRecurringEvent) {
              dates = getRecurringDates(data);
            }
            await trigger(
              pickValues({
                ...filteredData,
                dates: dates.map((date) => resetTime(date)),
              }),
            );
          }
        })}
      >
        <FormField
          control={methods.control}
          name={"isRecurringEvent"}
          render={({ field }) => (
            <FormRender>
              <div className="flex gap-2 items-center">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!!schedule?.scheduleRecurrence?.id}
                />
                <span className="text-sm">
                  This is the Recurring Appointment
                </span>
              </div>
            </FormRender>
          )}
        />

        <div>
          <FormHeader className="mt-4">Recurrence Pattern</FormHeader>
          <div className="flex flex-col md:flex-row items-start gap-5">
            <div className="border-2 border-dashed p-4 rounded w-full md:w-auto">
              <FormField
                control={methods.control}
                name={"pattern"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="gap-5 items-start"
                      {...field}
                      options={[
                        { value: "DAILY", label: "Daily" },
                        { value: "WEEKLY", label: "Weekly" },
                        { value: "MONTHLY", label: "Monthly" },
                        { value: "YEARLY", label: "Yearly" },
                      ]}
                      disabled={!!schedule?.scheduleRecurrence?.id}
                    />
                  </FormRender>
                )}
              />
            </div>

            {methods.watch("pattern") === "DAILY" && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-7">
                  <div className="flex items-center gap-2">
                    <FormField
                      control={methods.control}
                      name={"isEveryday"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(value) => {
                                field.onChange(value);
                                if (value) {
                                  methods.setValue("isEveryWeekday", false);
                                }
                              }}
                              disabled={!!schedule?.scheduleRecurrence?.id}
                            />
                            <span className="text-sm">Every</span>
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={methods.control}
                      name={"dayFrequency"}
                      render={({ field }) => (
                        <FormRender>
                          <Input
                            type="number"
                            rightSection={<p className="text-sm">day(s)</p>}
                            {...field}
                            value={field.value as string}
                          />
                        </FormRender>
                      )}
                      disabled={!!schedule?.scheduleRecurrence?.id}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FormField
                    control={methods.control}
                    name={"isEveryWeekday"}
                    render={({ field }) => (
                      <FormRender>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(value) => {
                              field.onChange(value);
                              if (value) {
                                methods.setValue("isEveryday", false);
                              }
                            }}
                          />
                          <span className="text-sm">Every weekday</span>
                        </div>
                      </FormRender>
                    )}
                    disabled={!!schedule?.scheduleRecurrence?.id}
                  />
                </div>
              </div>
            )}

            {methods.watch("pattern") === "WEEKLY" && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm">Recur Every</p>
                  </div>
                  <FormField
                    control={methods.control}
                    name={"weekFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input
                          type="number"
                          rightSection={
                            <p className="text-sm whitespace-nowrap">
                              {" "}
                              week(s) on:
                            </p>
                          }
                          {...field}
                          value={field.value as string}
                        />
                      </FormRender>
                    )}
                    disabled={!!schedule?.scheduleRecurrence?.id}
                  />
                </div>

                <div className="flex gap-x-4 gap-y-2 flex-wrap">
                  <FormField
                    control={methods.control}
                    name={"recurringDays"}
                    render={() => (
                      <FormRender formClassName="flex flex-wrap items-center gap-5 !space-y-0">
                        <CheckboxGroup
                          methods={methods}
                          options={RecurringDayOptions}
                          name={"recurringDays"}
                        />
                      </FormRender>
                    )}
                    disabled={!!schedule?.scheduleRecurrence?.id}
                  />
                </div>
              </div>
            )}

            {methods.watch("pattern") === "MONTHLY" && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <FormField
                      control={methods.control}
                      name={"isDayMonth"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(value) => {
                                field.onChange(value);
                                if (value) {
                                  methods.setValue("isMonth", false);
                                }
                              }}
                            />
                            <span className="text-sm">Day</span>
                          </div>
                        </FormRender>
                      )}
                      disabled={!!schedule?.scheduleRecurrence?.id}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"dayMonth"}
                    render={({ field }) => (
                      <FormRender>
                        <Input
                          type="number"
                          rightSection={
                            <p className="text-sm whitespace-nowrap">
                              {" "}
                              of every
                            </p>
                          }
                          {...field}
                          value={field.value as string}
                        />
                      </FormRender>
                    )}
                    disabled={!!schedule?.scheduleRecurrence?.id}
                  />

                  <FormField
                    control={methods.control}
                    name={"dayMonthFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input
                          type="number"
                          rightSection={
                            <p className="text-sm whitespace-nowrap">
                              {" "}
                              month(s)
                            </p>
                          }
                          {...field}
                          value={field.value as string}
                        />
                      </FormRender>
                    )}
                    disabled={!!schedule?.scheduleRecurrence?.id}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <FormField
                      control={methods.control}
                      name={"isMonth"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(value) => {
                                field.onChange(value);
                                if (value) {
                                  methods.setValue("isDayMonth", false);
                                }
                              }}
                            />
                            <span className="text-sm">The</span>
                          </div>
                        </FormRender>
                      )}
                      disabled={!!schedule?.scheduleRecurrence?.id}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"monthPosition"}
                    render={({ field }) => (
                      <FormRender>
                        <SelectInput options={dayPeriods} field={field} />
                      </FormRender>
                    )}
                    disabled={!!schedule?.scheduleRecurrence?.id}
                  />
                  <FormField
                    control={methods.control}
                    name={"monthDay"}
                    render={({ field }) => (
                      <FormRender>
                        <SelectInput
                          options={extendedDayOptions}
                          field={field}
                        />
                      </FormRender>
                    )}
                    disabled={!!schedule?.scheduleRecurrence?.id}
                  />
                  <p className="text-sm whitespace-nowrap">of every</p>
                  <FormField
                    control={methods.control}
                    name={"monthFrequency"}
                    render={({ field }) => (
                      <FormRender>
                        <Input
                          type="number"
                          rightSection={
                            <p className="text-sm whitespace-nowrap">
                              {" "}
                              month(s)
                            </p>
                          }
                          {...field}
                          value={field.value as string}
                        />
                      </FormRender>
                    )}
                    disabled={!!schedule?.scheduleRecurrence?.id}
                  />
                </div>
              </div>
            )}

            {methods.watch("pattern") === "YEARLY" && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <FormField
                      control={methods.control}
                      name={"isEveryYear"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(value) => {
                                field.onChange(value);
                                if (value) {
                                  methods.setValue("isYear", false);
                                }
                              }}
                            />
                            <span className="text-sm">Every</span>
                          </div>
                        </FormRender>
                      )}
                      disabled={!!schedule?.scheduleRecurrence?.id}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"everyYearMonth"}
                    render={({ field }) => (
                      <FormRender>
                        <SelectInput
                          options={months}
                          field={field}
                          disabled={!!schedule?.scheduleRecurrence?.id}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"everyYearDay"}
                    render={({ field }) => (
                      <FormRender>
                        <Input
                          type="number"
                          {...field}
                          value={field.value as string}
                          min={1}
                          max={31}
                          disabled={!!schedule?.scheduleRecurrence?.id}
                        />
                      </FormRender>
                    )}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <FormField
                      control={methods.control}
                      name={"isYear"}
                      render={({ field }) => (
                        <FormRender>
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(value) => {
                                field.onChange(value);
                                if (value) {
                                  methods.setValue("isEveryYear", false);
                                }
                              }}
                              disabled={!!schedule?.scheduleRecurrence?.id}
                            />
                            <span className="text-sm">The</span>
                          </div>
                        </FormRender>
                      )}
                    />
                  </div>
                  <FormField
                    control={methods.control}
                    name={"yearPosition"}
                    render={({ field }) => (
                      <FormRender>
                        <SelectInput
                          options={dayPeriods}
                          field={field}
                          disabled={!!schedule?.scheduleRecurrence?.id}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"yearDay"}
                    render={({ field }) => (
                      <FormRender>
                        <SelectInput
                          options={extendedDayOptions}
                          field={field}
                          disabled={!!schedule?.scheduleRecurrence?.id}
                        />
                      </FormRender>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={"yearMonth"}
                    render={({ field }) => (
                      <FormRender>
                        <SelectInput
                          options={months}
                          field={field}
                          disabled={!!schedule?.scheduleRecurrence?.id}
                        />
                      </FormRender>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <FormHeader className="mt-7">Range of Recurrence</FormHeader>
          <div className="grid grid-col-1 md:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"startDate"}
              render={({ field }) => (
                <FormRender label={"Start Date"}>
                  <DateInput
                    {...field}
                    value={field.value as Date}
                    disabled={!!schedule?.scheduleRecurrence?.id}
                  />
                </FormRender>
              )}
            />
            <div className="flex gap-2">
              <FormField
                control={methods.control}
                name={"endAfter"}
                render={({ field }) => (
                  <FormRender label="End After" formClassName="w-full">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          if (value) {
                            methods.setValue("endBy", false);
                          }
                        }}
                        disabled={!!schedule?.scheduleRecurrence?.id}
                      />
                      <FormField
                        control={methods.control}
                        name={"occurence"}
                        render={({ field }) => (
                          <FormRender formClassName="w-full">
                            <Input
                              {...field}
                              type="number"
                              value={field.value as string}
                              rightSection={
                                <p className="text-sm">Occurrence(s)</p>
                              }
                              disabled={!!schedule?.scheduleRecurrence?.id}
                            />
                          </FormRender>
                        )}
                      />
                    </div>
                  </FormRender>
                )}
              />
            </div>

            <div className="flex gap-2">
              <FormField
                control={methods.control}
                name={"endBy"}
                render={({ field }) => (
                  <FormRender label="End By" formClassName="w-full">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) => {
                          field.onChange(value);
                          if (value) {
                            methods.setValue("endAfter", false);
                          }
                        }}
                        disabled={!!schedule?.scheduleRecurrence?.id}
                      />
                      <FormField
                        control={methods.control}
                        name={"endDate"}
                        render={({ field }) => (
                          <FormRender formClassName="w-full">
                            <DateInput {...field} value={field.value as Date} />
                          </FormRender>
                        )}
                        disabled={!!schedule?.scheduleRecurrence?.id}
                      />
                    </div>
                  </FormRender>
                )}
              />
            </div>
          </div>
        </div>
        <div className={cn("flex gap-2 items-center w-full")}>
          <Button
            leftIcon={<FaArrowLeft />}
            type="button"
            className="md:mx-2 mt-6 py-2 text-white w-[50%]"
            onClick={() => setTab("appointment")}
          >
            Prev
          </Button>
          <Button
            rightIcon={<FaArrowRight />}
            type="submit"
            className={cn("md:mx-2 mt-6 py-2 text-white w-[50%]")}
            loading={isMutating}
          >
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RecurrenceModal;
