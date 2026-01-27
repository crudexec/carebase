/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

import prisma from "@/prisma";

import { CustomRequest, ErrorResponse, getQuery, ParamProps } from "../lib";
import { NextFunction } from "./handler";

export const authorizeUpdateProvider = (
  schema: keyof PrismaClient,
  parent?: keyof PrismaClient,
) => {
  return async (req: CustomRequest, _res: NextResponse, next: NextFunction) => {
    const { id } = await req.clone().json();
    if (id) {
      let response;
      if (parent === "user") {
        response = await (prisma[schema] as any).findUnique({
          where: {
            id,
            user: {
              UserProvider: { some: { providerId: req.user.providerId } },
            },
          },
        });
      } else if (parent) {
        response = await (prisma[schema] as any).findUnique({
          where: { id, [parent]: { providerId: req.user.providerId } },
        });
      } else if (schema === "user") {
        response = await prisma.user.findUnique({
          where: {
            id,
            UserProvider: { some: { providerId: req.user.providerId } },
          },
        });
      } else {
        response = await (prisma[schema] as any).findUnique({
          where: { id, providerId: req.user.providerId },
        });
      }
      if (!response) return ErrorResponse("Forbidden: Access denied", 401);
    }
    next();
  };
};

export const authorizeGetProvider = (
  schema: keyof PrismaClient,
  parent?: keyof PrismaClient,
) => {
  return async (
    req: CustomRequest,
    { params }: ParamProps,
    next: NextFunction,
  ) => {
    const queryId = getQuery(req)?.id ?? params?.id;
    if (queryId) {
      let response;
      if (parent === "user") {
        response = await (prisma[schema] as any).findUnique({
          where: {
            id: queryId,
            user: {
              UserProvider: { some: { providerId: req.user.providerId } },
            },
          },
        });
      } else if (parent) {
        response = await (prisma[schema] as any).findUnique({
          where: { id: queryId, [parent]: { providerId: req.user.providerId } },
        });
      } else if (schema === "user") {
        response = await prisma.user.findUnique({
          where: {
            id: queryId,
            UserProvider: { some: { providerId: req.user.providerId } },
          },
        });
      } else {
        response = await (prisma[schema] as any).findUnique({
          where: { id: queryId, providerId: req.user.providerId },
        });
      }
      if (!response) return ErrorResponse("Forbidden: Access denied", 401);
    }
    next();
  };
};
