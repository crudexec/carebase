import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import React from "react";
import { useForm } from "react-hook-form";
import { useReactToPrint } from "react-to-print";

import {
  Button,
  Checkbox,
  DateInput,
  DateRangePicker,
  Form,
  FormField,
  FormRender,
  Input,
  Modal,
  RadioInput,
  SelectInput,
} from "@/components/ui";
import { months, visitStatusOptions } from "@/constants";
import { useGetPatients, useGetProviders, useGetUsers } from "@/hooks";
import { cn, delay } from "@/lib";
import {
  printCalendarDefaultValue,
  PrintCalendarForm,
  printCalendarSchema,
} from "@/schema";

import PrintAppointmentCalendar from "./appointment-calendar";

const PrintCalendarModal = ({
  title,
  open,
  modalClose,
}: {
  title: string;
  open: boolean;
  modalClose: () => void;
}) => {
  const { data, isLoading } = useGetPatients({ status: "ACTIVE" });
  const { data: caregivers } = useGetUsers({ tab: "caregiver" });
  const { data: providers, isLoading: loading } = useGetProviders();
  const methods = useForm<PrintCalendarForm>({
    resolver: zodResolver(printCalendarSchema),
    defaultValues: printCalendarDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });
  const componentRef = React.useRef(null);
  const [printFilter, setPrintFilter] = React.useState<PrintCalendarForm>();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <Modal
      title={title}
      open={open}
      onClose={modalClose}
      className="md:max-w-[600px]"
    >
      <PrintAppointmentCalendar ref={componentRef} filter={printFilter} />
      <Form {...methods}>
        <form
          className="h-[670px] overflow-auto flex flex-col gap-4 scrollbar-hide px-2 !pt-0"
          onSubmit={methods.handleSubmit(async (data) => {
            setPrintFilter(data);
            await delay(300);
            handlePrint();
          })}
        >
          <div>
            <p className="pb-3 border-b">Calendar By</p>
            <div className="pt-3">
              <FormField
                control={methods.control}
                name={"calendarBy"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="grid grid-cols-2 md:grid-cols-4 gap-5 items-center"
                      {...field}
                      options={[
                        { value: "month", label: "Month" },
                        { value: "week", label: "Week" },
                        { value: "cert-period", label: "Cert Period" },
                        { value: "date-range", label: "Date Range" },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>

          {methods.watch("calendarBy") === "month" && (
            <div>
              <p className="pb-3 border-b">Month</p>
              <div className="grid grid-cols-1  md:grid-cols-2 gap-4 items-center pt-4">
                <FormField
                  control={methods.control}
                  name={"month"}
                  render={({ field }) => (
                    <FormRender label={"Month"}>
                      <SelectInput
                        options={months}
                        field={field}
                        placeholder="Enter Month"
                      />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"year"}
                  render={({ field }) => (
                    <FormRender label={"Year"}>
                      <Input {...field} value={field.value as string} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
          )}

          {methods.watch("calendarBy") === "week" && (
            <div>
              <p className="pb-3 border-b">Week</p>
              <div className="pt-4">
                <FormField
                  control={methods.control}
                  name={"weekDay"}
                  render={({ field }) => (
                    <FormRender label={"Select any day of the week:"}>
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />{" "}
              </div>
            </div>
          )}

          {methods.watch("calendarBy") === "cert-period" && (
            <div>
              <p className="pb-3 border-b">Select Certification Period</p>
              <div className="pt-4">
                <FormField
                  control={methods.control}
                  name={"certPeriod"}
                  render={({ field }) => (
                    <FormRender>
                      <DateRangePicker
                        onChange={field.onChange}
                        value={field.value as Date[]}
                        min={field.value?.[0]}
                        max={
                          field.value?.[0]
                            ? dayjs(field.value?.[0] as Date)
                                .add(5, "month")
                                .toDate()
                            : undefined
                        }
                      />
                    </FormRender>
                  )}
                />
              </div>
            </div>
          )}

          {methods.watch("calendarBy") === "date-range" && (
            <div>
              <p className="pb-3 border-b">Date Range</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-4">
                <FormField
                  control={methods.control}
                  name={"dateRangeFrom"}
                  render={({ field }) => (
                    <FormRender label={"From:"}>
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={"dateRangeThrough"}
                  render={({ field }) => (
                    <FormRender label={"Through:"}>
                      <DateInput {...field} value={field.value as Date} />
                    </FormRender>
                  )}
                />
              </div>
            </div>
          )}

          <div>
            <p className="pb-3 border-b">Print Calendar for</p>
            <div className="pt-3">
              <FormField
                control={methods.control}
                name={"printCalendarFor"}
                render={({ field }) => (
                  <FormRender>
                    <RadioInput
                      className="grid grid-cols-2 gap-5 items-center"
                      {...field}
                      options={[
                        { value: "patient", label: "Patient" },
                        { value: "caregiver", label: "Caregiver" },
                      ]}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>
          <div>
            <p className="pb-3 border-b">Patient/Admission</p>
            <div className="flex gap-4 items-center pt-4">
              <div className="flex-1">
                <FormField
                  control={methods.control}
                  name={"patient"}
                  render={({ field }) => (
                    <FormRender>
                      <SelectInput
                        options={data?.data?.patients?.map((patient) => ({
                          label: `${patient.firstName} ${patient.lastName}`,
                          value: patient.id,
                        }))}
                        field={field}
                        loading={isLoading}
                        placeholder="Select a Patient"
                      />
                    </FormRender>
                  )}
                />
              </div>

              <FormField
                control={methods.control}
                name={"allPatient"}
                render={({ field }) => (
                  <FormRender formClassName="self-center">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">All</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">Caregiver</p>
            <div className="flex gap-4 items-center pt-4">
              <div className="flex-1">
                <FormField
                  control={methods.control}
                  name={"caregiver"}
                  render={({ field }) => (
                    <FormRender>
                      <SelectInput
                        options={
                          caregivers?.data?.users?.map((caregiver) => ({
                            label: `${caregiver.firstName} ${caregiver.lastName}`,
                            value: caregiver.id,
                          })) || []
                        }
                        field={field}
                        loading={isLoading}
                        placeholder="Select a Caregiver"
                      />
                    </FormRender>
                  )}
                />
              </div>

              <FormField
                control={methods.control}
                name={"allCaregiver"}
                render={({ field }) => (
                  <FormRender formClassName="self-center">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">All</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">Office</p>
            <div className="flex gap-4 items-center pt-4">
              <div className="flex-1">
                <FormField
                  control={methods.control}
                  name={"office"}
                  render={({ field }) => (
                    <FormRender>
                      <SelectInput
                        options={providers?.data?.providers?.map(
                          (provider) => ({
                            label: provider.providerName as string,
                            value: provider.id,
                          }),
                        )}
                        field={field}
                        loading={loading}
                      />
                    </FormRender>
                  )}
                />
              </div>

              <FormField
                control={methods.control}
                name={"allOffice"}
                render={({ field }) => (
                  <FormRender formClassName="self-center">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">All</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>
          </div>

          <div>
            <p className="pb-3 border-b">Visit Status</p>
            <div className="pt-4">
              <FormField
                control={methods.control}
                name={"visitStatus"}
                render={({ field }) => (
                  <FormRender>
                    <SelectInput
                      options={visitStatusOptions}
                      field={field}
                      placeholder="Select Visit Status"
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>

          <Button className={cn("md:mx-2 py-2 text-white w-full")}>
            Run Report
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default PrintCalendarModal;
