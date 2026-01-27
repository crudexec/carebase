import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";

const addSignature = async (req: CustomRequest) => {
  let evv;
  const { patientId, type, ...rest } = await req.json();
  if (rest?.id) {
    evv = await prisma.unscheduledVisit.update({
      where: { id: rest.id },
      data: {
        ...(type === "caregiver"
          ? {
              caregiverSignature: { create: { mediaId: rest.mediaId } },
              caregiverSignatureDate: new Date(),
            }
          : {
              patientSignature: { create: { mediaId: rest.mediaId } },
              patientSignatureDate: new Date(),
            }),
      },
    });
  } else {
    evv = await prisma.unscheduledVisit.create({
      data: {
        ...(type === "caregiver"
          ? {
              caregiverSignature: { create: { mediaId: rest.mediaId } },
              caregiverSignatureDate: new Date(),
            }
          : {
              patientSignature: { create: { mediaId: rest.mediaId } },
              patientSignatureDate: new Date(),
            }),
        patient: { connect: { id: patientId } },
        provider: { connect: { id: req.user.providerId } },
      },
    });
  }
  return ApiResponse(evv, "Signature saved");
};

const POST = handler(
  authorizeUser,
  authorizeUpdateProvider("unscheduledVisit"),
  asyncWrapper(addSignature),
);

export { POST };
