import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../../../lib";
import { authorizeUser, handler } from "../../../../../middlewares";
import { createSkilledNote } from "../../helper";

const createOrUpdateQASginature = async (req: CustomRequest) => {
  let qASignature;
  const {
    unscheduledVisitId,
    patientId,
    caregiverId,
    skilledNursingNoteId,
    snNoteType,
    signatureType,
    mediaId,
    id,
  } = await req.json();
  if (id) {
    qASignature = await prisma.qASignature.update({
      where: { id: id },
      data: {
        ...(signatureType === "nurse"
          ? {
              nurseSignature: { create: { mediaId: mediaId } },
              nurseSignatureDate: new Date(),
            }
          : {
              patientSignature: { create: { mediaId: mediaId } },
              patientSignatureDate: new Date(),
            }),
      },
    });
  } else {
    if (skilledNursingNoteId) {
      qASignature = await prisma.qASignature.create({
        data: {
          ...(signatureType === "nurse"
            ? {
                nurseSignature: { create: { mediaId: mediaId } },
                nurseSignatureDate: new Date(),
              }
            : {
                patientSignature: { create: { mediaId: mediaId } },
                patientSignatureDate: new Date(),
              }),
          skilledNursingNote: { connect: { id: skilledNursingNoteId } },
        },
      });
    } else {
      const skilledNursingNote = await createSkilledNote({
        unscheduledVisitId,
        patientId,
        caregiverId,
        snNoteType,
        providerId: req.user?.providerId as string,
      });
      qASignature = await prisma.qASignature.create({
        data: {
          ...(signatureType === "nurse"
            ? {
                nurseSignature: { create: { mediaId: mediaId } },
                nurseSignatureDate: new Date(),
              }
            : {
                patientSignature: { create: { mediaId: mediaId } },
                patientSignatureDate: new Date(),
              }),
          skilledNursingNote: { connect: { id: skilledNursingNote?.id } },
        },
      });
    }
  }
  return ApiResponse(qASignature, "QA Signature Detail saved!");
};

const POST = handler(
  authorizeUser,
  authorizeUpdateProvider("qASignature", "skilledNursingNote"),
  asyncWrapper(createOrUpdateQASginature),
);

export { POST };
