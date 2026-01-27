import { SkinAndWound, Wound } from "@prisma/client";

import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import { pickValues } from "../../../../../../lib";
import {
  ApiResponse,
  asyncWrapper,
  createOrUpdateMany,
  CustomRequest,
  deleteMissingItems,
} from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";
import { createSkilledNote } from "../helper";

const createOrUpdateSkinAndWound = async (req: CustomRequest) => {
  let skinAndWound: SkinAndWound | null = null;
  const {
    unscheduledVisitId,
    woundcare,
    patientId,
    caregiverId,
    skilledNursingNoteId,
    snNoteType,
    ...rest
  } = await req.json();
  if (rest?.id) {
    skinAndWound = await prisma.skinAndWound.update({
      where: { id: rest?.id },
      data: { ...rest },
    });
    await deleteMissingItems(woundcare, "wound", {
      skinAndWoundId: skinAndWound?.id,
    });
    if (woundcare?.length) {
      await createOrUpdateMany(woundcare, "wound", {
        skinAndWoundId: skinAndWound?.id,
      });
    }
  } else {
    if (skilledNursingNoteId) {
      skinAndWound = await prisma.skinAndWound.create({
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
      skinAndWound = await prisma.skinAndWound.create({
        data: {
          ...rest,
          skilledNursingNote: { connect: { id: skilledNursingNote?.id } },
        },
      });
    }
    if (woundcare?.length) {
      await prisma.wound.createMany({
        data: woundcare.map((item: Wound) => ({
          skinAndWoundId: skinAndWound?.id,
          ...pickValues(item),
        })),
      });
    }
  }
  return ApiResponse(skinAndWound, "Skin and Wound Detail saved!");
};

const POST = handler(
  authorizeUser,
  authorizeUpdateProvider("skinAndWound", "skilledNursingNote"),
  asyncWrapper(createOrUpdateSkinAndWound),
);

export { POST };
