import useSWR from "swr";

import { createRequest, deleteRequest, updateRequest } from "@/lib";
import { UserForm } from "@/schema";
import { ApiResponse, UserListResponse } from "@/types";

type DeleteUserPayload = {
  ids: string[];
  status: string;
};

export const useGetUsers = ({ tab }: { tab?: string } = {}) => {
  return useSWR<
    ApiResponse<{
      users: (UserListResponse & { role: string })[];
      totalCount: number;
    }>
  >(
    `/api/user?${tab === "archived" ? "status=archived" : tab ? `role=${tab}` : ""}`,
  );
};

export const useDeleteUser = async (
  url: string,
  { arg }: { arg: DeleteUserPayload },
) => {
  return deleteRequest(url, arg);
};

export const useCreateUser = async (
  url: string,
  { arg }: { arg: Partial<UserForm> & { group?: string; role?: string } },
) => {
  return await createRequest(url, arg);
};
export const useUpdateUser = async (
  url: string,
  { arg }: { arg: UserForm & { id: string } },
) => {
  return await updateRequest(url, arg);
};
