import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";
import { createSkilledNote } from "../helper";

const createOrUpdateIntervention = async (req: CustomRequest) => {
  let intervention;
  const {
    unscheduledVisitId,
    patientId,
    caregiverId,
    skilledNursingNoteId,
    snNoteType,
    ...rest
  } = await req.json();
  if (rest?.id) {
    intervention = await prisma.noteIntervention.update({
      where: { id: rest?.id },
      data: { ...rest },
    });
  } else {
    if (skilledNursingNoteId) {
      intervention = await prisma.noteIntervention.create({
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
      intervention = await prisma.noteIntervention.create({
        data: {
          ...rest,
          skilledNursingNote: { connect: { id: skilledNursingNote?.id } },
        },
      });
    }
  }
  return ApiResponse(intervention, "Intervention details saved successfully");
};
const POST = handler(
  authorizeUser,
  authorizeUpdateProvider("noteIntervention", "skilledNursingNote"),
  asyncWrapper(createOrUpdateIntervention),
);

export { POST };
