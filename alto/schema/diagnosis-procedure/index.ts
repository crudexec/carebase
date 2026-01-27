import z from "zod";

import { InferSchema, ObjectData } from "@/types";

export const DiagnosisProcedureSchema = z.object({
  diagnosisProcedureId: z.string().optional(),
  date: z.date().optional(),
  type: z.string().optional(),
});

export type DiagnosisProcedureForm = InferSchema<
  typeof DiagnosisProcedureSchema
>;

export const diagnosisProcedureDefaultValue: DiagnosisProcedureForm = {
  diagnosisProcedureId: "",
  date: undefined,
  type: "",
};

export type CreateDiagnosisProcedurePayload = {
  id?: string;
  patientId?: string;
  caregiverId?: string;
  scope: "procedure" | "diagnosis";
  parentId?: string;
  metaData?: ObjectData;
} & DiagnosisProcedureForm;
