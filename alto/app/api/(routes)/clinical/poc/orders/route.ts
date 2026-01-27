import { authorizeUpdateProvider } from "@/app/api/middlewares/auth";
import prisma from "@/prisma";

import {
  ApiResponse,
  asyncWrapper,
  CustomRequest,
  getQuery,
} from "../../../../lib";
import { authorizeUser, handler } from "../../../../middlewares";
import { getOrdersAndGoals } from "./helper";

const fetchOrdersAndGoals = async (req: CustomRequest) => {
  const { status, planOfCareId } = getQuery(req);
  const ordersAndGoals = await getOrdersAndGoals(
    req.user?.providerId as string,
    planOfCareId,
    status,
  );
  return ApiResponse(ordersAndGoals);
};

const createOrderAndGoal = async (req: CustomRequest) => {
  let planOfCare;
  const {
    patientId,
    caregiverId,
    disciplineId,
    planOfCareId,
    isCert485,
    ...rest
  } = await req.json();
  if (!planOfCareId) {
    planOfCare = await prisma.planOfCare.create({
      data: {
        patientId,
        caregiverId,
        isCert485,
        providerId: req.user?.providerId as string,
        ordersAndGoals: {
          create: { ...rest, ...(disciplineId && { disciplineId }) },
        },
      },
    });
  } else {
    planOfCare = await prisma.planOfCare.update({
      where: { id: planOfCareId },
      data: {
        ordersAndGoals: {
          create: { ...rest, ...(disciplineId && { disciplineId }) },
        },
      },
    });
  }
  return ApiResponse(planOfCare, "Order & Goal created successfully");
};

const updateOrderAndGoal = async (req: CustomRequest) => {
  const data = await req.json();
  const updateOrderAndGoal = await prisma.ordersAndGoals.update({
    where: { id: data?.id },
    data: data,
  });
  return ApiResponse(updateOrderAndGoal, "Order & Goal updated successfully");
};

const deleteOrderAndGoal = async (req: CustomRequest) => {
  const { ids, status: currentStatus } = await req.json();
  await prisma.ordersAndGoals.updateMany({
    where: {
      id: { in: ids || [] },
      planOfCare: { providerId: req.user?.providerId },
    },
    data: {
      active: currentStatus === "active" ? false : true,
      archivedOn: currentStatus === "active" ? new Date() : null,
    },
  });
  return ApiResponse(
    null,
    `Order and goal ${currentStatus === "active" ? "archived" : "activated"} successfully`,
  );
};

const GET = handler(authorizeUser, asyncWrapper(fetchOrdersAndGoals));
const POST = handler(authorizeUser, asyncWrapper(createOrderAndGoal));
const PUT = handler(
  authorizeUser,
  authorizeUpdateProvider("ordersAndGoals", "planOfCare"),
  asyncWrapper(updateOrderAndGoal),
);
const DELETE = handler(authorizeUser, asyncWrapper(deleteOrderAndGoal));

export { DELETE, GET, POST, PUT };
