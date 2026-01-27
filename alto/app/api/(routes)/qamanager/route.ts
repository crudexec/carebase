import { QAStatus } from "@prisma/client";

import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  getQuery,
  isActive,
} from "../../lib";
import { authorizeUser, handler } from "../../middlewares";

const fetchAssessments = async (req: CustomRequest) => {
  const { patientId, status } = getQuery(req);
  const assessments = await prisma.assessment.findMany({
    where: {
      ...(patientId && { patientSchedule: { patientId: patientId as string } }),
      providerId: req.user?.providerId as string,
      active: isActive(status),
      submittedAt: {
        not: null,
      },
    },
    include: {
      patient: {
        include: {
          patientAdmission: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
      patientSchedule: {
        include: {
          patient: {
            include: {
              patientAdmission: { orderBy: { createdAt: "desc" }, take: 1 },
            },
          },
        },
      },
      caregiver: true,
    },
  });

  return ApiResponse({ assessments });
};

const updateQAStatus = async (req: CustomRequest) => {
  const { status, id, qaComment } = await req.json();
  const assessment = await prisma.assessment.update({
    where: { id },
    data: {
      qaStatus: status as QAStatus,
      qaComment,
      qaed: true,
    },
  });
  return ApiResponse(assessment, `QA ${status?.toLowerCase()}!`);
};

const archiveAssessments = asyncWrapper(async (req: CustomRequest) => {
  const { ids, status: currentStatus } = await req.json();
  await prisma.assessment.updateMany({
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

export const GET = handler(authorizeUser, asyncWrapper(fetchAssessments));
export const PUT = handler(authorizeUser, asyncWrapper(updateQAStatus));
export const DELETE = handler(authorizeUser, archiveAssessments);
