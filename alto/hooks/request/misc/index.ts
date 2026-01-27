import { DiagnosisProcedure, Phrase } from "@prisma/client";
import useSWRMutation from "swr/mutation";

import { createRequest } from "@/lib";

export const useCreatePhrase = () => {
  return useSWRMutation(
    `/api/misc/phrase`,
    async (url: string, { arg }: { arg: Partial<Phrase> }) =>
      await createRequest(url, arg),
  );
};

export const useCreateDiagnosisProcedure = () => {
  return useSWRMutation(
    "/api/misc/diagnosis-procedure",
    async (url: string, { arg }: { arg: Partial<DiagnosisProcedure> }) =>
      await createRequest(url, arg),
  );
};
