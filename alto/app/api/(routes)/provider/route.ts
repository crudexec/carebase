import prisma from "@/prisma";

import { ApiResponse, asyncWrapper, CustomRequest } from "../../lib";
import { authorizeUser, handler } from "../../middlewares";
import { validateUpdateProvider } from "../../validator";
import { getProviders } from "./helper";

const fetchProviders = asyncWrapper(async () => {
  const providers = await getProviders();
  return ApiResponse(providers);
});

const createProvider = asyncWrapper(async (req: CustomRequest) => {
  const data = await req.json();
  const createdProvider = await prisma.provider.create({ data: data });
  return ApiResponse(createdProvider, "Provider created successfully");
});

const updateProvider = asyncWrapper(async (req: CustomRequest) => {
  const data = await req.json();
  const updatedUser = await prisma.provider.update({
    where: { id: data?.id },
    data: data,
  });
  return ApiResponse(updatedUser, "Provider updated successfully");
});

const deleteProviders = asyncWrapper(async (req: CustomRequest) => {
  const { provider, status: currentStatus } = await req.json();
  await prisma.provider.updateMany({
    where: { id: { in: provider || [] } },
    data: {
      active: currentStatus === "active" ? false : true,
      archivedOn: currentStatus === "active" ? new Date() : null,
    },
  });
  return ApiResponse(
    null,
    `provider(s) ${currentStatus === "active" ? "archived" : "activated"} successfully`,
  );
});

const GET = handler(authorizeUser, fetchProviders);
const POST = handler(authorizeUser, createProvider);
const PUT = handler(authorizeUser, validateUpdateProvider, updateProvider);
const DELETE = handler(authorizeUser, deleteProviders);
export { DELETE, GET, POST, PUT };
