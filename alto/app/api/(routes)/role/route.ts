import enforcer from "@/prisma/adapter";

import { ApiResponse, asyncWrapper, CustomRequest, getQuery } from "../../lib";
import { authorizeUser, handler } from "../../middlewares";

const getGroupRoles = asyncWrapper(async (req: CustomRequest) => {
  const user = req.user;
  const { group } = getQuery(req);

  const e = await enforcer();
  const roles = await e.getFilteredNamedGroupingPolicy(
    "g",
    0,
    "",
    group,
    user?.providerId as string,
  );
  const newRoles = await Promise.all(roles.map(async (role) => role[0]));

  return ApiResponse(newRoles);
});

export const GET = handler(authorizeUser, getGroupRoles);
