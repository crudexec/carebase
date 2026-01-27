import dayjs from "dayjs";

import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";
import { createSkilledNote } from "../helper";

const createOrUpdateVitalSigns = async (req: CustomRequest) => {
  let vitalSigns;
  const {
    unscheduledVisitId,
    scheduledVisitId,
    patientId,
    caregiverId,
    snNoteType,
    skilledNursingNoteId,
    ...rest
  } = await req.json();
  if (rest?.id) {
    vitalSigns = await prisma.vitalSigns.update({
      where: { id: rest?.id },
      data: { ...rest },
    });
  } else {
    const data = {
      ...rest,
      startTime: rest?.startTime
        ? rest?.startTime
        : dayjs().startOf("day").add(8, "hour"),
      endTime: rest?.endTime
        ? rest?.endTime
        : dayjs().startOf("day").add(9, "hour"),
      ...(scheduledVisitId && {
        scheduledVisit: { connect: { id: scheduledVisitId } },
      }),
    };
    if (skilledNursingNoteId) {
      vitalSigns = await prisma.vitalSigns.create({
        data: {
          ...data,
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

      vitalSigns = await prisma.vitalSigns.create({
        data: {
          ...data,
          skilledNursingNote: { connect: { id: skilledNursingNote?.id } },
        },
      });
    }
  }
  return ApiResponse(vitalSigns, "Vital Signs Detail saved!");
};

const POST = handler(
  authorizeUser,
  authorizeUpdateProvider("vitalSigns", "skilledNursingNote"),
  asyncWrapper(createOrUpdateVitalSigns),
);

export { POST };
