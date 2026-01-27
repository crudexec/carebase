import prisma from "@/prisma";

import { ApiResponse, asyncWrapper } from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const payers = asyncWrapper(async () => {
  const payers = await prisma.discipline.findMany({});
  return ApiResponse(payers);
});

export const GET = handler(authorizeUser, payers);
