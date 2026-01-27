import { User } from "@prisma/client";

import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  getQuery,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const fetchAccessInfoCareGivers = async (req: CustomRequest) => {
  const { patientId } = getQuery(req);
  const accessInfo = await prisma.patientAccessInformation.findFirst({
    where: { patientId, patient: { providerId: req.user?.providerId } },
  });
  let response: (User | null)[] = [];
  if (accessInfo) {
    response = await Promise.all(
      accessInfo.caregivers.map(async (caregiver) => {
        const user = await prisma.user.findUnique({ where: { id: caregiver } });
        return user;
      }),
    );
  }
  return ApiResponse(response);
};

const createAccessInfo = async (req: CustomRequest) => {
  const data = await req.json();
  await prisma.patientAccessInformation.upsert({
    where: {
      patientId: data.patient,
      patient: { providerId: req.user?.providerId },
    },
    create: { patientId: data.patient, caregivers: data.caregivers },
    update: { patientId: data.patient, caregivers: data.caregivers },
  });
  return ApiResponse(null, "Access information saved");
};

const GET = handler(authorizeUser, asyncWrapper(fetchAccessInfoCareGivers));
const POST = handler(authorizeUser, asyncWrapper(createAccessInfo));
export { GET, POST };
