import prisma from "@/prisma";

import { ApiResponse, asyncWrapper } from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const getTaxonomy = asyncWrapper(async () => {
  const taxonomies = await prisma.taxonomy.findMany({
    include: { codes: true },
  });
  return ApiResponse(taxonomies);
});

export const GET = handler(authorizeUser, getTaxonomy);
