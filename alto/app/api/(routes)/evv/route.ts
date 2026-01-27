import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  ErrorResponse,
  getImageUrl,
  getQuery,
} from "../../lib";
import { authorizeUser, handler } from "../../middlewares";

const scheduleVisitVerification = async (req: CustomRequest) => {
  const user = req.user;
  const { scheduleId } = getQuery(req);
  if (!scheduleId) {
    return ErrorResponse("Schedule ID is required", 400);
  }
  const evv = await prisma.scheduleVisitVerification.findUnique({
    where: { patientScheduleId: scheduleId, providerId: user.providerId },
    include: {
      signature: true,
      patientSchedule: {
        include: {
          patient: {
            include: {
              patientAdmission: {
                orderBy: { createdAt: "desc" },
                take: 1,
                include: { actionBy: true },
              },
            },
          },
        },
      },
    },
  });
  return ApiResponse({
    evv: {
      ...evv,
      patientSignature: await getImageUrl(
        user?.providerId as string,
        evv?.signature?.mediaId,
      ),
    },
  });
};

const createOrUpdateVisitVerifications = async (req: CustomRequest) => {
  let evv;
  const { patientScheduleId, ...rest } = await req.json();
  if (rest.id) {
    evv = await prisma.scheduleVisitVerification.update({
      where: { id: rest.id, providerId: req.user.providerId },
      data: { ...rest },
    });
  } else {
    evv = await prisma.scheduleVisitVerification.create({
      data: {
        ...rest,
        patientSchedule: { connect: { id: patientScheduleId } },
      },
    });
  }
  return ApiResponse(evv, "Schedule Visit Verification Detail saved!");
};

const POST = handler(
  authorizeUser,
  asyncWrapper(createOrUpdateVisitVerifications),
);
const GET = handler(authorizeUser, asyncWrapper(scheduleVisitVerification));

export { GET, POST };
