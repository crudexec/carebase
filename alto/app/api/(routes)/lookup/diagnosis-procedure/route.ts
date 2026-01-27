import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  getQuery,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const diagnoses = asyncWrapper(async (req: CustomRequest) => {
  const { scope } = getQuery(req);
  const diagnoses = await prisma.diagnosisProcedure.findMany({
    where: { scope },
  });
  return ApiResponse(diagnoses);
});

export const GET = handler(authorizeUser, diagnoses);
