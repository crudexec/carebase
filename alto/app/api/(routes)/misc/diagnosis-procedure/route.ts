import { DiagnosisProcedure } from "@prisma/client";

import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const createDiagnosis = asyncWrapper(async (req: CustomRequest) => {
  const body = (await req.json()) as DiagnosisProcedure;
  const diagnosis = await prisma.diagnosisProcedure.create({
    data: body,
  });
  return ApiResponse(diagnosis, `${body.scope} created successfully`);
});

const POST = handler(authorizeUser, createDiagnosis);

export { POST };
