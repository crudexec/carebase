import { OtherPhysician } from "@prisma/client";

import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  createOrUpdateMany,
  CustomRequest,
  deleteMissingItems,
  ErrorResponse,
  getQuery,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const fetchPatientOtherDetails = async (req: CustomRequest) => {
  const { patientId } = getQuery(req);
  if (!patientId) {
    return ErrorResponse("patient ID is required", 400);
  }
  const otherInfo = await prisma.patientOtherInfo.findUnique({
    where: {
      patientId: patientId,
      patient: {
        providerId: req.user?.providerId as string,
      },
    },
    include: { otherPhysician: true },
  });
  return ApiResponse(otherInfo);
};

const savePatientOtherDetails = async (req: CustomRequest) => {
  const data = await req.json();
  if (data?.id) {
    const { otherPhysician, patientId, physicianId, ...rest } = data;
    const patientOtherInfo = await prisma.patientOtherInfo.update({
      where: { id: data?.id, patientId: patientId },
      data: { ...rest, ...(physicianId && { physicianId }) },
    });
    await deleteMissingItems(otherPhysician, "otherPhysician", {
      patientOtherInfoId: patientOtherInfo.id,
    });
    if (otherPhysician.length) {
      await createOrUpdateMany(otherPhysician, "otherPhysician", {
        patientOtherInfoId: patientOtherInfo.id,
      });
    }
    return ApiResponse(patientOtherInfo, "Patient other information saved!");
  } else {
    const { patientId, physicianId, otherPhysician, ...rest } = data;
    const patientOtherInfo = await prisma.patientOtherInfo.create({
      data: {
        ...rest,
        patient: { connect: { id: patientId } },
        ...(physicianId && { physician: { connect: { id: physicianId } } }),
      },
    });
    if (otherPhysician?.length) {
      await prisma.otherPhysician.createMany({
        data: otherPhysician.map((item: OtherPhysician) => ({
          physicianId: item?.physicianId,
          comment: item?.comment,
          patientOtherInfoId: patientOtherInfo?.id as string,
        })),
      });
    }
    return ApiResponse(patientOtherInfo, "Patient other information saved!");
  }
};

const GET = handler(authorizeUser, asyncWrapper(fetchPatientOtherDetails));
const POST = handler(
  authorizeUser,
  authorizeUpdateProvider("patientOtherInfo", "patient"),
  asyncWrapper(savePatientOtherDetails),
);
export { GET, POST };
