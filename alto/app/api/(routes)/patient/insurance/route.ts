import prisma from "@/prisma";
import { ObjectData } from "@/types";

import {
  ApiResponse,
  asyncForEach,
  asyncWrapper,
  CustomRequest,
  ErrorResponse,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const updateInsurance = asyncWrapper(async (req: CustomRequest) => {
  const body = await req.json();
  const { patientId } = body;
  const patient = await prisma.patient.findUnique({
    where: { id: patientId, providerId: req.user?.providerId },
  });
  if (!patient) {
    return ErrorResponse("patient does not exist", 400);
  }
  const newObj = {
    CMS: body.CMS,
    MEDICARE: body.MEDICARE,
    NON_MEDICARE: body.NON_MEDICARE,
    MANAGED_CARE: body.MANAGED_CARE,
    HOSPICE: body.HOSPICE,
  } as ObjectData;
  await prisma.patientInsurance.createMany({
    data: Object.keys(newObj)
      .filter((item) => !newObj[item]?.id)
      .map((key) => ({ patientId, type: key, ...newObj[key] })),
  });
  await asyncForEach(
    Object.keys(newObj).filter((item) => newObj[item]?.id),
    async (key) => {
      prisma.patientInsurance.update({
        where: {
          id: newObj[key].id,
          patient: { providerId: req.user?.providerId },
        },
        data: newObj[key],
      });
    },
  );

  return ApiResponse(null, "Patient insurance updated successfully");
});

const PUT = handler(authorizeUser, asyncWrapper(updateInsurance));
export { PUT };
