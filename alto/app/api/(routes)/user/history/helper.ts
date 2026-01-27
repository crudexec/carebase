import { PrismaClient } from "@prisma/client";

import prisma from "@/prisma";
import { ObjectData } from "@/types";

import { FileType } from "./route";

export const createLicense = async (data: ObjectData) => {
  const license = await prisma.license.create({ data });
  return license;
};

export const updateLicense = async (id: string, data: ObjectData) => {
  const license = await prisma.license.update({ where: { id }, data });
  return license;
};

export const addNewMedia = async (
  items: (FileType & { id: string })[],
  schema: keyof PrismaClient,
  historyId: string,
) => {
  const newItem = items.filter((item: FileType & { id: string }) => !item.id);
  if (newItem.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma[schema] as any).createMany({
      data: newItem.map((it: FileType) => ({
        mediaId: it.mediaId,
        size: it.size,
        fileType: it.type,
        userHistoryId: historyId,
        fileName: it.fileName,
      })),
    });
  }
};

export const getGroupByName = async (name: string) => {
  const group = await prisma.group.findUnique({ where: { name } });
  return group;
};
