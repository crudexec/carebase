import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";

type ParamProps = { params: { id: string } };

const createPolicyHolder = async (
  req: CustomRequest,
  { params: { id } }: ParamProps,
) => {
  const data = await req.json();
  if (!data?.id) {
    await prisma.patientPolicyHolder.create({
      data: { ...data, patientId: id },
    });
  } else {
    await prisma.patientPolicyHolder.update({
      where: { id: data.id, patient: { providerId: req.user?.providerId } },
      data: { ...data, patientId: id },
    });
  }
  return ApiResponse(null, "Policy Holder created successfully");
};

const POST = handler(authorizeUser, asyncWrapper(createPolicyHolder));
export { POST };
