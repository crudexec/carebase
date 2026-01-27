import { RelatedCaregiver } from "@prisma/client";

import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  createOrUpdateMany,
  CustomRequest,
  deleteMissingItems,
  getQuery,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";
import { getInsurances } from "./helper";

const fetchInsurances = async (req: CustomRequest) => {
  const { status } = getQuery(req);
  const insurances = await getInsurances(req.user.providerId as string, status);
  return ApiResponse(insurances);
};

const createInsurance = async (req: CustomRequest) => {
  const {
    patientId,
    insuranceCaseManagerId,
    relatedCaregiver,
    payerId,
    ...rest
  } = await req.json();
  const createInsurance = await prisma.patientInsurance.create({
    data: {
      ...rest,
      patient: { connect: { id: patientId } },
      ...(insuranceCaseManagerId && {
        insuranceCaseManager: { connect: { id: insuranceCaseManagerId } },
      }),
      ...(payerId && { payer: { connect: { id: payerId } } }),
    },
  });
  if (relatedCaregiver?.length) {
    await prisma.relatedCaregiver.createMany({
      data: relatedCaregiver.map((item: RelatedCaregiver) => ({
        patientInsuranceId: createInsurance.id,
        relationShip: item.relationShip,
        caregiverId: item.caregiverId,
      })),
    });
  }
  return ApiResponse(createInsurance, "Patient Insurance created successfully");
};

const updateInsurance = async (req: CustomRequest) => {
  const { relatedCaregiver, ...data } = await req.json();
  const updateInsurance = await prisma.patientInsurance.update({
    where: { id: data?.id },
    data: data,
  });
  await deleteMissingItems(relatedCaregiver, "relatedCaregiver", {
    patientInsuranceId: updateInsurance.id,
  });
  if (relatedCaregiver.length) {
    await createOrUpdateMany(relatedCaregiver, "relatedCaregiver", {
      patientInsuranceId: updateInsurance.id,
    });
  }
  return ApiResponse(updateInsurance, "Patient Insurance updated successfully");
};

const deleteInsurance = async (req: CustomRequest) => {
  const { ids, status: currentStatus } = await req.json();
  await prisma.patientInsurance.updateMany({
    where: {
      id: { in: ids || [] },
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
    `patient insurances ${currentStatus === "active" ? "archived" : "activated"} successfully`,
  );
};

const GET = handler(authorizeUser, asyncWrapper(fetchInsurances));
const POST = handler(authorizeUser, asyncWrapper(createInsurance));
const PUT = handler(
  authorizeUser,
  authorizeUpdateProvider("patientInsurance", "patient"),
  asyncWrapper(updateInsurance),
);
const DELETE = handler(authorizeUser, asyncWrapper(deleteInsurance));

export { DELETE, GET, POST, PUT };
