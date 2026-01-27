import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  getQuery,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";
import { getAssessments } from "./helper";

const fetchAssessments = async (req: CustomRequest) => {
  const { patientId, status } = getQuery(req);
  const assessments = await getAssessments(patientId, status);
  return ApiResponse(assessments);
};

const createOrUpdateAssessment = async (req: CustomRequest) => {
  let assessment;
  const {
    patientId,
    patientScheduleId,
    caregiverId,
    dateCompleted,
    id,
    ...rest
  } = await req.json();

  if (id) {
    assessment = await prisma.assessment.update({ where: { id }, data: rest });
  } else {
    assessment = await prisma.assessment.create({
      data: {
        ...rest,
        patientId,
        caregiverId,
        providerId: req.user?.providerId as string,
        dateCompleted,
        patientScheduleId,
      },
    });
  }
  return ApiResponse(assessment, "Assessment saved!");
};

const deleteAssessment = asyncWrapper(async (req: CustomRequest) => {
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
    `Assessment(s) ${currentStatus === "active" ? "archived" : "restored"} successfully`,
  );
});

const GET = handler(authorizeUser, asyncWrapper(fetchAssessments));
const POST = handler(authorizeUser, asyncWrapper(createOrUpdateAssessment));
const DELETE = handler(authorizeUser, deleteAssessment);

export { DELETE, GET, POST };
