"use client";

import { useState } from "react";
import { Calendar } from "./calendar";

const OverviewCalendar = ({ eventDates }: { eventDates: Date[] }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-full xl:mx-auto overflow-auto rounded-t-md border min-w-full flex justify-center items-center">
      <Calendar
        mode="single"
        specialDates={eventDates}
        className="w-full"
      />
    </div>
  );
};

export default OverviewCalendar;
