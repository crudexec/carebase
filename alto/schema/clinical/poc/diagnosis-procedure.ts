import { PocDiagnosisProcedureSchema } from "@/prisma/zod-schema";
import { InferSchema } from "@/types";

export const pocDiagnosisProcedureSchema = PocDiagnosisProcedureSchema.omit({
  id: true,
  planOfCareId: true,
  createdAt: true,
  updatedAt: true,
  active: true,
  archivedOn: true,
});

export type PocDiagnosisProcedureForm = InferSchema<
  typeof pocDiagnosisProcedureSchema
>;

export const pocDiagnosisProcedureDefaultValue: PocDiagnosisProcedureForm = {
  diagnosisProcedureId: "",
  date: undefined,
  type: "",
};
