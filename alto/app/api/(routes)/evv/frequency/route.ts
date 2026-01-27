import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  getQuery,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";
import { getFrequencies } from "./helper";

const fetchFrequencies = async (req: CustomRequest) => {
  const { status } = getQuery(req);
  const frequencies = await getFrequencies(
    req.user?.providerId as string,
    status,
  );
  return ApiResponse(frequencies);
};

const createFrequency = async (req: CustomRequest) => {
  const { patientId, disciplineId, ...rest } = await req.json();
  const createFrequency = await prisma.patientFrequency.create({
    data: { ...rest, patientId, ...(disciplineId && { disciplineId }) },
  });
  return ApiResponse(createFrequency, "Patient Frequency created successfully");
};

const updateFrequency = async (req: CustomRequest) => {
  const data = await req.json();
  const updateFrequency = await prisma.patientFrequency.update({
    where: { id: data?.id },
    data: data,
  });
  return ApiResponse(updateFrequency, "Patient Frequency updated successfully");
};

const deleteFrequency = async (req: CustomRequest) => {
  const { ids, status: currentStatus } = await req.json();
  await prisma.patientFrequency.updateMany({
    where: {
      id: {
        in: ids || [],
      },
      patient: {
        providerId: req.user?.providerId,
      },
    },
    data: {
      active: currentStatus === "active" ? false : true,
      archivedOn: currentStatus === "active" ? new Date() : null,
    },
  });
  return ApiResponse(
    null,
    `patient frequencies ${currentStatus === "active" ? "archived" : "activated"} successfully`,
  );
};

const GET = handler(authorizeUser, asyncWrapper(fetchFrequencies));
const POST = handler(authorizeUser, asyncWrapper(createFrequency));
const PUT = handler(
  authorizeUser,
  authorizeUpdateProvider("patientFrequency", "patient"),
  asyncWrapper(updateFrequency),
);
const DELETE = handler(authorizeUser, asyncWrapper(deleteFrequency));

export { DELETE, GET, POST, PUT };
