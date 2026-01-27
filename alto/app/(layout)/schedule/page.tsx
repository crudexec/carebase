"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientSchedule, ScheduleRecurrence } from "@prisma/client";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import dayjs from "dayjs";
import {
  CalendarCheckIcon,
  CalendarIcon,
  ListIcon,
  SettingsIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next-nprogress-bar";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Shell } from "@/components/data-table";
import {
  Appointment,
  PatientVisitModal,
  PrintCalendarModal,
  Recurrence,
  ScheduleCalendar,
  VisitListModal,
} from "@/components/schedule";
import {
  Button,
  DateRangePicker,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Modal,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SegmentedControl,
  SelectInput,
  Switch,
  TabsContent,
} from "@/components/ui";
import {
  useGetPatients,
  useGetSchedules,
  useGetUsers,
  usePopulateForm,
  useSearchParam,
} from "@/hooks";
import { addTimeToDate, modifyDateFields } from "@/lib";
import {
  appointmentDefaultValue,
  AppointmentForm,
  appointmentSchema,
  scheduleRecurrenceDefaultValue,
  ScheduleRecurrenceForm,
  scheduleRecurrenceSchema,
} from "@/schema";
import { PatientScheduleResponse } from "@/types";

type DisplayOption = {
  key: string;
  label: string;
  visibility: boolean;
};

const Schedule = () => {
  const { data, isLoading } = useGetPatients({ status: "ACTIVE" });
  const { data: caregivers } = useGetUsers({ tab: "caregiver" });
  const [openModal, setOpenModal] = useState({
    openVisitList: false,
    openAgencyVisit: false,
    openAppointment: false,
    printCalendar: false,
  });
  const [viewAppointmentModal, setViewAppointmentModal] = useState(false);
  const [formTab, setFormTab] = useState("appointment");
  const router = useRouter();
  const { patient, caregiver } = useSearchParam();
  const [schedule, setSchedule] = React.useState<PatientScheduleResponse>();
  const [displayOptions, setDisplayOptions] = useState<DisplayOption[]>([
    {
      key: "inactiveAdmission",
      label: "Include Inactive Admissions",
      visibility: false,
    },
    {
      key: "inactiveCaregiver",
      label: "Include Inactive Caregivers",
      visibility: false,
    },
    {
      key: "documentationFocus",
      label: "Show Visit Documentation Status",
      visibility: false,
    },
  ]);

  const [filter, setFilter] = useState({ patient: "", caregiver: "" });
  const [certPeriod, setCertPeriod] = useState<(Date | undefined)[]>([
    undefined,
    undefined,
  ]);

  const methods = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointmentDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const recurrenceForm = useForm<ScheduleRecurrenceForm>({
    resolver: zodResolver(scheduleRecurrenceSchema),
    defaultValues: scheduleRecurrenceDefaultValue,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { data: schedules, mutate } = useGetSchedules({
    patient: filter?.patient ?? "",
    caregiver: filter?.caregiver ?? "",
    inactiveCaregiver: displayOptions[1].visibility,
    inactivePatient: displayOptions[0].visibility,
  });

  usePopulateForm<AppointmentForm, Partial<PatientSchedule>>(
    methods.reset,
    schedule,
  );
  usePopulateForm<ScheduleRecurrenceForm, ScheduleRecurrence>(
    recurrenceForm.reset,
    schedule?.scheduleRecurrence as ScheduleRecurrence,
  );

  useEffect(() => {
    // fixed hydration issue - intentional setState on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewAppointmentModal(true);
  }, []);

  const resetFilters = useCallback(() => {
    if (patient) {
      methods.setValue("patientId", patient);
      setFilter((prevState) => ({ ...prevState, patient: patient as string }));
    }
    if (caregiver) {
      methods.setValue("caregiverId", caregiver as string);
      setFilter((prevState) => ({
        ...prevState,
        caregiver: caregiver as string,
      }));
    }
  }, [methods, caregiver, patient]);

  const onCloseModal = () => {
    setSchedule(undefined);
    resetFilters();
    recurrenceForm.reset(scheduleRecurrenceDefaultValue);
    methods.reset(appointmentDefaultValue);
    setFormTab("appointment");
    setOpenModal((prevState) => ({ ...prevState, openAppointment: false }));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetFilters();
  }, [resetFilters]);

  const areAllOptionsTrue = () => {
    return displayOptions.every((option) => option.visibility);
  };

  const toggleOptions = () => {
    const allTrue = areAllOptionsTrue();
    setDisplayOptions((prevOptions) =>
      prevOptions.map((option) => ({
        ...option,
        visibility: !allTrue,
      })),
    );
  };

  const handleCheckedChange = (key: string) => {
    setDisplayOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.key === key
          ? { ...option, visibility: !option.visibility }
          : option,
      ),
    );
  };

  return (
    <Shell>
      <PrintCalendarModal
        title="Calendar"
        open={openModal.printCalendar}
        modalClose={() =>
          setOpenModal((prevState) => ({ ...prevState, printCalendar: false }))
        }
      />

      <VisitListModal
        title="Visit"
        open={openModal.openVisitList}
        modalClose={() =>
          setOpenModal((prevState) => ({ ...prevState, openVisitList: false }))
        }
      />
      <PatientVisitModal
        title="Visit"
        open={openModal.openAgencyVisit}
        modalClose={() =>
          setOpenModal((prevState) => ({
            ...prevState,
            openAgencyVisit: false,
          }))
        }
      />

      <Modal
        title="Appointment Details"
        open={openModal.openAppointment}
        onClose={onCloseModal}
        className="md:max-w-[700px]"
      >
        <SegmentedControl
          data={[
            { value: "appointment", label: "Appointment" },
            { value: "recurrence", label: "Recurrence" },
          ]}
          value={formTab}
          transparent
          className="mx-auto flex w-full mb-2"
          stretch
          onChange={setFormTab}
          disabled={!schedule?.id}
        >
          <TabsContent value="appointment">
            <Appointment
              refreshTable={mutate}
              setTab={setFormTab}
              setSchedule={setSchedule}
              methods={methods}
              recurrenceForm={recurrenceForm}
              schedule={schedule}
            />
          </TabsContent>
          <TabsContent value="recurrence">
            <Recurrence
              refreshTable={() => {
                mutate();
              }}
              onClose={onCloseModal}
              methods={recurrenceForm}
              schedule={schedule}
              setTab={setFormTab}
            />
          </TabsContent>
        </SegmentedControl>
      </Modal>

      {viewAppointmentModal && (
        <Modal
          openOnOutsideClick={true}
          title=""
          open={viewAppointmentModal}
          onClose={() => setViewAppointmentModal(false)}
          className="md:max-w-[700px]"
        >
          <p className="text-xl font-semibold text-center">
            Select a Patient or Caregiver to view Appointments
          </p>

          <div className="grid md:grid-cols-2 gap-5 mt-5">
            <div className="w-full">
              <p className="mb-1 font-semibold">Patient</p>
              <SelectInput
                options={data?.data?.patients?.map((patient) => ({
                  label: `${patient.firstName} ${patient.lastName}`,
                  value: patient.id,
                }))}
                field={{
                  onChange: (value) => {
                    methods.setValue("patientId", value);
                    methods.setValue("caregiverId", "");
                    setFilter((prevState) => ({
                      ...prevState,
                      patient: value as string,
                      caregiver: "",
                    }));
                    router.push(`?patient=${value}`);
                  },
                  value: filter?.patient,
                }}
                searchable
                loading={isLoading}
              />
            </div>
            <div className="w-full">
              <p className="mb-1 font-semibold">Caregiver</p>
              <SelectInput
                options={
                  caregivers?.data?.users?.map((caregiver) => ({
                    label: `${caregiver.firstName} ${caregiver.lastName}`,
                    value: caregiver.id,
                  })) || []
                }
                field={{
                  onChange: (value) => {
                    methods.setValue("caregiverId", value);
                    methods.setValue("patientId", "");
                    setFilter((prevState) => ({
                      ...prevState,
                      caregiver: value as string,
                      patient: "",
                    }));
                    router.push(`?caregiver=${value}`);
                  },
                  value: filter?.caregiver,
                }}
                searchable
                loading={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <Button
              onClick={() => {
                setViewAppointmentModal(false);
              }}
              disabled={!patient && !caregiver}
            >
              Continue
            </Button>
          </div>
        </Modal>
      )}

      <div>
        <p className="text-2xl font-bold mb-3">Scheduler</p>
        <div className="flex flex-col md:flex-row gap-5 md:gap-20 justify-between items-end">
          <div className="w-full">
            <p className="mb-1">Patient</p>
            <SelectInput
              options={data?.data?.patients?.map((patient) => ({
                label: `${patient.firstName} ${patient.lastName}`,
                value: patient.id,
              }))}
              field={{
                onChange: (value) => {
                  methods.setValue("patientId", value);
                  methods.setValue("caregiverId", "");
                  setFilter((prevState) => ({
                    ...prevState,
                    patient: value as string,
                    caregiver: "",
                  }));
                  router.push(`?patient=${value}`);
                },
                value: filter?.patient,
              }}
              searchable
              loading={isLoading}
            />
          </div>
          <div className="w-full">
            <p className="mb-1">Caregiver</p>
            <SelectInput
              options={
                caregivers?.data?.users?.map((caregiver) => ({
                  label: `${caregiver.firstName} ${caregiver.lastName}`,
                  value: caregiver.id,
                })) || []
              }
              field={{
                onChange: (value) => {
                  methods.setValue("caregiverId", value);
                  methods.setValue("patientId", "");
                  setFilter((prevState) => ({
                    ...prevState,
                    caregiver: value as string,
                    patient: "",
                  }));
                  router.push(`?caregiver=${value}`);
                },
                value: filter?.caregiver,
              }}
              searchable
              loading={isLoading}
            />
          </div>
          <div className="flex items-center gap-2 w-full">
            <div className="w-full">
              <p className="mb-1">Cert Period</p>
              <DateRangePicker
                onChange={(value) => {
                  setCertPeriod(value);
                }}
                value={certPeriod as Date[]}
                min={certPeriod?.[0]}
                max={
                  certPeriod?.[0]
                    ? dayjs(certPeriod?.[0] as Date)
                        .add(5, "month")
                        .toDate()
                    : undefined
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button>
                  <SettingsIcon className="size-4" />
                  Options
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex flex-col gap-2 w-auto p-4">
                <div
                  className="flex items-center gap-2 text-sm"
                  role="button"
                  onClick={() =>
                    setOpenModal((prevState) => ({
                      ...prevState,
                      printCalendar: true,
                    }))
                  }
                >
                  <CalendarIcon className="size-4 text-primary" />
                  Print Calendar
                </div>
                <div
                  className="flex items-center gap-2 text-sm"
                  role="button"
                  onClick={() =>
                    setOpenModal((prevState) => ({
                      ...prevState,
                      openVisitList: true,
                    }))
                  }
                >
                  <CalendarCheckIcon className="size-4 text-primary" />
                  Visit List
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trash2Icon className="size-4 text-red-500" />
                  Delete All Visits for Selected Patient/Insurance
                </div>
                <div
                  role="button"
                  className="flex items-center gap-2 text-sm"
                  onClick={() =>
                    setOpenModal((prevState) => ({
                      ...prevState,
                      openAgencyVisit: true,
                    }))
                  }
                >
                  <ListIcon className="size-4" />
                  List all visits
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onSelect={(e) => e.preventDefault()}>
                <Button
                  aria-label={"display-options"}
                  variant="secondary"
                  size="lg"
                  className="ml-auto lg:flex"
                >
                  <MixerHorizontalIcon className="size-4" />
                  Display Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[150px]"
                modal={true}
              >
                <DropdownMenuLabel className="flex items-center gap-3">
                  Toggle all
                  <Switch
                    size="md"
                    onClick={toggleOptions}
                    checked={areAllOptionsTrue()}
                  />
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div>
                  {displayOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.key}
                      className="capitalize"
                      checked={option.visibility}
                      onCheckedChange={() => handleCheckedChange(option.key)}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {(patient || caregiver) && (
          <section className="my-4 flex w-full items-start gap-2">
            <ScheduleCalendar
              onOpen={() =>
                setOpenModal((prevState) => ({
                  ...prevState,
                  openAppointment: true,
                }))
              }
              onCalendarClick={(date) => {
                methods.setValue(
                  "appointmentStartTime",
                  addTimeToDate("08:00", date),
                );
                methods.setValue(
                  "appointmentEndTime",
                  addTimeToDate("09:00", date),
                );
                if (patient) {
                  methods.setValue("patientId", patient as string);
                } else if (caregiver) {
                  methods.setValue("caregiverId", caregiver as string);
                }
              }}
              onScheduleClick={(schedule) => {
                if (patient) {
                  setSchedule(modifyDateFields(schedule));
                } else if (caregiver) {
                  setSchedule(modifyDateFields(schedule));
                }
              }}
              methods={methods}
              schedules={schedules?.data?.schedules ?? []}
              setOpenModal={setOpenModal}
              certPeriod={certPeriod}
              patient={patient}
              caregiver={caregiver}
            />
          </section>
        )}
      </div>
    </Shell>
  );
};

export default Schedule;
