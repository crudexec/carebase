import { DPDay, useDatePicker } from "@rehookify/datepicker";
import clsx from "clsx";
import dayjs from "dayjs";
import _ from "lodash";
import { useEffect, useState } from "react";

import { visitStatusOptions } from "@/constants";
import { cn } from "@/lib";
import { PrintCalendarForm } from "@/schema";
import { PatientScheduleResponse } from "@/types";

const dayClassName = (className: string, { selected }: DPDay) =>
  clsx(className, {
    "opacity-100 border bg-secondary": selected,
  });

const Calendar = ({
  schedules,
  filter,
}: {
  schedules: PatientScheduleResponse[];
  filter?: PrintCalendarForm;
}) => {
  const [selectedDates, onDatesChange] = useState<Date[]>([]);
  const [offsetDate, onOffsetChange] = useState<Date>();
  const numMonths =
    new Date((filter?.dateRangeThrough as Date) || null).getMonth() -
    new Date((filter?.dateRangeFrom as Date) || null).getMonth();
  const numMonths2 =
    new Date((filter?.certPeriod?.[1] as Date) || null).getMonth() -
    new Date((filter?.certPeriod?.[0] as Date) || null).getMonth();
  const monthOffset =
    numMonths &&
    numMonths > 0 &&
    (filter?.calendarBy === "date-range" ||
      filter?.calendarBy === "cert-period")
      ? Array(filter?.calendarBy === "date-range" ? numMonths : numMonths2)
          .fill("")
          .map((_, i) => i + 1)
      : [];

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

  const groupedSchedules = _.groupBy(schedules, (item) => {
    return dayjs.utc(item.appointmentStartTime).format("YYYY-MM-DD");
  });

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (filter?.calendarBy === "date-range") {
      onOffsetChange(filter?.dateRangeFrom as Date);
    } else if (filter?.calendarBy === "week") {
      onOffsetChange(filter?.weekDay as Date);
    } else if (filter?.calendarBy === "cert-period") {
      onOffsetChange(filter?.certPeriod?.[0] as Date);
    } else if (filter?.calendarBy === "month") {
      onOffsetChange(new Date(`${filter?.year}-${filter?.month}-01`));
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [filter]);

  return (
    <section className="mb-4 rounded-2xl flex space-y-4 flex-col">
      {calendars.map(({ month, year, days }, index) => {
        const groupedDays = _.chunk(days, 7);
        const filteredDays = groupedDays.filter((item) => {
          const weekDay = dayjs(filter?.weekDay).format("YYYY-MM-DD");
          return item.some(
            (day) => dayjs(day.$date).format("YYYY-MM-DD") === weekDay,
          );
        })[0];

        return (
          <div key={index} className="border">
            <header className="pb-[13px] flex justify-between items-center">
              <p className="text-2xl font-bold bg-secondary p-2 flex gap-[25px] justify-center items-center mx-auto w-full text-center">
                {month}-{year}
              </p>
            </header>

            <div className="border-light-grey-outline dark:border-dark-grey-outline">
              <ul className="grid grid-cols-7 border-t border-x bg-secondary/50">
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
                {filter?.weekDay && filter?.printCalendarFor === "week"
                  ? filteredDays.map((day) => {
                      const dateKey = dayjs(day.$date).format("YYYY-MM-DD");
                      return (
                        <li
                          key={day.$date.toDateString()}
                          {...dayButton(day)}
                          className={cn(
                            dayClassName(
                              "border-r border-b hover:border-2 hover:bg-secondary text-light-grey-text hover:text-foreground font-medium hover:border-primary-orange min-h-[100px] xl:min-h-[150px] flex flex-col text-right",
                              day,
                            ),
                          )}
                        >
                          <p className="p-3">{day.day.replace(/^0+/, "")}</p>
                          <div className="w-full text-center relative">
                            {groupedSchedules[dateKey]?.map((item) => {
                              return (
                                <div
                                  key={item.id}
                                  className={cn(
                                    "text-[10px] relative line-clamp-1  text-center self-center w-full",
                                  )}
                                >
                                  <b className="lowercase">
                                    {dayjs(item.appointmentStartTime).format(
                                      "hh:mmA",
                                    )}{" "}
                                  </b>
                                  {`${Number(item.caregiver?.firstName?.length) <= 7 ? item?.caregiver?.firstName : `${item.caregiver?.firstName?.substring(0, 7)}...`}, ${item.caregiver?.lastName?.[0]}`}{" "}
                                  -{" "}
                                  {item.billingCode && `(${item.billingCode})`}{" "}
                                  {
                                    visitStatusOptions.find(
                                      (option) =>
                                        option.value === item.visitStatus,
                                    )?.abbv
                                  }
                                </div>
                              );
                            })}
                          </div>
                        </li>
                      );
                    })
                  : days
                      .slice(0, -7)
                      .concat(
                        days.slice(-7).every((day) => !day.inCurrentMonth)
                          ? []
                          : days.slice(-7),
                      )
                      .map((day) => {
                        const dateKey = dayjs(day.$date).format("YYYY-MM-DD");
                        return (
                          <li
                            key={day.$date.toDateString()}
                            {...dayButton(day)}
                            className={cn(
                              dayClassName(
                                "border-r border-b hover:border-2 hover:bg-secondary text-light-grey-text hover:text-foreground font-medium hover:border-primary-orange min-h-[100px] xl:min-h-[150px] flex flex-col text-right",
                                day,
                              ),
                            )}
                          >
                            <p className="p-3">{day.day.replace(/^0+/, "")}</p>
                            <div className="w-full text-center relative">
                              {groupedSchedules[dateKey]?.map((item) => {
                                return (
                                  <div
                                    key={item.id}
                                    className={cn(
                                      "text-[10px] relative line-clamp-1  text-center self-center w-full",
                                    )}
                                  >
                                    <b className="lowercase">
                                      {dayjs(item.appointmentStartTime).format(
                                        "hh:mmA",
                                      )}{" "}
                                    </b>
                                    {`${Number(item.caregiver?.firstName?.length) <= 7 ? item?.caregiver?.firstName : `${item.caregiver?.firstName?.substring(0, 7)}...`}, ${item.caregiver?.lastName?.[0]}`}{" "}
                                    -{" "}
                                    {item.billingCode &&
                                      `(${item.billingCode})`}{" "}
                                    {
                                      visitStatusOptions.find(
                                        (option) =>
                                          option.value === item.visitStatus,
                                      )?.abbv
                                    }
                                  </div>
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
    </section>
  );
};

export default Calendar;
