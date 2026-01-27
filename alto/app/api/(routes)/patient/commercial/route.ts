import { isEmpty } from "lodash";

import prisma from "@/prisma";

import { pickValues } from "../../../../../lib";
import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  ErrorResponse,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const updateCommercial = asyncWrapper(async (req: CustomRequest) => {
  const body = await req.json();
  const { id, patientId, ...rest } = body;
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) {
    return ErrorResponse("patient does not exist", 400);
  }
  if (id) {
    await prisma.patientCommercial.update({
      where: { id, patient: { providerId: req.user?.providerId } },
      data: { ...rest },
    });
  } else {
    if (!isEmpty(pickValues(rest))) {
      const patientCommercial = await prisma.patientCommercial.create({
        data: { ...rest, patient: { connect: { id: patientId } } },
      });
      await prisma.patient.update({
        where: { id: patientId, providerId: req.user?.providerId },
        data: { patientCommercial: { connect: { id: patientCommercial.id } } },
      });
    }
  }
  return ApiResponse(null, "Patient commercial updated successfully");
});

const PUT = handler(authorizeUser, asyncWrapper(updateCommercial));
export { PUT };
