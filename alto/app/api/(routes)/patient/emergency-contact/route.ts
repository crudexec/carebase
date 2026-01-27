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

const updateEmergencyContact = asyncWrapper(async (req: CustomRequest) => {
  const body = await req.json();
  const { id, patientId, ...rest } = body;
  const patient = await prisma.patient.findUnique({
    where: { id: patientId, providerId: req.user?.providerId },
  });
  if (!patient) {
    return ErrorResponse("patient does not exist", 400);
  }
  if (id) {
    await prisma.patientEmergencyContact.update({
      where: { id, patient: { providerId: req.user?.providerId } },
      data: { ...rest },
    });
  } else {
    if (!isEmpty(pickValues(rest))) {
      const patientEmergencyContact =
        await prisma.patientEmergencyContact.create({
          data: { ...rest, patient: { connect: { id: patientId } } },
        });
      await prisma.patient.update({
        where: { id: patientId, providerId: req.user?.providerId },
        data: {
          patientEmergencyContact: {
            connect: { id: patientEmergencyContact.id },
          },
        },
      });
    }
  }
  return ApiResponse(null, "Patient emergency contact updated successfully");
});

const PUT = handler(authorizeUser, asyncWrapper(updateEmergencyContact));
export { PUT };
