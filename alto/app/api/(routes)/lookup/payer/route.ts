import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  getQuery,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const payers = asyncWrapper(async (req: CustomRequest) => {
  const { inactivePayer } = getQuery(req);
  const payers = await prisma.payer.findMany({
    where: {
      ...((!inactivePayer || inactivePayer === "false") && { active: true }),
    },
  });
  return ApiResponse(payers);
});

export const GET = handler(authorizeUser, payers);
