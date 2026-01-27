import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  ErrorResponse,
  getImageUrl,
} from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";

type ParamProps = { params: { id: string } };

const getUnscheduledVisit = async (
  req: CustomRequest,
  { params: { id } }: ParamProps,
) => {
  const user = req.user;
  if (!id) {
    return ErrorResponse("Id is required", 400);
  }
  const unscheduledVisit = await prisma.unscheduledVisit.findUnique({
    where: { id: id as string, providerId: user.providerId },
    include: {
      patientSignature: true,
      caregiverSignature: true,
      caregiver: true,
      skilledNursingNote: true,
      patient: { include: { patientAdmission: true, patientMedication: true } },
    },
  });

  return ApiResponse({
    ...unscheduledVisit,
    patientSignatureUrl: await getImageUrl(
      user?.providerId as string,
      unscheduledVisit?.patientSignature?.mediaId,
    ),
    caregiverSignatureUrl: await getImageUrl(
      user?.providerId as string,
      unscheduledVisit?.caregiverSignature?.mediaId,
    ),
  });
};

const GET = handler(authorizeUser, asyncWrapper(getUnscheduledVisit));
export { GET };
