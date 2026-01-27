import { isEmpty } from "lodash";

import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  ErrorResponse,
  getQuery,
} from "../../lib";
import { authorizeUser, handler } from "../../middlewares";
import { createLog } from "../log/helper";
import { getPatients } from "./helper";

const fetchPatients = async (req: CustomRequest) => {
  const { status, payer } = getQuery(req);
  const authUser = req.user;
  const users = await getPatients(
    authUser?.providerId as string,
    status,
    payer,
  );
  return ApiResponse(users);
};
const createPatient = async (req: CustomRequest) => {
  const data = await req.json();
  const { physician, ...rest } = data;
  if (!isEmpty(physician) || !isEmpty(rest)) {
    const createdPatient = await prisma.patient.create({
      data: {
        ...rest,
        provider: { connect: { id: req.user?.providerId } },
        ...(!isEmpty(physician) && !physician?.id
          ? { physician: { create: physician } }
          : physician?.id && { physician: { connect: { id: physician?.id } } }),
      },
    });
    await prisma.patientAdmission.create({
      data: { patientId: createdPatient.id, status: "REFERRED" },
    });
    await createLog(
      "PATIENT",
      "Patient created",
      createdPatient.id,
      req.user?.providerId as string,
    );
    return ApiResponse(createdPatient, "Patient created successfully");
  } else {
    return ErrorResponse("One or more patient information is required", 400);
  }
};

const updatePatient = async (req: CustomRequest) => {
  const data = await req.json();
  const { id, physician, ...rest } = data;
  const user = req.user;
  const updatedPatient = await prisma.patient.update({
    where: { id, providerId: user?.providerId },
    data: rest,
    include: { physician: true },
  });
  if (!isEmpty(physician)) {
    const { id } = physician;
    if (id) {
      await prisma.patient.update({
        where: { id: updatedPatient.id },
        data: { physician: { connect: { id: physician.id } } },
      });
    }
  }
  return ApiResponse(updatedPatient, "Patient updated successfully");
};

const GET = handler(authorizeUser, asyncWrapper(fetchPatients));
const POST = handler(authorizeUser, asyncWrapper(createPatient));
const PUT = handler(authorizeUser, asyncWrapper(updatePatient));
export { GET, POST, PUT };
