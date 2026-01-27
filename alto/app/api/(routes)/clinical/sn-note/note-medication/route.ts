import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";
import { createSkilledNote } from "../helper";

const createOrUpdateNoteMedication = async (req: CustomRequest) => {
  let noteMedication;
  const {
    unscheduledVisitId,
    patientId,
    caregiverId,
    skilledNursingNoteId,
    snNoteType,
    ...rest
  } = await req.json();
  if (rest?.id) {
    noteMedication = await prisma.noteMedication.update({
      where: { id: rest?.id },
      data: { ...rest },
    });
  } else {
    if (skilledNursingNoteId) {
      noteMedication = await prisma.noteMedication.create({
        data: {
          ...rest,
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
      noteMedication = await prisma.noteMedication.create({
        data: {
          ...rest,
          skilledNursingNote: { connect: { id: skilledNursingNote?.id } },
        },
      });
    }
  }
  return ApiResponse(noteMedication, "Note Medication Detail saved!");
};

const POST = handler(
  authorizeUser,
  authorizeUpdateProvider("noteMedication", "skilledNursingNote"),
  asyncWrapper(createOrUpdateNoteMedication),
);

export { POST };
