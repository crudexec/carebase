import { authorizeGetProvider } from "@/app/api/middlewares/auth";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";
import { getPlanOfCare } from "../helper";

type ParamProps = { params: { id: string } };

const planOfCareHandler = async (
  req: CustomRequest,
  { params: { id } }: ParamProps,
) => {
  const planOfCare = await getPlanOfCare(id, req.user?.providerId as string);
  return ApiResponse(planOfCare);
};

const GET = handler(
  authorizeUser,
  authorizeGetProvider("planOfCare"),
  asyncWrapper(planOfCareHandler),
);

export { GET };
