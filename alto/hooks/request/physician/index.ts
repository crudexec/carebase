import { Physician } from "@prisma/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { createRequest } from "@/lib";
import { PhysicianForm } from "@/schema";
import { ApiResponse } from "@/types";

export const useGetPhysician = () => {
  return useSWR<ApiResponse<Physician[]>>(`/api/physician`);
};

export const useCreatePhysician = () => {
  return useSWRMutation(
    `/api/physician`,
    async (url: string, { arg }: { arg: PhysicianForm }) =>
      await createRequest(url, arg),
  );
};
