import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import prisma from "@/prisma";

import { CustomRequest, ErrorResponse } from "../lib";
import { NextFunction } from "./handler";

export const authorizeProvider = async (
  req: CustomRequest,
  _res: NextResponse,
  next: NextFunction,
) => {
  const { providerId } = await req.clone().json();
  let token, decoded;
  const authorization =
    req.headers.get("authorization") || req.headers.get("x-access-token");
  const cookie = req.cookies.get("auth")?.value;
  if (!authorization && !cookie)
    return ErrorResponse(
      "No token provided or the current session has expired",
      401,
    );
  if (authorization && authorization.startsWith("Bearer"))
    token = authorization.split(" ")[1];
  if (cookie) token = cookie;

  try {
    decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET ?? "secret key",
    ) as { id: string; role: string };
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      return ErrorResponse("Token has expired, please login again", 401);
    }
    return ErrorResponse(`Invalid Token`, 401);
  }
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: {
      image: true,
      UserProvider: {
        where: { providerId },
        select: { provider: true, providerId: true },
        take: 1,
      },
    },
  });
  if (user) req.user = user;
  if (!req.user)
    return ErrorResponse(`Not authorized to access this route`, 401);
  next();
};
