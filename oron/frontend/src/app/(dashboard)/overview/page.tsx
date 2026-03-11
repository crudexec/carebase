"use client";

import { capitalizeFirstLetter } from "@/utils";
import Loader from "../../../components/Loader";
import useUser from "@/hooks/useUser";
import PageContainer from "@/components/PageContainer";
import ClientCard from "./client-card";
import OverviewCalendar from "./overview-calendar";
import ScheduleContainer, { EmployeeOverviewType } from "./schedule-container";
import ActiveClientsCard from "./active-clients-container";
import { useQuery } from "@tanstack/react-query";
import { AllEvents } from "@/types/Events";
import { retrieveEmployeeEvents } from "@/use-cases/events";
import {
  getClosestFutureEvent,
  getEventsDates,
} from "@/components/events/employee-events/helpers";
import { EmployeeEventType } from "@/components/events/employee-events/types";
import { useState, useEffect } from "react";
import { formatDistance } from "date-fns";
import QuickActions from "@/components/dashboard/QuickActions";

const OverviewPage = () => {
  const { data, isLoading } = useUser();
  const token = localStorage.getItem("token") as string;

  const { data: allEvents, isLoading: allEventsLoading } = useQuery<AllEvents>({
    queryKey: ["employeeEvents"],
    queryFn: async () => await retrieveEmployeeEvents(token),
  });
  const [nextSchedule, setNextSchedule] = useState<EmployeeEventType | null>();
  const [eventDates, setEventDates] = useState<Date[]>([]);

  useEffect(() => {
    if (
      allEvents &&
      Array.isArray(allEvents.data) &&
      allEvents.data.length > 0
    ) {
      const nextScheduleData = getClosestFutureEvent(allEvents);
      setNextSchedule(nextScheduleData);

      const eventDates = getEventsDates(allEvents);
      setEventDates(eventDates);
    }
  }, [allEvents]);

  if (isLoading || allEventsLoading) {
    return <Loader />;
  }

  return (
    <PageContainer>
      <section className="h-full flex flex-col gap-5 xl:flex-row">
        <div className="xl:w-[65%] h-full flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-[20px] sm:text-[25px] md:text-[36px] font-[700] text-[#0F172A]">
              Welcome back,{" "}
              {capitalizeFirstLetter(`${data?.data.first_name ?? "-"}`)}
              👋
            </h1>

            {nextSchedule && (
              <p className="text-[14px] sm:text-[16px] font-[500] text-[#475467]">
                You have{" "}
                <span className="text-[#2563EB]">
                  {formatDistance(new Date(nextSchedule.date), new Date())}
                </span>{" "}
                to your next visit
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <QuickActions userRole={data?.data?.role} />

          {allEvents && allEvents?.data?.length > 0 && nextSchedule && (
            <ClientCard nextSchedule={nextSchedule} />
          )}

          <ActiveClientsCard />
        </div>

        <div className="xl:w-[35%] h-full flex flex-col xl:justify-end">
          {allEvents && allEvents?.data?.length > 0 && (
            <OverviewCalendar eventDates={eventDates} />
          )}

          <ScheduleContainer />
        </div>
      </section>
    </PageContainer>
  );
};

export default OverviewPage;
