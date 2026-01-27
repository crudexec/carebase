import bcrypt from "bcryptjs";

import prisma from "@/prisma";
import enforcer from "@/prisma/adapter";

import {
  ApiResponse,
  asyncWrapper,
  authenticateUser,
  authenticateUserWithProvider,
  CustomRequest,
  ErrorResponse,
  getImageUrl,
} from "../../../lib";
import { handler } from "../../../middlewares";

const loginUser = asyncWrapper(async (req: CustomRequest) => {
  const e = await enforcer();
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({
    where: { email: email?.trim().toLowerCase() },
    select: {
      UserProvider: { include: { provider: true } },
      id: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      active: true,
      image: true,
    },
  });

  if (!user) {
    return ErrorResponse("invalid username and password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return ErrorResponse("invalid username and password", 401);
  }

  if (!user.active) {
    return ErrorResponse(
      "user is not active, please contact your administrator",
      401,
    );
  }

  const { UserProvider, ...rest } = user;
  const providers = await Promise.all(
    UserProvider.map(async (item) => item.provider),
  );

  if (UserProvider.length > 1) {
    const token = authenticateUser(user?.id);
    return ApiResponse({ providers, accessToken: token });
  } else {
    const resp = authenticateUserWithProvider({
      ...user,
      providerId: UserProvider[0]?.providerId,
    });
    const role = await e.getFilteredNamedPolicy(
      "p",
      0,
      user?.id,
      "",
      UserProvider[0]?.providerId as string,
    );
    const url = getImageUrl(
      UserProvider[0]?.providerId,
      user?.image?.src ?? user?.image?.mediaId,
    );
    const responseCombined = {
      ...rest,
      image: url,
      provider: UserProvider[0]?.provider,
      providerId: UserProvider[0]?.providerId,
      password: undefined,
      accessToken: resp?.token,
      refreshToken: resp?.refreshToken,
      role: role?.[0]?.[1],
    };
    return ApiResponse(responseCombined);
  }
});

export const POST = handler(loginUser);
