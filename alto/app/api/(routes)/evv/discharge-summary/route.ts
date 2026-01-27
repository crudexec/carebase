import { DischargeSummaryType } from "@prisma/client";

import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  getImageUrl,
  getQuery,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const fetchDischargeSummary = async (req: CustomRequest) => {
  const { patientId, type } = getQuery(req);
  const summary = await prisma.dischargeSummary.findUnique({
    where: {
      type: type as DischargeSummaryType,
      patient: {
        id: patientId as string,
        providerId: req.user?.providerId as string,
      },
    },
    include: { signature: true },
  });
  return ApiResponse({
    ...summary,
    signatureUrl: await getImageUrl(
      req.user?.providerId as string,
      summary?.signature?.mediaId,
    ),
  });
};

const createDischargeSummary = async (req: CustomRequest) => {
  let dischargeSummary;
  const data = await req.json();
  if (data.id) {
    const { patientId, mediaId, ...rest } = data;
    dischargeSummary = await prisma.dischargeSummary.update({
      where: { id: data.id, patientId },
      data: { ...rest },
      include: { signature: true },
    });
    if (mediaId && mediaId !== dischargeSummary?.signature?.mediaId) {
      await prisma.dischargeSummary.update({
        where: { id: dischargeSummary.id },
        data: { signatureDate: new Date(), signature: { create: { mediaId } } },
      });
    }
  } else {
    const { patientId, mediaId, ...rest } = data;
    dischargeSummary = await prisma.dischargeSummary.create({
      data: { ...rest, patient: { connect: { id: patientId } } },
    });
    if (mediaId) {
      await prisma.dischargeSummary.update({
        where: { id: dischargeSummary.id },
        data: { signatureDate: new Date(), signature: { create: { mediaId } } },
      });
    }
  }
  return ApiResponse(dischargeSummary, "Discharge summary saved!");
};

const GET = handler(authorizeUser, asyncWrapper(fetchDischargeSummary));
const POST = handler(
  authorizeUser,
  authorizeUpdateProvider("dischargeSummary", "patient"),
  asyncWrapper(createDischargeSummary),
);
export { GET, POST };
