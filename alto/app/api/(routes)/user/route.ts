import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  generateRandomString,
  getQuery,
  hashPassword,
} from "../../lib";
import { authorizeUser, handler } from "../../middlewares";
import { authorizeUpdateProvider } from "../../middlewares/auth";
import { assignRoleToUser, getUsers } from "./helper";

const fetchUsers = asyncWrapper(async (req: CustomRequest) => {
  const { status, role = "all" } = getQuery(req);
  const authUser = req.user;
  const users = await getUsers({ status, authUser, role });
  return ApiResponse(users);
});

const createUser = asyncWrapper(async (req: CustomRequest) => {
  const { image, role, ...rest } = await req.json();
  const user = req.user;
  const hashedPassword = await hashPassword(generateRandomString());
  const createdUser = await prisma.user.create({
    data: {
      ...rest,
      password: hashedPassword,
      ...(image && { image: { create: { mediaId: image } } }),
      UserProvider: { create: { providerId: user?.providerId as string } },
    },
  });
  await assignRoleToUser(createdUser?.id, role, user?.providerId as string);
  return ApiResponse(createdUser, "User created successfully");
});

const updateUser = asyncWrapper(async (req: CustomRequest) => {
  const data = await req.json();
  const { id, image, ...rest } = data;
  const updatedUser = await prisma.user.update({
    where: { id: id },
    data: { ...rest, ...(image && { image: { create: { mediaId: image } } }) },
  });
  return ApiResponse(updatedUser, "User updated successfully");
});

const deleteUsers = asyncWrapper(async (req: CustomRequest) => {
  const { ids, status: currentStatus } = await req.json();
  await prisma.user.updateMany({
    where: {
      id: { in: ids || [] },
      UserProvider: { some: { providerId: req.user?.providerId as string } },
    },
    data: {
      active: currentStatus === "active" ? false : true,
      archivedOn: currentStatus === "active" ? new Date() : null,
    },
  });
  return ApiResponse(
    null,
    `User(s) ${currentStatus === "active" ? "archived" : "activated"} successfully`,
  );
});

const GET = handler(authorizeUser, fetchUsers);
const POST = handler(authorizeUser, createUser);
const PUT = handler(authorizeUser, authorizeUpdateProvider("user"), updateUser);
const DELETE = handler(authorizeUser, deleteUsers);

export { DELETE, GET, POST, PUT };
