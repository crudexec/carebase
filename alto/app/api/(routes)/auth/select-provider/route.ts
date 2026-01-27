import prisma from "@/prisma";
import enforcer from "@/prisma/adapter";

import {
  ApiResponse,
  asyncWrapper,
  authenticateUserWithProvider,
  CustomRequest,
  ErrorResponse,
  getImageUrl,
} from "../../../lib";
import { authorizeProvider, handler } from "../../../middlewares";

const switchProvider = asyncWrapper(async (req: CustomRequest) => {
  const e = await enforcer();
  const { providerId } = await req.json();
  const user = req.user;
  const allProviders = await prisma.userProvider.findMany({
    where: { userId: user.id },
    select: { provider: true, providerId: true },
  });
  const resp = authenticateUserWithProvider({
    ...user,
    providerId: user.UserProvider[0]?.providerId,
  });
  if (!user.active) {
    return ErrorResponse(
      "user is not active, please contact your administrator",
      401,
    );
  }

  const url = getImageUrl(providerId, user?.image?.src ?? user?.image?.mediaId);
  const providers = await Promise.all(
    allProviders.map(async (item) => item.provider),
  );
  const role = await e.getFilteredNamedPolicy(
    "p",
    0,
    user?.id,
    "",
    user.UserProvider[0]?.providerId as string,
  );

  const responseCombined = {
    ...user,
    providers,
    image: url,
    provider: user.UserProvider[0]?.provider,
    providerId: user.UserProvider[0]?.providerId,
    password: undefined,
    accessToken: resp?.token,
    refreshToken: resp?.refreshToken,
    role: role?.[0]?.[1],
  };
  return ApiResponse(responseCombined);
});

export const POST = handler(authorizeProvider, switchProvider);
