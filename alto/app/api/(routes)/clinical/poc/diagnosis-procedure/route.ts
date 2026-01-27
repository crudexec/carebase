import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  getQuery,
} from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";
import { getplanOfCareDiagnosis } from "./helper";

const fetchDiagnosisOrProcedure = async (req: CustomRequest) => {
  const { status, parentId, scope } = getQuery(req);
  const diagnosis = await getplanOfCareDiagnosis(
    req.user?.providerId as string,
    parentId,
    scope,
    status,
  );
  return ApiResponse(diagnosis);
};

const createDiagnosisOrProcedure = async (req: CustomRequest) => {
  let planOfCare;
  const {
    patientId,
    caregiverId,
    disciplineId,
    parentId,
    scope,
    isCert485,
    ...rest
  } = await req.json();
  if (!parentId) {
    planOfCare = await prisma.planOfCare.create({
      data: {
        patientId,
        caregiverId,
        isCert485,
        providerId: req.user?.providerId as string,
        pocDiagnosisProcedure: {
          create: { ...rest, ...(disciplineId && { disciplineId }) },
        },
      },
    });
  } else {
    planOfCare = await prisma.planOfCare.update({
      where: { id: parentId },
      data: {
        pocDiagnosisProcedure: {
          create: { ...rest, ...(disciplineId && { disciplineId }) },
        },
      },
    });
  }
  return ApiResponse(planOfCare, `Plan of care ${scope} created successfully`);
};

const updateDiagnosisOrProcedure = async (req: CustomRequest) => {
  const { scope, ...data } = await req.json();
  const updateDiagnosisOrProcedure = await prisma.pocDiagnosisProcedure.update({
    where: { id: data?.id },
    data: { ...data },
  });
  return ApiResponse(
    updateDiagnosisOrProcedure,
    `${scope} updated successfully`,
  );
};

const deleteDiagnosisOrProcedure = async (req: CustomRequest) => {
  const { ids, status: currentStatus, scope } = await req.json();
  await prisma.pocDiagnosisProcedure.updateMany({
    where: {
      id: { in: ids || [] },
      planOfCare: { providerId: req.user?.providerId },
    },
    data: {
      active: currentStatus === "active" ? false : true,
      archivedOn: currentStatus === "active" ? new Date() : null,
    },
  });
  return ApiResponse(
    null,
    `${scope} ${currentStatus === "active" ? "archived" : "activated"} successfully`,
  );
};

const GET = handler(authorizeUser, asyncWrapper(fetchDiagnosisOrProcedure));
const POST = handler(authorizeUser, asyncWrapper(createDiagnosisOrProcedure));
const PUT = handler(
  authorizeUser,
  authorizeUpdateProvider("pocDiagnosisProcedure", "planOfCare"),
  asyncWrapper(updateDiagnosisOrProcedure),
);
const DELETE = handler(authorizeUser, asyncWrapper(deleteDiagnosisOrProcedure));

export { DELETE, GET, POST, PUT };
