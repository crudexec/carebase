import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  ParamProps,
} from "@/app/api/lib";
import { authorizeUser, handler } from "@/app/api/middlewares";
import { authorizeGetProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

const fetchAssessment = async (
  _req: CustomRequest,
  { params: { scheduleId } }: ParamProps,
) => {
  const assessment = await prisma.assessment.findUnique({
    where: { patientScheduleId: scheduleId as string },
  });
  return ApiResponse(assessment);
};
const GET = handler(
  authorizeUser,
  authorizeGetProvider("assessment"),
  asyncWrapper(fetchAssessment),
);

export { GET };
