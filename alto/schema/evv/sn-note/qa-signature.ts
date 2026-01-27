import { QASignatureSchema } from "@/prisma/zod-schema";
import { InferSchema } from "@/types";

export const qASignatureSchema = QASignatureSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type QASignatureForm = InferSchema<typeof qASignatureSchema>;

export const qaSignatureDefaultValue: QASignatureForm = {
  status: "",
  QANote: "",
};
