import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  ErrorResponse,
  getQuery,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const fetchPatientDiscipline = async (req: CustomRequest) => {
  const { id } = getQuery(req);
  if (!id) return ErrorResponse("patient ID is required", 400);

  const discipline = await prisma.patientDiscipline.findUnique({
    where: {
      patientId: id as string,
      patient: {
        providerId: req.user?.providerId as string,
      },
    },
  });
  return ApiResponse({ discipline });
};

const createPatientDiscipline = async (req: CustomRequest) => {
  let patientDiscipline;
  const data = await req.json();
  if (data?.id) {
    patientDiscipline = await prisma.patientDiscipline.update({
      where: { id: data?.id, patient: { providerId: req.user.providerId } },
      data: { ...data },
    });
  } else {
    const { patientId, ...rest } = data;
    patientDiscipline = await prisma.patientDiscipline.create({
      data: { ...rest, patient: { connect: { id: patientId } } },
    });
  }
  return ApiResponse(patientDiscipline, "Patient discipline saved!");
};

const GET = handler(authorizeUser, asyncWrapper(fetchPatientDiscipline));
const POST = handler(authorizeUser, asyncWrapper(createPatientDiscipline));

export { GET, POST };
