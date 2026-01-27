import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

type ParamProps = { params: { id: string } };

const fetchSchedule = async (
  req: CustomRequest,
  { params: { id } }: ParamProps,
) => {
  const patientSchedule = await prisma.patientSchedule.findUnique({
    where: { id: id as string, providerId: req.user?.providerId as string },
    include: {
      patient: {
        include: {
          patientAdmission: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });
  return ApiResponse({ patientSchedule });
};

export const GET = handler(authorizeUser, asyncWrapper(fetchSchedule));
