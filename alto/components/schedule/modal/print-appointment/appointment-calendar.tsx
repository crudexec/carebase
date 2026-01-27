import dayjs from "dayjs";
import React from "react";

import Detail from "@/components/detail";
import { useGetSchedules } from "@/hooks";
import { formatDate } from "@/lib";
import { PrintCalendarForm } from "@/schema/schedule/calendar";

import Calendar from "./calendar";

type Props = {
  filter?: PrintCalendarForm;
};

const PrintAppointmentCalendar = React.forwardRef<HTMLDivElement, Props>(
  ({ filter }, ref) => {
    const { data } = useGetSchedules({
      patient: filter?.allPatient ? "" : filter?.patient,
      caregiver: filter?.allCaregiver ? "" : filter?.caregiver,
      visitStatus: filter?.visitStatus,
      office: filter?.allOffice ? "all" : filter?.office,
    });

    return (
      <div ref={ref} className="px-8" id="print-box">
        <p className="flex items-center gap-2 justify-center text-sm font-bold">
          Appointment Calendar for{" "}
          {filter?.printCalendarFor === "patient" ? "Patient" : "Caregiver"}
          <span className="!text-lg uppercase">
            {filter?.printCalendarFor === "patient"
              ? `${data?.data?.schedules?.[0]?.patient?.firstName}, ${data?.data?.schedules?.[0]?.patient?.lastName}`
              : `${data?.data?.schedules?.[0]?.caregiver?.firstName}, ${data?.data?.schedules?.[0]?.caregiver?.lastName}`}
          </span>
        </p>

        {filter?.printCalendarFor === "patient" ? (
          <div className="grid grid-col-1 md:grid-cols-2 gap-2 !text-sm border p-2 mt-4">
            <Detail
              title="Admit Date"
              detail={
                data?.data?.schedules?.[0]?.patient?.patientAdmission[0]
                  ?.createdAt
                  ? formatDate(
                      data?.data?.schedules?.[0]?.patient?.patientAdmission[0]
                        ?.createdAt,
                    )
                  : ""
              }
            />
            {/* <Detail title="PAN" detail={''} /> */}
            <Detail
              title="Address"
              detail={data?.data?.schedules?.[0]?.patient?.address1}
            />
            <Detail
              title="Phone"
              detail={data?.data?.schedules?.[0]?.patient?.phone}
            />
            <Detail
              title="Physician"
              detail={data?.data?.schedules?.[0]?.patient?.supervisingPhysician}
            />
            <Detail
              title="DOB"
              detail={
                data?.data?.schedules?.[0]?.patient?.dob
                  ? dayjs(data?.data?.schedules?.[0]?.patient?.dob).format(
                      "DD/MM/YYYY",
                    )
                  : ""
              }
            />
            {/* <Detail title="Primary Diag" detail={''} /> */}
            <Detail
              title="Emergency Contact"
              detail={data?.data?.schedules?.[0]?.patient?.address2}
            />
            <Detail
              title="Emergency Phone"
              detail={data?.data?.schedules?.[0]?.patient?.phone}
            />
            {/* <Detail title="Frequency" detail={''} /> */}
          </div>
        ) : (
          <div className="grid grid-col-1 md:grid-cols-2 gap-2 !text-sm border p-2 mt-4">
            <Detail
              title="Discipline"
              detail={data?.data?.schedules?.[0]?.caregiver?.notes}
            />
            <Detail
              title="Address"
              detail={data?.data?.schedules?.[0]?.caregiver?.addressLine1}
            />
            <Detail
              title="Title"
              detail={data?.data?.schedules?.[0]?.caregiver?.jobTitle}
            />
            <Detail
              title="Emergency Contact"
              detail={data?.data?.schedules?.[0]?.caregiver?.addressLine2}
            />
            <Detail
              title="Phone"
              detail={data?.data?.schedules?.[0]?.caregiver?.homePhone}
            />
            <Detail
              title="Cell"
              detail={data?.data?.schedules?.[0]?.caregiver?.cellPhone}
            />
          </div>
        )}
        <Calendar schedules={data?.data?.schedules ?? []} filter={filter} />
      </div>
    );
  },
);

PrintAppointmentCalendar.displayName = "PrintAppointmentCalendar";

export default PrintAppointmentCalendar;
