import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { DPDay, useDatePicker } from "@rehookify/datepicker";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";
import dayjs from "dayjs";
import _ from "lodash";
import { useEffect, useState } from "react";

import { billingCode, visitStatusOptions } from "@/constants";
import { addTimeToDate, cn, getFullName } from "@/lib/index";
import { appointmentSchema } from "@/schema/appointment";
import { FormReturn, ISetState, PatientScheduleResponse } from "@/types";

import { Button, CardContent, Tooltip } from "../ui";
import MobileCalendar from "./mobile-calendar";
import SideCalendar from "./side-calendar";

export type ScheduleModalType = {
  openVisitList: boolean;
  openAgencyVisit: boolean;
  openAppointment: boolean;
  printCalendar: boolean;
};
const dayClassName = (
  className: string,
  { selected, disabled, now, inCurrentMonth }: DPDay,
) =>
  clsx(className, {
    "bg-secondary hover:bg-primary opacity-100": selected,
    "opacity-25 cursor-not-allowed": disabled,
    "text-black/50 dark:text-white/50": !inCurrentMonth,
    "border border-primary": now,
  });

export const arrowVariants = cva(
  "relative flex items-center justify-center text-center text-white px-3 py-1 after:absolute after:-right-[10px] after:border-t-[11.5px] after:border-t-transparent after:border-b-[11.5px] after:border-b-transparent after:border-l-[10px]  before:absolute before:-left-[1px] before:border-t-[12px] before:border-t-transparent before:border-b-[12px] before:border-b-transparent before:border-l-[10px] before:border-l-background",
  {
    variants: {
      variant: {
        default: "after:border-l-gray-800 bg-gray-800",
        unassigned: "after:border-l-gray-400 bg-gray-400",
        completed: "after:border-l-green-500 bg-green-500",
        onhold: "after:border-l-yellow-500 bg-yellow-500",
        cancelled: "after:border-l-red-500 bg-red-500",
        hospitalized: "after:border-l-blue-500 bg-blue-500",
        missed: "after:border-l-purple-500 bg-purple-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
export const bgVariants = cva(
  "border text-white text-center self-center w-full",
  {
    variants: {
      variant: {
        default: "",
        not_completed: "bg-gray-800",
        unassigned: "bg-gray-400",
        completed: "bg-green-500",
        on_hold: "bg-yellow-500",
        cancelled: "bg-red-500",
        hospitalized: "bg-blue-500",
        missed: "bg-purple-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
export type BgProps = VariantProps<typeof bgVariants>;

type CalendarProps = {
  onCalendarClick: (date: Date) => void;
  onScheduleClick: (schedule: PatientScheduleResponse) => void;
  onOpen: () => void;
  schedules?: PatientScheduleResponse[];
  methods: FormReturn<typeof appointmentSchema>;
  setOpenModal: ISetState<ScheduleModalType>;
  certPeriod?: (Date | undefined)[];
  patient?: string;
  caregiver?: string;
};

const ScheduleCalendar = ({
  onOpen,
  onCalendarClick,
  schedules,
  setOpenModal,
  methods,
  onScheduleClick,
  certPeriod,
  patient,
  caregiver,
}: CalendarProps) => {
  const [selectedDates, onDatesChange] = useState<Date[]>([]);
  const [offsetDate, onOffsetChange] = useState<Date>(new Date());
  const numMonths =
    new Date((certPeriod?.[1] as Date) || null).getMonth() -
    new Date((certPeriod?.[0] as Date) || null).getMonth();
  const monthOffset =
    numMonths && numMonths > 0 && certPeriod?.[1]
      ? Array(numMonths)
          .fill("")
          .map((_, i) => i + 1)
      : [];

  const groupedSchedules = _.groupBy(schedules, (item) => {
    return dayjs.utc(item.appointmentStartTime).format("YYYY-MM-DD");
  });

  const {
    data: { weekDays, calendars },
    propGetters: { dayButton },
  } = useDatePicker({
    selectedDates,
    onDatesChange,
    // we want to manipulate with offsetDate outside of the hook
    offsetDate,
    onOffsetChange,
    calendar: {
      offsets: monthOffset,
    },
  });

  useEffect(() => {
    if (certPeriod?.[0] && certPeriod?.[1]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      onOffsetChange(certPeriod?.[0] as Date);
    }
  }, [certPeriod]);

  return (
    <>
      <section className="rounded-2xl hidden lg:block w-full">
        {calendars.map(({ month, year, days }, index) => {
          const allDays = days
            .slice(0, -7)
            .concat(
              days.slice(-7).every((day) => !day.inCurrentMonth)
                ? []
                : days.slice(-7),
            );
          // const groupedDays = _.chunk(allDays, 7);
          // const filteredDays = groupedDays.filter((item) => {
          //   const weekDay = dayjs(offsetDate).format('YYYY-MM-DD');
          //   return item.some((day) => dayjs(day.$date).format('YYYY-MM-DD') === weekDay);
          // })[0];

          return (
            <div key={index} className="mt-2">
              <header className="pb-2 flex justify-between items-center">
                <div className="flex gap-[25px] items-center">
                  <div className="flex gap-1">
                    <div className="flex items-center">
                      <Button
                        size="custom"
                        className="rounded-r-none border-r px-3 py-2"
                        onClick={() => {
                          onOffsetChange(
                            dayjs(offsetDate).subtract(1, "month").toDate(),
                          );
                        }}
                      >
                        <ChevronLeftIcon />
                      </Button>
                      <Button
                        size="custom"
                        className="rounded-l-none px-3 py-2"
                        onClick={() => {
                          onOffsetChange(
                            dayjs(offsetDate).add(1, "month").toDate(),
                          );
                        }}
                      >
                        <ChevronRightIcon />
                      </Button>
                    </div>
                    <Button
                      size="custom"
                      className="px-3 py-1 font-normal"
                      onClick={() => onOffsetChange(new Date())}
                    >
                      Today
                    </Button>
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {month} {year}
                </p>

                <div />
              </header>
              <div className="border-light-grey-outline dark:border-dark-grey-outline">
                <ul className="grid grid-cols-7 border-t border-x rounded-t-[8px] bg-secondary">
                  {weekDays.map((day, i) => (
                    <li
                      key={`${month}-${day}`}
                      className={`uppercase p-3 font-medium border-r ${i === weekDays.length - 1 && "border-none"}`}
                    >
                      {day}
                    </li>
                  ))}
                </ul>
                <ul className="grid grid-cols-7 border-t border-l">
                  {/* remove the last 7 days if they are not in current month */}
                  {allDays.map((day) => {
                    const dateKey = dayjs(day.$date).format("YYYY-MM-DD");
                    return (
                      <li
                        key={day.$date.toDateString()}
                        {...dayButton(day)}
                        className={cn(
                          dayClassName(
                            "border-r border-b hover:border-2 hover:bg-secondary text-light-grey-text hover:text-foreground font-medium hover:border-primary-orange  flex flex-col text-right",
                            day,
                          ),
                          monthOffset.length > 0
                            ? "min-h-[100px] xl:min-h-[100px]"
                            : "min-h-[100px] xl:min-h-[150px]",
                        )}
                        onClick={() => {
                          onCalendarClick(day.$date);
                          onOpen();
                        }}
                      >
                        <p className="p-3">{day.day.replace(/^0+/, "")}</p>
                        <div className="w-full text-center relative">
                          {groupedSchedules[dateKey]?.map((item, index) => {
                            return (
                              <Tooltip
                                key={index}
                                trigger={
                                  <div
                                    key={item.id}
                                    className={cn(
                                      bgVariants({
                                        variant:
                                          item.visitStatus?.toLowerCase(),
                                      } as BgProps),
                                      "text-[10px] w-full relative line-clamp-1 px-2",
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onScheduleClick(item);
                                      onOpen();
                                    }}
                                  >
                                    <b className="lowercase">
                                      {dayjs(item.appointmentStartTime).format(
                                        "hh:mmA",
                                      )}{" "}
                                    </b>
                                    {getFullName(
                                      item?.caregiver?.firstName as string,
                                      item?.caregiver?.lastName as string,
                                    )}
                                  </div>
                                }
                              >
                                <div>
                                  <div className="bg-primary py-2 text-white px-4">
                                    <p className="text-2xl text-center">
                                      {getFullName(
                                        item?.caregiver?.firstName as string,
                                        item?.caregiver?.lastName as string,
                                      )}
                                    </p>
                                  </div>
                                  <CardContent className="p-4 text-start flex flex-col gap-2 max-w-[300px]">
                                    <div>
                                      <span className="font-semibold">
                                        Time:
                                      </span>{" "}
                                      {dayjs(item.appointmentStartTime).format(
                                        "hh:mm A",
                                      )}{" "}
                                      -{" "}
                                      {dayjs(item.appointmentEndTime).format(
                                        "hh:mm A",
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-semibold">
                                        Billing Code:
                                      </span>{" "}
                                      {item?.billingCode}
                                    </div>
                                    <div>
                                      <span className="font-semibold">
                                        Billing Code description:
                                      </span>{" "}
                                      {
                                        billingCode?.filter(
                                          (code) =>
                                            code.value === item?.billingCode,
                                        )[0]?.label
                                      }
                                    </div>
                                    <div>
                                      <span className="font-semibold capitalize">
                                        Status:
                                      </span>{" "}
                                      {
                                        visitStatusOptions.find(
                                          (option) =>
                                            option.value === item.visitStatus,
                                        )?.label
                                      }
                                    </div>
                                    <div>
                                      <span className="font-semibold">
                                        Caregiver:
                                      </span>{" "}
                                      {getFullName(
                                        item?.caregiver?.firstName as string,
                                        item?.caregiver?.lastName as string,
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-semibold">
                                        Patient:
                                      </span>{" "}
                                      {getFullName(
                                        item?.patient?.firstName as string,
                                        item?.patient?.lastName as string,
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-semibold">
                                        Patient Phone:
                                      </span>{" "}
                                      {item.patient?.phone}
                                    </div>
                                  </CardContent>
                                </div>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}

        <div className="border-l-4 px-4 mt-4 py-4 border-l-primary border">
          <p className="text-sm">Color Reference</p>

          <div className="flex gap-4 text-[10px] my-2">
            <div className={arrowVariants({ variant: "default" })}>
              Not Completed
            </div>
            <div className={arrowVariants({ variant: "unassigned" })}>
              Unassigned
            </div>
            <div className={arrowVariants({ variant: "completed" })}>
              Completed
            </div>
            <div className={arrowVariants({ variant: "onhold" })}>On Hold</div>
            <div className={arrowVariants({ variant: "cancelled" })}>
              Cancelled
            </div>
            <div className={arrowVariants({ variant: "hospitalized" })}>
              Hospitalized
            </div>
            <div className={arrowVariants({ variant: "missed" })}>Missed</div>
          </div>
        </div>
      </section>
      <MobileCalendar
        onOpen={() =>
          setOpenModal((prevState) => ({ ...prevState, openAppointment: true }))
        }
        onCalendarClick={(date) => {
          methods.setValue(
            "appointmentStartTime",
            addTimeToDate("08:00", date),
          );
          methods.setValue("appointmentEndTime", addTimeToDate("09:00", date));
          if (patient) {
            methods.setValue("patientId", patient as string);
          } else if (caregiver) {
            methods.setValue("caregiverId", caregiver as string);
          }
        }}
        schedules={schedules ?? []}
        onScheduleClick={onScheduleClick}
      />
      {monthOffset?.length === 0 && (
        <SideCalendar
          goToDay={(date) => {
            onOffsetChange(date);
          }}
          schedules={schedules ?? []}
        />
      )}
    </>
  );
};

export default ScheduleCalendar;
