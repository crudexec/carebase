import { OrdersAndGoalsSchema } from "@/prisma/zod-schema";
import { InferSchema } from "@/types";

export const ordersAndGoalsSchema = OrdersAndGoalsSchema.omit({
  id: true,
  planOfCareId: true,
  createdAt: true,
  updatedAt: true,
  active: true,
  archivedOn: true,
});

export type OrdersAndGoalsForm = InferSchema<typeof ordersAndGoalsSchema>;

export const ordersAndGoalsDefaultValue: OrdersAndGoalsForm = {
  carePlanType: "",
  disciplineId: "",
  isFrequencyOrder: false,
  bodySystem: "",
  effectiveDate: null,
  orders: "",
  orderexplanation: "",
  goals: "",
  goalsExplanation: "",
  goalsMet: false,
  goalsOngoing: false,
  discontinue: false,
  goalsMetDate: null,
};
