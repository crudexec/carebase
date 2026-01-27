import { PatientSchedule } from "@prisma/client";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { DPDay, useDatePicker } from "@rehookify/datepicker";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";
import dayjs from "dayjs";
import _ from "lodash";
import { useState } from "react";

import { cn } from "@/lib";

import { Button } from "../ui";

const dayClassName = (
  className: string,
  { selected, disabled, inCurrentMonth, now }: DPDay,
) =>
  clsx(className, {
    "bg-secondary hover:bg-primary border opacity-100": selected,
    "opacity-25 cursor-not-allowed": disabled,
    "text-black/50 dark:text-white/50": !inCurrentMonth,
    "border border-primary": now,
  });

export const bgVariants = cva("border text-center", {
  variants: {
    variant: {
      default: "",
      not_completed: "bg-gray-800 text-white",
      unassigned: "bg-gray-400 text-white",
      completed: "bg-green-500 text-white",
      on_hold: "bg-yellow-500 text-white",
      cancelled: "bg-red-500 text-white",
      hospitalized: "bg-blue-500 text-white",
      missed: "bg-purple-500 text-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
type BgProps = VariantProps<typeof bgVariants>;

const SideCalendar = ({
  goToDay,
  schedules,
}: {
  goToDay: (date: Date) => void;
  schedules: PatientSchedule[];
}) => {
  const [selectedDates, onDatesChange] = useState<Date[]>([]);
  const [offsetDate, onOffsetChange] = useState<Date>(new Date());
  const {
    data: { weekDays, calendars },
    propGetters: { addOffset, subtractOffset, dayButton },
  } = useDatePicker({
    calendar: {
      offsets: [1, 2, 3, 4],
    },
    selectedDates,
    onDatesChange,
    offsetDate,
    onOffsetChange,
  });
  const groupedSchedules = _.groupBy(schedules, (event) => {
    return dayjs.utc(event.appointmentStartTime).format("YYYY-MM-DD");
  });

  return (
    <section className="rounded-2xl lg:block hidden w-fit">
      <header className="flex justify-end items-center pb-2">
        <div className="flex gap-[25px] items-center">
          <div className="flex gap-1">
            <div className="flex items-center">
              <Button
                size="custom"
                className="rounded-r-none border-r px-3 py-2"
                {...subtractOffset({ months: 5 })}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                size="custom"
                className="rounded-l-none px-3 py-2"
                {...addOffset({ months: 5 })}
              >
                <ChevronRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <section className="flex flex-col gap-2">
        {calendars.map(({ month, year, days }, index) => (
          <div key={index}>
            <div className="flex justify-between items-center">
              <p className="text-base font-bold bg-secondary p-1 flex gap-[25px] justify-center items-center mx-auto w-full text-center">
                {month}-{year}
              </p>
            </div>

            <div>
              <ul className="grid grid-cols-7 border-t border-l bg-secondary/50">
                {weekDays.map((day) => (
                  <li
                    key={`${month}-${day}`}
                    className={cn(
                      "font-medium text-xs text-center h-fit border-r pr-[15px] pl-[4px]",
                    )}
                  >
                    {day.substring(0, 3)}
                  </li>
                ))}
              </ul>
              <ul className="grid grid-cols-7 border-r border-b">
                {days
                  .slice(0, -7)
                  .concat(
                    days.slice(-7).every((day) => !day.inCurrentMonth)
                      ? []
                      : days.slice(-7),
                  )
                  .map((day) => (
                    <li
                      key={day.$date.toDateString()}
                      {...dayButton(day)}
                      className={cn(
                        dayClassName(
                          "text-xs p-1.5 border-t border-l font-medium hover:bg-secondary hover:text-foreground text-right w-full",
                          day,
                        ),
                        bgVariants({
                          variant:
                            groupedSchedules[
                              dayjs(day.$date).format("YYYY-MM-DD")
                            ]?.[0]?.visitStatus?.toLowerCase(),
                        } as BgProps),
                      )}
                      onClick={() => goToDay(day.$date)}
                    >
                      <p>{day.day.replace(/^0+/, "")}</p>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ))}
      </section>
    </section>
  );
};

export default SideCalendar;
