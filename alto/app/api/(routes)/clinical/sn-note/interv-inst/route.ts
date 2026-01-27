import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";
import { createSkilledNote } from "../helper";

const createOrUpdateIntervInst = async (req: CustomRequest) => {
  let intervInst;
  const {
    unscheduledVisitId,
    patientId,
    caregiverId,
    skilledNursingNoteId,
    snNoteType,
    ...rest
  } = await req.json();
  if (rest?.id) {
    intervInst = await prisma.noteIntervInst.update({
      where: { id: rest?.id },
      data: { ...rest },
    });
  } else {
    if (skilledNursingNoteId) {
      intervInst = await prisma.noteIntervInst.create({
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
      intervInst = await prisma.noteIntervInst.create({
        data: {
          ...rest,
          skilledNursingNote: { connect: { id: skilledNursingNote?.id } },
        },
      });
    }
  }
  return ApiResponse(intervInst, "Intervention Detail saved!");
};

const POST = handler(
  authorizeUser,
  authorizeUpdateProvider("noteIntervInst", "skilledNursingNote"),
  asyncWrapper(createOrUpdateIntervInst),
);

export { POST };
