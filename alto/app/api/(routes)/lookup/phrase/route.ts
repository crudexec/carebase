import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  getQuery,
} from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const phrases = asyncWrapper(async (req: CustomRequest) => {
  const { section } = getQuery(req);
  const phrases = await prisma.phrase.findMany({ where: { section } });
  return ApiResponse(phrases);
});

export const GET = handler(authorizeUser, phrases);
