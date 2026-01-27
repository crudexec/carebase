import { DPDay } from "@rehookify/datepicker";
import dayjs from "dayjs";
import React from "react";

import { visitStatusOptions } from "@/constants";
import { addTimeToDate, cn } from "@/lib";
import { PatientScheduleResponse } from "@/types";

import { bgVariants } from "./side-calendar";

const CalendarWeeek = ({
  days,
  groupedSchedules,
}: {
  days: DPDay[];
  groupedSchedules: {
    [key: string]: PatientScheduleResponse[];
  };
}) => {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="grid grid-cols-[70px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] w-full">
          <th className="border-input border-[0.5px] bg-secondary font-medium uppercase"></th>
          {days?.map((item, index) => (
            <th
              className="border-input border-[0.5px]  bg-secondary font-medium capitalize"
              key={index}
            >
              {dayjs(item?.$date).format("ddd DD/MM")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[
          "all day",
          "all day",
          "00:00",
          "00:30",
          "01:00",
          "01:30",
          "02:00",
          "02:30",
          "03:00",
          "03:30",
          "04:00",
          "04:30",
          "05:00",
          "05:30",
          "06:00",
          "06:30",
          "07:00",
          "07:30",
          "08:00",
          "08:30",
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30",
          "13:00",
          "13:30",
          "14:00",
          "14:30",
          "15:00",
          "15:30",
          "16:00",
          "16:30",
          "17:00",
          "17:30",
          "18:00",
          "18:30",
          "19:00",
          "19:30",
          "20:00",
          "20:30",
          "21:00",
          "21:30",
          "22:00",
          "22:30",
          "23:00",
          "23:30",
        ].map((time, index) => {
          return (
            <tr
              className="grid grid-cols-[70px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] w-full"
              key={index}
            >
              <td className="border-input border-[0.5px] bg-secondary font-medium text-center">
                {index === 0 ? (
                  time
                ) : time.split(":")[1] === "30" || index === 1 ? (
                  <span className="text-transparent">{time}</span>
                ) : (
                  dayjs(addTimeToDate(time)).format("ha")
                )}
              </td>
              {days?.map((day, index) => {
                const dateKey = dayjs(day.$date).format("YYYY-MM-DD");
                return (
                  <td className="border-input border-[0.5px]" key={index}>
                    {groupedSchedules[dateKey]
                      ?.filter(
                        (item) =>
                          dayjs(item.appointmentStartTime).format("hh:mm") ===
                          time,
                      )
                      .map((item) => {
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "text-[10px] relative line-clamp-1  text-center self-center w-full",
                              bgVariants,
                            )}
                          >
                            <b className="lowercase">
                              {dayjs(item.appointmentStartTime).format(
                                "hh:mmA",
                              )}{" "}
                            </b>
                            {`${Number(item.caregiver?.firstName?.length) <= 7 ? item?.caregiver?.firstName : `${item.caregiver?.firstName?.substring(0, 7)}...`}, ${item.caregiver?.lastName?.[0]}`}{" "}
                            - {item.billingCode && `(${item.billingCode})`}{" "}
                            {
                              visitStatusOptions.find(
                                (option) => option.value === item.visitStatus,
                              )?.abbv
                            }
                          </div>
                        );
                      })}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default CalendarWeeek;
