import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  createOrUpdateMany,
  CustomRequest,
  deleteMissingItems,
  ErrorResponse,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const updateAuthorization = asyncWrapper(async (req: CustomRequest) => {
  const body = await req.json();
  const { patientId, authorizationTracker } = body;
  const patient = await prisma.patient.findUnique({
    where: { id: patientId, providerId: req.user?.providerId },
  });
  if (!patient) {
    return ErrorResponse("patient does not exist", 400);
  }
  deleteMissingItems(authorizationTracker, "patientAuthorization", {
    patientId,
  });
  if (authorizationTracker.length) {
    await createOrUpdateMany(authorizationTracker, "patientAuthorization", {
      patientId,
    });
  }
  return ApiResponse(null, "Patient authorization updated successfully");
});

const PUT = handler(authorizeUser, asyncWrapper(updateAuthorization));
export { PUT };
