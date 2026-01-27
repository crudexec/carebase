import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { FaArrowRight } from "react-icons/fa6";

import FormHeader from "@/components/form-header";
import {
  Button,
  Checkbox,
  DateTimeInput,
  Form,
  FormField,
  FormRender,
  Input,
  RadioInput,
  SelectInput,
  Textarea,
} from "@/components/ui";
import { billingCode, scheduleServices, visitStatusOptions } from "@/constants";
import {
  useCreateSchedule,
  useDisclosure,
  useGetPatients,
  useGetUsers,
  useUpdateSchedule,
} from "@/hooks";
import { modifyDateFields, pickValues } from "@/lib";
import { appointmentSchema, scheduleRecurrenceSchema } from "@/schema";
import { FormReturn, ISetState, PatientScheduleResponse } from "@/types";

import { RecurringPromptModal } from "../modal";

type formType = FormReturn<typeof appointmentSchema>;

const AppointmentModal = ({
  refreshTable,
  setSchedule,
  setTab,
  schedule,
  methods,
  recurrenceForm,
}: {
  refreshTable: () => void;
  setSchedule: ISetState<PatientScheduleResponse | undefined>;
  schedule?: PatientScheduleResponse;
  setTab: ISetState<string>;
  methods: formType;
  recurrenceForm: FormReturn<typeof scheduleRecurrenceSchema>;
}) => {
  const { opened, onOpen, onClose } = useDisclosure();
  const { data: patients, isLoading } = useGetPatients({ status: "ACTIVE" });
  const { data: caregivers } = useGetUsers({ tab: "caregiver" });
  const { data, trigger, isMutating } = useCreateSchedule();
  const {
    data: updateResponse,
    trigger: updateSchedule,
    isMutating: isUpdating,
  } = useUpdateSchedule();
  const [recurrTimeFilter, setRecurrTimeFilter] = React.useState<{
    startTime?: Date;
    endTime?: Date;
  }>({ startTime: undefined, endTime: undefined });

  useEffect(() => {
    if (data?.success || updateResponse?.success) {
      refreshTable();
      if (!schedule?.id) {
        if (setSchedule) setSchedule(modifyDateFields(data?.data));
        toast.success(`Success|${data?.message}`);
      } else {
        if (setSchedule) setSchedule(modifyDateFields(updateResponse?.data));
        toast.success(`Success|${updateResponse?.message}`);
      }
      setTab("recurrence");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, updateResponse]);

  return (
    <Form {...methods}>
      <RecurringPromptModal
        opened={opened}
        closeModal={onClose}
        handleContinue={async (value) => {
          await updateSchedule({
            ...appointmentSchema.parse(methods.getValues()),
            id: schedule?.id as string,
            recurrenceType: value,
            ...modifyDateFields(recurrTimeFilter),
          });
        }}
        recurrTimeFilter={recurrTimeFilter}
        setRecurrTimeFilter={setRecurrTimeFilter}
        loading={isUpdating}
      />
      <form
        onSubmit={methods.handleSubmit(async (data) => {
          if (!schedule?.id) {
            await trigger(pickValues(data));
          } else {
            if (schedule?.scheduleRecurrence?.isRecurringEvent) {
              onOpen();
            } else {
              await updateSchedule({
                ...appointmentSchema.parse(methods.getValues()),
                id: schedule?.id as string,
              });
            }
          }
          recurrenceForm.setValue(
            "startDate",
            data?.appointmentStartTime as Date,
          );
        })}
        className="max-h-[670px] overflow-auto flex flex-col gap-5 scrollbar-hide px-1"
      >
        <div className="grid grid-col-1 md:grid-cols-2 gap-5">
          <FormField
            control={methods.control}
            name={"caregiverId"}
            render={({ field }) => (
              <FormRender label={"Caregiver"}>
                <SelectInput
                  options={
                    caregivers?.data?.users?.map((caregiver) => ({
                      label: `${caregiver.firstName} ${caregiver.lastName}`,
                      value: caregiver.id,
                    })) || []
                  }
                  field={field}
                  loading={isLoading}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"patientId"}
            render={({ field }) => (
              <FormRender label={"Patient"}>
                <SelectInput
                  options={patients?.data?.patients?.map((patient) => ({
                    label: `${patient.firstName} ${patient.lastName}`,
                    value: patient.id,
                  }))}
                  field={field}
                  loading={isLoading}
                />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"appointmentStartTime"}
            render={({ field }) => (
              <FormRender label={"Start Time:"}>
                <DateTimeInput {...field} value={field.value as Date} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"appointmentEndTime"}
            render={({ field }) => (
              <FormRender label={"End Time"}>
                <DateTimeInput {...field} value={field.value as Date} />
              </FormRender>
            )}
          />
          <FormField
            control={methods.control}
            name={"service"}
            render={({ field }) => (
              <FormRender label={"Service"}>
                <SelectInput
                  searchable
                  modalSearch
                  options={
                    scheduleServices?.map((item) => ({
                      label: item.label,
                      value: item.value,
                    })) || []
                  }
                  field={field}
                  loading={isLoading}
                />
              </FormRender>
            )}
          />
        </div>

        <div>
          <FormHeader className="mt-7">
            Information needed to Save as Completed
          </FormHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="border-r-2 p-3 rounded">
              <FormField
                control={methods.control}
                name={"visitStatus"}
                render={({ field }) => (
                  <FormRender label={"Visit Status"}>
                    <RadioInput
                      className="grid grid-cols-2 gap-5 items-center"
                      {...field}
                      options={visitStatusOptions}
                    />
                  </FormRender>
                )}
              />
            </div>
            <div className="flex-1">
              <div className="flex gap-2 items-center min-w-full mb-4">
                <FormField
                  control={methods.control}
                  name={"billingCode"}
                  render={({ field }) => (
                    <FormRender label={"Billing Code"} formClassName="w-full">
                      <SelectInput
                        options={billingCode}
                        field={field}
                        placeholder="Enter Billing Code"
                      />
                    </FormRender>
                  )}
                />
              </div>

              <FormField
                control={methods.control}
                name={"billable"}
                render={({ field }) => (
                  <FormRender formClassName="self-center">
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">Billable</span>
                    </div>
                  </FormRender>
                )}
              />
            </div>
          </div>
        </div>

        <div>
          <FormHeader className="mt-7">Optional</FormHeader>

          <div className="grid grid-col-1 md:grid-cols-2 gap-5">
            <FormField
              control={methods.control}
              name={"travelTime"}
              render={({ field }) => (
                <FormRender label={"Travel Time"}>
                  <Input {...field} value={field.value as string} type="time" />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"overTime"}
              render={({ field }) => (
                <FormRender label={"Overtime"}>
                  <Input {...field} value={field.value as string} type="time" />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"miles"}
              render={({ field }) => (
                <FormRender label={"Miles"}>
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"expense"}
              render={({ field }) => (
                <FormRender label={"Expense"}>
                  <Input {...field} value={field.value as string} />
                </FormRender>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={methods.control}
                name={"caregiverComments"}
                render={({ field }) => (
                  <FormRender label={"Comments (for caregiver view)"}>
                    <Textarea {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>

            <FormField
              control={methods.control}
              name={"validateForTimeConflict"}
              render={({ field }) => (
                <FormRender formClassName="self-center">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">
                      Do not validate for Time Conflict
                    </span>
                  </div>
                </FormRender>
              )}
            />
            <FormField
              control={methods.control}
              name={"monitoredForQA"}
              render={({ field }) => (
                <FormRender formClassName="self-center">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm">Monitored for QA purposes</span>
                  </div>
                </FormRender>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={methods.control}
                name={"administrativeComments"}
                render={({ field }) => (
                  <FormRender label={"Comments (for administrative use only)"}>
                    <Textarea {...field} value={field.value as string} />
                  </FormRender>
                )}
              />
            </div>
            <div className="md:col-span-2 border p-2 rounded">
              <FormField
                control={methods.control}
                name={"visitLocation"}
                render={({ field }) => (
                  <FormRender label={"Visit Location"}>
                    <SelectInput
                      options={
                        caregivers?.data?.users?.map((caregiver) => ({
                          label: `${caregiver.firstName} ${caregiver.lastName}`,
                          value: caregiver.id,
                        })) || []
                      }
                      field={field}
                      loading={isLoading}
                    />
                  </FormRender>
                )}
              />
            </div>
          </div>
        </div>
        <Button
          rightIcon={<FaArrowRight />}
          type="submit"
          className="md:mx-2 mt-6 py-2 text-white"
          loading={isMutating || isUpdating}
        >
          Save and Continue
        </Button>
      </form>
    </Form>
  );
};

export default AppointmentModal;
