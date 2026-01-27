import { PrismaClient } from "@prisma/client";
import { compareSync, genSalt, hashSync } from "bcryptjs";
import { randomBytes } from "crypto";

import prisma from "@/prisma";
import { ObjectData } from "@/types";

import { asyncForEach } from "./util";

export const orderBy = (sortBy?: string) => {
  const sortFilter = sortBy ?? "createdAt.desc";
  const [sort, direction] = sortFilter.split(".");
  if (!sort) return null;
  return { orderBy: { [sort]: direction } };
};

export const orderByWithProperty = (
  property: string,
  sort?: string,
  direction?: string,
) => {
  if (!sort) return null;
  return { orderBy: { [property]: { [sort]: direction } } };
};

export const paginateQuery = (
  page: string,
  pageSize: string,
  paginate?: string,
) => {
  const skip = (Number(page || 1) - 1) * (Number(pageSize) || 10);
  const take = Number(pageSize || 10);
  return paginate !== "false" && { skip, take };
};

export const isActive = (status?: string) => {
  if (!status || (status !== "active" && status !== "archived")) return true;
  return status === "active";
};

export const generateRandomString = (): string => {
  return randomBytes(16).toString("hex");
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await genSalt(8);
  return hashSync(password, salt);
};

export const passwordsMatch = (rawPassword: string, hash: string) => {
  return compareSync(rawPassword, hash);
};

export const filterFields = <T>(
  schema: keyof PrismaClient,
  excludedFields?: Partial<keyof T>[],
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allKeys = Object.keys((prisma[schema] as any)?.fields) as (keyof T)[];
  const defaultFields = [
    "id",
    "active",
    "archivedOn",
    "createdAt",
    "updatedAt",
  ] as (keyof T)[];
  return allKeys.filter(
    (key) => !excludedFields?.includes(key) && !defaultFields.includes(key),
  );
};

type EnumType = Record<string, string>;

export const enumFilter = <T extends EnumType>(
  field: keyof T,
  search: string,
  fieldType: Record<keyof T, T>,
) => {
  const enumFilter: Partial<Record<keyof T, string>> = {};
  for (const item of Object.values(fieldType[field])) {
    if (search.toUpperCase() === item) {
      enumFilter[field] = item;
      break;
    }
  }
  return enumFilter;
};

export const arrayUpdate = async <T extends { id: string }>(
  items: T[],
  schema: keyof PrismaClient,
) => {
  if (items.length) {
    await asyncForEach(items, async (it: T) => {
      const { id, ...rest } = it;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma[schema] as any).update({ where: { id: id }, data: rest });
    });
  }
};

export const createOrUpdateMany = async <T extends { id: string }>(
  items: T[],
  schema: keyof PrismaClient,
  rest: ObjectData,
) => {
  const exisitingItems = items.filter((item: T) => item.id);
  const newItem = items.filter((item: T) => !item.id);
  await arrayUpdate(
    items.filter((item: T) => item.id),
    schema,
  );
  if (exisitingItems.length) {
    await asyncForEach(exisitingItems, async (it: T) => {
      const { id, ...rest } = it;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma[schema] as any).update({ where: { id: id }, data: rest });
    });
  }
  if (newItem.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma[schema] as any).createMany({
      data: newItem.map((it: T) => ({ ...it, ...rest })),
    });
  }
};

export const deleteMissingItems = async <T extends { id: string }>(
  items: T[],
  schema: keyof PrismaClient,
  filter: ObjectData,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await (prisma[schema] as any).findMany({ where: { ...filter } });
  const dataToDelete = data.filter(
    (item: T) =>
      !items
        .filter((it: T) => it.id)
        .map((it: T) => it.id)
        .includes(item.id),
  );
  if (dataToDelete.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma[schema] as any).deleteMany({
      where: { id: { in: dataToDelete.map((it: T) => it.id) } },
    });
  }
};
