import { ApiResponse, asyncWrapper, CustomRequest } from "../../../lib";
import { authorizeUser, handler } from "../../../middlewares";

const getMe = asyncWrapper(async (req: CustomRequest) => {
  const user = req.user;
  return ApiResponse(user);
});

const GET = handler(authorizeUser, getMe);

export { GET };
