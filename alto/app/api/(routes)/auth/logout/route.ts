import { cookies } from "next/headers";

import { ApiResponse, asyncWrapper } from "../../../lib";
import { handler } from "../../../middlewares";

const logoutHandler = asyncWrapper(async () => {
  cookies().delete("auth");
  cookies().delete("refresh");
  return ApiResponse(null, "User logged out successfully");
});

export const POST = handler(logoutHandler);
