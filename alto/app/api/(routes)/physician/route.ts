import { Physician } from "@prisma/client";
import { isEmpty } from "lodash";

import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  ErrorResponse,
  getQuery,
} from "../../lib";
import { authorizeUser, handler } from "../../middlewares";

const fetchPhysician = asyncWrapper(async (req: CustomRequest) => {
  let physician: Physician | null | Physician[] = null;
  const { id } = getQuery(req);
  if (id) {
    physician = await prisma.physician.findUnique({
      where: { id: id as string, providerId: req.user?.providerId },
    });
  } else {
    physician = await prisma.physician.findMany({
      where: { providerId: req.user?.providerId },
    });
  }
  return ApiResponse(physician);
});

const createPhysician = asyncWrapper(async (req: CustomRequest) => {
  const data = await req.json();
  if (!isEmpty(data)) {
    const createdPhysician = await prisma.physician.create({
      data: {
        ...data,
        provider: {
          connect: { id: req.user?.providerId },
        },
      },
    });
    return ApiResponse(createdPhysician, "Physician created successfully");
  } else {
    return ErrorResponse("One or more physician information is required", 400);
  }
});

const POST = handler(authorizeUser, createPhysician);

const GET = handler(authorizeUser, asyncWrapper(fetchPhysician));
export { GET, POST };
