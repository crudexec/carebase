import prisma from "@/prisma";

import {
  ApiResponse,
  asyncForEach,
  asyncWrapper,
  CustomRequest,
} from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";

const createRecurrence = async (req: CustomRequest) => {
  const data = await req.json();
  const { dates, patientInsuranceId, disciplineId, ...rest } = data;
  await asyncForEach(dates, async (date: Date) => {
    await prisma.insurancePriorAuthorization.create({
      data: {
        ...rest,
        effectiveFrom: date,
        provider: { connect: { id: req.user?.providerId as string } },
        patientInsurance: { connect: { id: patientInsuranceId } },
        ...(disciplineId && { discipline: { connect: { id: disciplineId } } }),
      },
    });
  });
  return ApiResponse(null, "Recurrence added successfully");
};

const POST = handler(authorizeUser, asyncWrapper(createRecurrence));

export { POST };
