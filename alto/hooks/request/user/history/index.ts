import { createRequest, deleteRequest, updateRequest } from "@/lib";
import { UserHistoryForm } from "@/schema";

type DeleteUserHistoryPayload = {
  ids: string[];
  status: string;
};

export const useDeleteUserHistory = async (
  url: string,
  { arg }: { arg: DeleteUserHistoryPayload },
) => {
  return deleteRequest(url, arg);
};

export const useCreateUserHistory = async (
  url: string,
  { arg }: { arg: Partial<UserHistoryForm> },
) => {
  return await createRequest(url, arg);
};

export const useUpdateUserHistory = async (
  url: string,
  { arg }: { arg: Partial<UserHistoryForm> & { id: string } },
) => {
  return await updateRequest(url, arg);
};
