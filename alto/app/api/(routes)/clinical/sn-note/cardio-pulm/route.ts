import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";
import { createSkilledNote } from "../helper";

const createOrUpdateCardioPulm = async (req: CustomRequest) => {
  let cardioPulm;
  const {
    unscheduledVisitId,
    patientId,
    caregiverId,
    skilledNursingNoteId,
    snNoteType,
    ...rest
  } = await req.json();
  if (rest?.id) {
    cardioPulm = await prisma.cardioPulmonary.update({
      where: { id: rest?.id },
      data: { ...rest },
    });
  } else {
    if (skilledNursingNoteId) {
      cardioPulm = await prisma.cardioPulmonary.create({
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
      cardioPulm = await prisma.cardioPulmonary.create({
        data: {
          ...rest,
          skilledNursingNote: { connect: { id: skilledNursingNote?.id } },
        },
      });
    }
  }
  return ApiResponse(cardioPulm, "Cardio Pulm Detail saved!");
};

const POST = handler(
  authorizeUser,
  authorizeUpdateProvider("cardioPulmonary", "skilledNursingNote"),
  asyncWrapper(createOrUpdateCardioPulm),
);

export { POST };
