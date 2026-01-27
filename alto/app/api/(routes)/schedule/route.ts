import { VisitStatus } from "@prisma/client";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  dateRange,
  generateUUID,
  getQuery,
  isActive,
  isTrue,
  resetTime,
} from "@/app/api/lib";
import prisma from "@/prisma";

import { authorizeUser, handler } from "../../middlewares";

const fetchSchedules = asyncWrapper(async (req: CustomRequest) => {
  const {
    patient,
    caregiver,
    inactivePatient,
    inactiveCaregiver,
    visitStatus,
    office,
    billingCode,
    startDate,
    endDate,
    status,
    date,
  } = getQuery(req);
  const user = req.user;

  const schedules = await prisma.patientSchedule.findMany({
    where: {
      active: isActive(status),
      ...(patient && { patientId: patient }),
      ...(caregiver && { caregiverId: caregiver }),
      ...(!isTrue(inactivePatient) &&
        !patient && {
          OR: [{ patient: { active: true } }, { patientId: null }],
        }),
      ...(!isTrue(inactiveCaregiver) &&
        !caregiver && {
          OR: [{ caregiver: { active: true } }, { caregiverId: null }],
        }),
      ...(visitStatus && {
        visitStatus: visitStatus?.toUpperCase() as VisitStatus,
      }),
      ...(billingCode && { billingCode: billingCode }),
      ...(startDate &&
        !date && {
          appointmentStartTime: {
            gte: resetTime(new Date(startDate as Date)),
            ...(endDate && { lt: resetTime(new Date(endDate as Date)) }),
          },
        }),
      ...(date && { appointmentStartTime: dateRange(date) }),
      ...(office === "all"
        ? {}
        : office
          ? { patient: { providerId: office as string } }
          : { patient: { providerId: user?.providerId as string } }),
      providerId: user?.providerId as string,
    },
    include: {
      patient: {
        include: {
          patientAdmission: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
      caregiver: true,
      scheduleRecurrence: true,
      scheduleVisitVerification: { include: { signature: true } },
      Assessment: true,
    },
  });

  return ApiResponse({ schedules, totalCount: schedules.length });
});

const createSchedule = asyncWrapper(async (req: CustomRequest) => {
  const groupId = generateUUID();
  const { patientId, caregiverId, ...rest } = await req.json();
  const schedule = await prisma.patientSchedule.create({
    data: {
      ...(patientId && { patient: { connect: { id: patientId } } }),
      ...(caregiverId && { caregiver: { connect: { id: caregiverId } } }),
      provider: { connect: { id: req.user?.providerId } },
      groupId,
      ...rest,
    },
  });
  return ApiResponse(schedule, "Schedule created successfully");
});

const updateSchedule = asyncWrapper(async (req: CustomRequest) => {
  const {
    id,
    patientId,
    caregiverId,
    startTime,
    endTime,
    recurrenceType,
    appointmentStartTime,
    appointmentEndTime,
    ...rest
  } = await req.json();
  let schedule;
  const user = req.user;
  schedule = await prisma.patientSchedule.findUnique({
    where: { id, providerId: user?.providerId as string },
  });
  // current event
  if (!recurrenceType || recurrenceType === "0") {
    await prisma.patientSchedule.update({
      where: { id, providerId: user?.providerId as string },
      data: {
        ...rest,
        ...(patientId && { patientId: patientId }),
        ...(caregiverId && { caregiverId: caregiverId }),
        appointmentStartTime,
        appointmentEndTime,
      },
    });
  } else if (recurrenceType === "1") {
    // all present  and future events
    await prisma.patientSchedule.updateMany({
      where: {
        groupId: schedule?.groupId,
        appointmentStartTime: {
          gte: resetTime(schedule?.appointmentStartTime as Date),
        },
        providerId: user?.providerId as string,
      },
      data: {
        ...rest,
        ...(patientId && { patientId: patientId }),
        ...(caregiverId && { caregiverId: caregiverId }),
      },
    });
  } else if (recurrenceType === "2") {
    // all events in the series
    await prisma.patientSchedule.updateMany({
      where: {
        groupId: schedule?.groupId,
        providerId: user?.providerId as string,
      },
      data: {
        ...rest,
        ...(patientId && { patientId: patientId }),
        ...(caregiverId && { caregiverId: caregiverId }),
      },
    });
  } else {
    // all events in the series
    await prisma.patientSchedule.updateMany({
      where: {
        groupId: schedule?.groupId,
        appointmentStartTime: {
          gte: resetTime(new Date(startTime)),
          lt: resetTime(new Date(endTime)),
        },
        providerId: user?.providerId as string,
      },
      data: {
        ...rest,
        ...(patientId && { patientId: patientId }),
        ...(caregiverId && { caregiverId: caregiverId }),
      },
    });
  }
  schedule = await prisma.patientSchedule.findUnique({
    where: { id, providerId: user?.providerId as string },
    include: { patient: true, caregiver: true, scheduleRecurrence: true },
  });
  return ApiResponse(schedule, "Schedule updated successfully");
});

const archiveSchedules = asyncWrapper(async (req: CustomRequest) => {
  const { ids, status: currentStatus } = await req.json();
  await prisma.patientSchedule.updateMany({
    where: {
      id: { in: ids || [] },
      providerId: req.user?.providerId as string,
    },
    data: {
      active: currentStatus === "active" ? false : true,
      archivedOn: currentStatus === "active" ? new Date() : null,
    },
  });
  return ApiResponse(
    null,
    `Schedule(s) ${currentStatus === "active" ? "archived" : "activated"} successfully`,
  );
});

const GET = handler(authorizeUser, fetchSchedules);
const POST = handler(authorizeUser, createSchedule);
const PUT = handler(authorizeUser, updateSchedule);
const DELETE = handler(authorizeUser, archiveSchedules);

export { DELETE, GET, POST, PUT };
