import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const addPatientSignature = async (req: CustomRequest) => {
  let evv;
  const { patientScheduleId, ...rest } = await req.json();
  if (rest.id) {
    evv = await prisma.scheduleVisitVerification.update({
      where: {
        id: rest.id,
        providerId: req.user.providerId,
      },
      data: {
        signatureDate: new Date(),
        signature: { create: { mediaId: rest.mediaId } },
      },
    });
  } else {
    evv = await prisma.scheduleVisitVerification.create({
      data: {
        signature: { create: { mediaId: rest.mediaId } },
        signatureDate: new Date(),
        patientSchedule: { connect: { id: patientScheduleId } },
        provider: { connect: { id: req.user.providerId } },
      },
    });
  }
  return ApiResponse(evv, "Signature saved");
};

const POST = handler(authorizeUser, asyncWrapper(addPatientSignature));
export { POST };
