import { LogContext } from "@prisma/client";

import prisma from "@/prisma";

export const createLog = async (
  context: LogContext,
  text: string,
  contextId: string,
  providerId: string,
) => {
  return await prisma.log.create({
    data: { context, text, contextId, providerId },
  });
};

export const fetchLogs = async (contextId: string, providerId: string) => {
  return await prisma.log.findMany({ where: { contextId, providerId } });
};
