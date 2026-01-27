import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { DPDay, useDatePicker } from "@rehookify/datepicker";
import clsx from "clsx";
import dayjs from "dayjs";
import _ from "lodash";
import { useState } from "react";

import { billingCode, visitStatusOptions } from "@/constants";
import { cn, getFullName } from "@/lib";
import { PatientScheduleResponse } from "@/types";

import { Button, CardContent, Tooltip } from "../ui";
import { arrowVariants, BgProps, bgVariants } from "./calendar";

const dayClassName = (
  className: string,
  { selected, disabled, inCurrentMonth, now }: DPDay,
) =>
  clsx(className, {
    "bg-secondary hover:bg-primary opacity-100": selected,
    "opacity-25 cursor-not-allowed": disabled,
    "text-black/50 dark:text-white/50": !inCurrentMonth,
    "border border-primary": now,
  });

type CalendarProps = {
  onOpen: () => void;
  schedules?: PatientScheduleResponse[];
  onCalendarClick: (date: Date) => void;
  onScheduleClick: (schedule: PatientScheduleResponse) => void;
};

const MobileCalendar = ({
  onOpen,
  onCalendarClick,
  schedules,
  onScheduleClick,
}: CalendarProps) => {
  const [selectedDates, onDatesChange] = useState<Date[]>([]);
  const [offsetDate, onOffsetChange] = useState<Date>(new Date());

  const {
    data: { weekDays, calendars },
    propGetters: { addOffset, subtractOffset, dayButton },
  } = useDatePicker({
    selectedDates,
    onDatesChange,
    // we want to manipulate with offsetDate outside of the hook
    offsetDate,
    onOffsetChange,
  });
  const groupedSchedules = _.groupBy(schedules, (event) => {
    return dayjs.utc(event.appointmentStartTime).format("YYYY-MM-DD");
  });
  const { month, year, days } = calendars[0];

  return (
    <div className="lg:hidden w-full">
      <section className="rounded-2xl w-full border pt-5">
        <header className="flex justify-between items-center pl-[20px] pr-[16px] pb-[20px]">
          <p className="text-sm font-bold">
            {month} {year}
          </p>

          <div className="flex gap-1">
            <div className="flex items-center">
              <Button
                className="rounded-r-none border-r px-3 py-2"
                size="custom"
                {...subtractOffset({ months: 1 })}
              >
                <ChevronLeftIcon />
              </Button>

              <Button
                size="custom"
                className="rounded-l-none px-3 py-2"
                {...addOffset({ months: 1 })}
              >
                <ChevronRightIcon />
              </Button>
            </div>
            <Button size="custom" className="px-3 py-1 font-normal">
              Today
            </Button>
          </div>
        </header>

        <div className="border-light-grey-outline dark:border-dark-grey-outline">
          <ul className="grid grid-cols-7 justify-items-center bg-secondary py-2">
            {weekDays.map((day) => (
              <li
                key={`${month}-${day}`}
                className={cn(
                  "font-medium text-xs text-center w-full h-fit px-[15px]",
                )}
              >
                {day.substring(0, 3)}
              </li>
            ))}
          </ul>
          <ul className="grid grid-cols-7 justify-items-center">
            {/* remove the last 7 days if they are not in current month */}
            {days
              .slice(0, -7)
              .concat(
                days.slice(-7).every((day) => !day.inCurrentMonth)
                  ? []
                  : days.slice(-7),
              )
              .map((day) => {
                return (
                  <li
                    key={day.$date.toDateString()}
                    {...dayButton(day)}
                    className={dayClassName(
                      clsx(
                        "text-xs border-t border-l font-medium  min-h-24 hover:bg-secondary hover:text-foreground text-right w-full",
                      ),
                      day,
                    )}
                    onClick={() => {
                      onCalendarClick(day.$date);
                      onOpen();
                    }}
                  >
                    <p>{day.day.replace(/^0+/, "")}</p>
                    {groupedSchedules[
                      dayjs(day.$date).format("YYYY-MM-DD")
                    ]?.map((item, index) => {
                      return (
                        <Tooltip
                          key={index}
                          trigger={
                            <div
                              key={item.id}
                              className={cn(
                                bgVariants({
                                  variant: item.visitStatus?.toLowerCase(),
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
                              <p className="text-2xl text-center">{`${item?.caregiver?.firstName} ${item?.caregiver?.lastName}`}</p>
                            </div>
                            <CardContent className="p-4 text-start flex flex-col gap-2 max-w-[300px]">
                              <div>
                                <span className="font-semibold">Time:</span>{" "}
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
                                    (code) => code.value === item?.billingCode,
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
                                <span className="font-semibold">Patient:</span>{" "}
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
                  </li>
                );
              })}
          </ul>
        </div>
      </section>
      <div className="border-l-4 px-4 border mt-4 py-4 border-l-primary">
        <p className="text-sm">Color Reference</p>

        <div className="flex  flex-wrap gap-4 text-[10px] my-2">
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
    </div>
  );
};

export default MobileCalendar;
