import { isEmpty } from "lodash";
import { NextResponse } from "next/server";

import enforcer from "@/prisma/adapter";
import { UserResponse } from "@/types";

import {
  CustomRequest,
  ErrorResponse,
  handleTokenError,
  logout,
  verifyToken,
} from "../lib";
import { refreshToken } from "../lib/refresh-token";
import { NextFunction } from "./handler";
export const JWT_SECRET = process.env.JWT_SECRET || "";
export const REFRESH_SECRET = process.env.REFRESH_SECRET || "";

export const authorizeUser = async (
  req: CustomRequest,
  _res: object,
  next: NextFunction,
): Promise<NextResponse | void> => {
  const e = await enforcer();
  let token = "";
  let user: UserResponse | null;
  const authorization =
    req.headers.get("authorization") || req.headers.get("x-access-token");
  const cookie = req.cookies.get("auth")?.value;
  const refresh = req.cookies.get("refresh")?.value;
  if (!authorization && !cookie && !refresh) {
    return ErrorResponse("current session has expired", 403);
  }
  if (authorization && authorization.startsWith("Bearer"))
    token = authorization.split(" ")[1];
  if (cookie) token = cookie;

  try {
    user = await verifyToken(token, JWT_SECRET);
    if (!isEmpty(user)) req.user = user as UserResponse;
    else if (refresh) await refreshToken(req, refresh);
  } catch (error) {
    if (refresh) {
      await refreshToken(req, refresh);
    } else {
      logout();
      return handleTokenError(error);
    }
  }
  const role = await e.getFilteredNamedPolicy(
    "p",
    0,
    req.user?.id,
    "",
    req.user?.providerId as string,
  );
  if (isEmpty(req.user)) {
    logout();
    return ErrorResponse("Not authorized to access this route", 403);
  }
  req.user.role = role?.[0]?.[1];
  next();
};
