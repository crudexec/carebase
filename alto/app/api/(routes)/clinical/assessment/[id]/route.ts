import { authorizeGetProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  ParamProps,
} from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";

const fetchAssessment = async (
  _req: CustomRequest,
  { params: { id } }: ParamProps,
) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id: id as string },
  });
  return ApiResponse(assessment);
};
const GET = handler(
  authorizeUser,
  authorizeGetProvider("assessment"),
  asyncWrapper(fetchAssessment),
);

export { GET };
