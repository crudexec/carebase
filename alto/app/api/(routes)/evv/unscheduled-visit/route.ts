import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  getQuery,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const getUnscheduledVisits = async (req: CustomRequest) => {
  const { caregiverId } = getQuery(req);
  const unscheduledVisits = await prisma.unscheduledVisit.findMany({
    where: {
      ...(req.user.role === "caregiver" && { caregiverId }),
      providerId: req.user.providerId,
    },
    include: {
      patientSignature: true,
      caregiverSignature: true,
      patient: true,
    },
  });
  return ApiResponse(unscheduledVisits);
};

const createOrUpdateUnscheduledVisit = async (req: CustomRequest) => {
  let unscheduledVisit;
  const { patientId, caregiverId, ...rest } = await req.json();
  if (rest?.id) {
    unscheduledVisit = await prisma.unscheduledVisit.update({
      where: { id: rest.id },
      data: { ...rest },
    });
  } else {
    unscheduledVisit = await prisma.unscheduledVisit.create({
      data: {
        ...rest,
        patient: { connect: { id: patientId } },
        caregiver: { connect: { id: caregiverId } },
        provider: { connect: { id: req.user.providerId } },
      },
    });
  }
  return ApiResponse(unscheduledVisit, "Unscheduled Visit Detail saved!");
};

const POST = handler(
  authorizeUser,
  asyncWrapper(createOrUpdateUnscheduledVisit),
);
const GET = handler(authorizeUser, asyncWrapper(getUnscheduledVisits));
export { GET, POST };
