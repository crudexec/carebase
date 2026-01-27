import dayjs from "dayjs";
import { isEmpty } from "lodash";

import prisma from "@/prisma";

import {
  ApiResponse,
  asyncForEach,
  asyncWrapper,
  CustomRequest,
  ErrorResponse,
  resetTime,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const createRecurrence = async (req: CustomRequest) => {
  const data = await req.json();
  const { scheduleId, dates, ...rest } = data;

  if (!scheduleId) {
    return ErrorResponse("Schedule id is required", 400);
  }
  const schedule = await prisma.patientSchedule.findUnique({
    where: { id: scheduleId, providerId: req.user.providerId },
    include: { scheduleRecurrence: true },
  });

  if (!schedule) return ErrorResponse("Schedule not found", 404);

  if (!schedule?.scheduleRecurrence?.id && data?.isRecurringEvent) {
    await prisma.scheduleRecurrence.create({
      data: {
        ...rest,
        patientSchedule: { connect: { id: schedule?.id } },
        provider: { connect: { id: req.user.providerId } },
      },
    });
  }
  const {
    id: _id,
    scheduleRecurrence: _recurrence,
    ...scheduleData
  } = schedule;
  const startTime = dayjs(scheduleData.appointmentStartTime).format("HH:mm");
  const endTime = dayjs(scheduleData.appointmentEndTime).format("HH:mm");

  if (!isEmpty(rest)) {
    await asyncForEach(
      dates.filter(
        (date: string) =>
          dayjs(scheduleData.appointmentEndTime).format("YYYY-MM-DD") !==
          dayjs(date).format("YYYY-MM-DD"),
      ),
      async (date: Date) => {
        const schedule = await prisma.patientSchedule.create({
          data: {
            ...scheduleData,
            appointmentStartTime: resetTime(new Date(date), startTime),
            appointmentEndTime: resetTime(new Date(date), endTime),
            providerId: req.user?.providerId as string,
          },
        });
        await prisma.scheduleRecurrence.create({
          data: {
            ...rest,
            patientSchedule: { connect: { id: schedule?.id } },
            provider: { connect: { id: req.user.providerId } },
          },
        });
      },
    );

    return ApiResponse(null, "Recurrence added successfully");
  } else {
    return ApiResponse(null, "Recurrence created successfully");
  }
};

export const POST = handler(authorizeUser, asyncWrapper(createRecurrence));
