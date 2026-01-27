import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  getQuery,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";
import { getPlanOfCares } from "./helper";

const fetchPlanOfCares = async (req: CustomRequest) => {
  const { patientId, status, isCert485 } = getQuery(req);
  const snNotes = await getPlanOfCares(patientId, status, isCert485);
  return ApiResponse(snNotes);
};

const createOrUpdatPlanOfCare = async (req: CustomRequest) => {
  let planOfCare;
  const { physicianId, caseManagerId, mediaId, ...rest } = await req.json();
  if (rest?.id) {
    planOfCare = await prisma.planOfCare.update({
      where: { id: rest?.id },
      data: {
        ...rest,
        ...(caseManagerId && { caseManagerId }),
        ...(physicianId && { physicianId }),
      },
    });
    if (mediaId && mediaId !== planOfCare?.nurseMediaId) {
      await prisma.planOfCare.update({
        where: { id: planOfCare.id },
        data: {
          nurseSignatureDate: new Date(),
          nurseSignature: { create: { mediaId } },
        },
      });
    }
  } else {
    planOfCare = await prisma.planOfCare.create({
      data: {
        ...rest,
        providerId: req.user.providerId,
        ...(caseManagerId && { caseManagerId }),
        ...(physicianId && { physicianId }),
      },
    });
    if (mediaId) {
      await prisma.planOfCare.update({
        where: { id: planOfCare.id },
        data: {
          nurseSignatureDate: new Date(),
          nurseSignature: { create: { mediaId } },
        },
      });
    }
  }
  return ApiResponse(planOfCare, "Plan of care Detail saved!");
};

const deletePlanOfCare = asyncWrapper(async (req: CustomRequest) => {
  const { ids, status: currentStatus } = await req.json();
  await prisma.planOfCare.updateMany({
    where: {
      id: { in: ids || [] },
      providerId: req.user?.providerId as string,
    },
    data: {
      active: currentStatus === "active" ? false : true,
      archivedOn: currentStatus === "active" ? new Date() : null,
    },
  });
  return ApiResponse(
    null,
    `Plan of care(s) ${currentStatus === "active" ? "archived" : "restored"} successfully`,
  );
});

const GET = handler(authorizeUser, asyncWrapper(fetchPlanOfCares));
const DELETE = handler(authorizeUser, deletePlanOfCare);
const POST = handler(
  authorizeUser,
  authorizeUpdateProvider("planOfCare"),
  asyncWrapper(createOrUpdatPlanOfCare),
);

export { DELETE, GET, POST };
