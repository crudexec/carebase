"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ScheduleCard from "./schedule-card";
import NoActivity from "./no-activity";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AllEvents } from "@/types/Events";
import { retrieveEmployeeEvents } from "@/use-cases/events";
import { formatEmployeeEvents } from "@/components/events/employee-events/helpers";
import { EmployeeEventType } from "@/components/events/employee-events/types";
import { format } from "date-fns";
import { formatDate } from "@/utils";
import Loader from "@/components/Loader";

export type EmployeeOverviewType = EmployeeEventType & {};

const ScheduleContainer = () => {
  const token = localStorage.getItem("token") as string;
  const [noActivity, setNoActivity] = useState<boolean>(true);
  const [events, setEvents] = useState<EmployeeOverviewType[]>([]);

  const { data: allEvents, isLoading: allEventsLoading } = useQuery<AllEvents>({
    queryKey: ["employeeEvents"],
    queryFn: async () => await retrieveEmployeeEvents(token),
  });

  useEffect(() => {
    if (
      allEvents &&
      Array.isArray(allEvents.data) &&
      allEvents.data.length > 0
    ) {
      const eventsData = formatEmployeeEvents(allEvents);
      const today = new Date();

      const filteredEvents = eventsData.filter((event) => {
        const eventDate = new Date(event.date);

        return (
          eventDate > today ||
          (eventDate.toDateString() === today.toDateString() &&
            event.end >= today.toTimeString().slice(0, 5))
        );
      });

      setEvents(filteredEvents);
    }
  }, [allEvents]);

  useEffect(() => {
    if (events && events.length === 0) {
      setNoActivity(true);
    } else {
      setNoActivity(false);
    }
  }, [events]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 2 }}
      className={`border-l-[1px] border-r-[1px] border-b-[1px] w-full border-[#E4E4E7] h-fit pb-20 xl:pb-10 xl:h-[700px] rounded-b-[8px] flex flex-col gap-7 overflow-auto p-5 ${
        noActivity && "border-[1px] xl:h-[80vh] rounded-[8px]"
      }`}
    >
      {allEventsLoading ? (
        <Loader height="h-full" />
      ) : (
        <>
          <div
            className={`w-full flex justify-between ${
              noActivity ? "mt-0" : "mt-5"
            }`}
          >
            <h2 className="text-[18px] font-[600] text-[#101828]">Schedule</h2>
            {!noActivity && (
              <Link
                href="/schedule"
                className="text-[#2563EB] text-[15px] font-[600] hover:underline"
              >
                View More
              </Link>
            )}
          </div>

          {noActivity && (
            <NoActivity
              title="No Active Schedules"
              description="Your active schedules will appear here."
            />
          )}

          {!noActivity && (
            <div className="mt-5 flex flex-col gap-5">
              {events
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((event, index) => {
                  const formattedDate = `${format(
                    new Date(event.start),
                    "eeee"
                  )}
      ${formatDate(new Date(event.end))}`;

                  // Set background color based on index
                  let background;
                  if (index < 2) {
                    background = "#FDA29B"; // First two posts
                  } else if (index < 4) {
                    background = "#FEC84B"; // Next seven posts
                  } else {
                    background = "#6CE9A6"; // Rest of the posts
                  }

                  return (
                    <ScheduleCard
                      key={event.id}
                      clientName={event.client}
                      date={formattedDate}
                      startTime={event.content.start}
                      background={background}
                    />
                  );
                })}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ScheduleContainer;
