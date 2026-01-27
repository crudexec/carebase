import { Provider } from "@prisma/client";
import { newEnforcer } from "casbin";
import { PrismaAdapter } from "casbin-prisma-adapter";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";
import { ErrorMessageOptions, generateErrorMessage } from "zod-error";

import { cookieOptions } from "@/constants";
import prisma from "@/prisma";
import { ObjectData, UserResponse, ValidateParseResponse } from "@/types";

import { NextFunction } from "../middlewares/handler";
import { getObjectURL } from "./aws";
export const JWT_SECRET = process.env.JWT_SECRET || "secret key";
export const JWT_EXPIRY = process.env.JWT_EXPIRY || "";
export const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh key";
export const REFRESH_EXPIRY = process.env.REFRESH_EXPIRY || "";

export type CustomRequest = NextRequest & { user: UserResponse };
export type ParamProps = {
  params: {
    [key: string]: string;
  };
};

export const ErrorResponse = (
  message: string | object,
  status?: number,
  data?: object,
) => {
  return NextResponse.json({ message, ...data }, { status: status || 400 });
};
export const ApiResponse = (
  data: object | null,
  message?: string,
  status?: number,
) => {
  return NextResponse.json(
    { data, success: true, message },
    { status: status || 200 },
  );
};

export const StreamResponse = (stream: ReadableStream, headers: ObjectData) => {
  return new Response(stream, {
    headers,
  });
};

// verify token
export const verifyToken = async (
  token: string,
  secret: string,
): Promise<UserResponse | null> => {
  const data = jwt.verify(token, secret) as UserResponse;
  if (!data) return null;
  const user = await prisma.user.findUnique({
    where: {
      id: data.id,
    },
    include: {
      image: true,
      UserProvider: {
        where: {
          providerId: data.providerId,
        },
        select: {
          provider: true,
          providerId: true,
        },
      },
    },
  });
  if (!user) return null;
  return {
    ...user,
    providerId: user?.UserProvider[0].providerId as string,
    provider: user?.UserProvider[0].provider as Provider,
  };
};

// check permission
export const checkPermission = async (
  sub: string,
  obj: string,
  act: string,
) => {
  const a = await PrismaAdapter.newAdapter();
  const e = await newEnforcer("model.conf", a);
  const res = await e.enforce(sub, obj, act);
  return res;
};

export const getQuery = (req: NextRequest): ObjectData => {
  const searchParams = req.nextUrl.searchParams;
  const query: ObjectData = {};
  for (const [key, value] of searchParams.entries()) {
    query[key] = value;
  }
  return query;
};

const options: ErrorMessageOptions = {
  delimiter: {
    error: ", ",
    component: ": ",
  },
  path: {
    enabled: true,
    type: "objectNotation",
    transform: ({ value }) => value,
  },
  code: {
    enabled: false,
  },
  message: {
    enabled: true,
    transform: ({ value }) => value.toLowerCase(),
  },
};

export const validate = (
  response: ValidateParseResponse,
  next: NextFunction,
): NextResponse | void => {
  if (!response.success) {
    const { errors } = response.error;
    const errorMessage = generateErrorMessage(errors, options); // You need to define 'options' or remove it if unnecessary
    return ErrorResponse(errorMessage, 400);
  }
  next();
};

export const authenticateUser = (id: string) => {
  const token = jwt.sign({ id }, JWT_SECRET, {
    expiresIn: parseInt(JWT_EXPIRY),
  });
  return token;
};

export const authenticateUserWithProvider = ({
  id,
  providerId,
}: {
  id: string;
  providerId: string;
}) => {
  if (!id && !providerId) return;
  const token = jwt.sign({ id, providerId }, JWT_SECRET, {
    expiresIn: parseInt(JWT_EXPIRY),
  });
  const refreshToken = jwt.sign({ id, providerId }, REFRESH_SECRET, {
    expiresIn: parseInt(REFRESH_EXPIRY),
  });
  cookies().set("auth", token, {
    ...cookieOptions,
    maxAge: parseInt(JWT_EXPIRY),
  });
  cookies().set("refresh", refreshToken, {
    ...cookieOptions,
    maxAge: parseInt(REFRESH_EXPIRY),
  });
  return { token, refreshToken };
};

export const refreshAuthToken = ({
  id,
  providerId,
}: {
  id: string;
  providerId: string;
}) => {
  if (!id && !providerId) return;
  const token = jwt.sign({ id, providerId }, JWT_SECRET, {
    expiresIn: parseInt(JWT_EXPIRY),
  });
  cookies().set("auth", token, {
    ...cookieOptions,
    maxAge: parseInt(JWT_EXPIRY),
  });
  return token;
};

export const logout = () => {
  cookies().delete("auth");
  cookies().delete("refresh");
};

export const handleTokenError = (error?: JsonWebTokenError) => {
  if (error?.name === "TokenExpiredError") {
    return ErrorResponse("Token has expired, please login again", 403);
  }
  return ErrorResponse("Invalid Token", 403);
};

export function generateImageUrl(providerId: string, image: string) {
  return `${providerId}/${image}`;
}

export const getImageUrl = (providerId?: string, image?: string | null) => {
  if (!image || image.includes("http")) {
    return image;
  } else {
    const finalUrl = generateImageUrl(providerId as string, image);
    const url = getObjectURL(finalUrl);
    return url;
  }
};

export const resetTime = (date: Date, time = "00:00") => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${time}:00.000Z`;
};

export function Bool(val: string) {
  return val ? !!JSON.parse(String(val).toLowerCase()) : false;
}

export const dateRange = (date: string | Date) => {
  return {
    gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
    lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
  };
};
export const generateUUID = () => {
  const myUUID = v4();
  return myUUID;
};

export const asyncForEach = async <T>(
  array: T[],
  callback: (item: T, index: number, array: T[]) => Promise<void>,
): Promise<void> => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export function isTrue(value?: string | boolean | number) {
  if (typeof value === "string") {
    value = value.trim().toLowerCase();
  }
  switch (value) {
    case true:
    case "true":
    case 1:
    case "1":
    case "on":
    case "yes":
      return true;
    default:
      return false;
  }
}
