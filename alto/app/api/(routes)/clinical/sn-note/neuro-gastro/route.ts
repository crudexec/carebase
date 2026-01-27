import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";
import { createSkilledNote } from "../helper";

const createOrUpdateNeuroGastro = async (req: CustomRequest) => {
  let neuroGastro;
  const {
    unscheduledVisitId,
    patientId,
    caregiverId,
    skilledNursingNoteId,
    snNoteType,
    ...rest
  } = await req.json();
  if (rest?.id) {
    neuroGastro = await prisma.neuroGastro.update({
      where: { id: rest?.id },
      data: { ...rest },
    });
  } else {
    if (skilledNursingNoteId) {
      neuroGastro = await prisma.neuroGastro.create({
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
      neuroGastro = await prisma.neuroGastro.create({
        data: {
          ...rest,
          skilledNursingNote: { connect: { id: skilledNursingNote?.id } },
        },
      });
    }
  }
  return ApiResponse(neuroGastro, "Neuro Gastro Detail saved!");
};

const POST = handler(
  authorizeUser,
  authorizeUpdateProvider("neuroGastro", "skilledNursingNote"),
  asyncWrapper(createOrUpdateNeuroGastro),
);

export { POST };
