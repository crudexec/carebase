import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";
import { getPriorAuthorizations } from "./helper";

const fetchPriorAuthorizations = async (req: CustomRequest) => {
  const priorAuthorizations = await getPriorAuthorizations(req);
  return ApiResponse(priorAuthorizations);
};

const createPriorAuthorization = async (req: CustomRequest) => {
  const { disciplineId, patientInsuranceId, ...rest } = await req.json();
  const createPriorAuthorization =
    await prisma.insurancePriorAuthorization.create({
      data: {
        ...rest,
        ...(disciplineId && { discipline: { connect: { id: disciplineId } } }),
        patientInsurance: { connect: { id: patientInsuranceId } },
        provider: { connect: { id: req.user.providerId } },
      },
    });
  return ApiResponse(
    createPriorAuthorization,
    "Prior Authorization created successfully",
  );
};

const updatePriorAuthorization = async (req: CustomRequest) => {
  const data = await req.json();
  const updatePriorAuthorization =
    await prisma.insurancePriorAuthorization.update({
      where: { id: data?.id, providerId: req.user.providerId },
      data: data,
    });
  return ApiResponse(
    updatePriorAuthorization,
    "Prior Authorization updated successfully",
  );
};

const deletePriorAuthorization = async (req: CustomRequest) => {
  const { ids, status: currentStatus } = await req.json();
  await prisma.insurancePriorAuthorization.updateMany({
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
    `Prior authorization ${currentStatus === "active" ? "archived" : "activated"} successfully`,
  );
};

const POST = handler(authorizeUser, asyncWrapper(createPriorAuthorization));
const GET = handler(authorizeUser, asyncWrapper(fetchPriorAuthorizations));
const DELETE = handler(authorizeUser, asyncWrapper(deletePriorAuthorization));
const PUT = handler(authorizeUser, asyncWrapper(updatePriorAuthorization));

export { DELETE, GET, POST, PUT };
