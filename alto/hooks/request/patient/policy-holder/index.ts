import { createRequest, updateRequest } from "@/lib";
import { PolicyHolderForm } from "@/schema";

export const useCreatePolicyHolder = async (
  url: string,
  { arg }: { arg: Partial<PolicyHolderForm> },
) => {
  return await createRequest(url, arg);
};
export const useUpdatePolicyHolder = async (
  url: string,
  { arg }: { arg: PolicyHolderForm & { id: string } },
) => {
  return await updateRequest(url, arg);
};
