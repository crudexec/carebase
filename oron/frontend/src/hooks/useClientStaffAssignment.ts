"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignStaffToClient,
  unassignStaffFromClient,
  fetchClientAssignments,
  fetchAvailableStaff,
  fetchAssignmentHistory,
} from "@/actions/clientStaffAssignment";

export const useClientAssignments = (clientId: string) => {
  const token = localStorage.getItem("token") as string;

  return useQuery({
    queryKey: ["clientAssignments", clientId],
    queryFn: () => fetchClientAssignments(token, clientId),
    enabled: !!token && !!clientId,
  });
};

export const useAvailableStaff = (clientId: string) => {
  const token = localStorage.getItem("token") as string;

  return useQuery({
    queryKey: ["availableStaff", clientId],
    queryFn: () => fetchAvailableStaff(token, clientId),
    enabled: !!token && !!clientId,
  });
};

export const useAssignmentHistory = (clientId: string, page: number = 1, size: number = 20) => {
  const token = localStorage.getItem("token") as string;

  return useQuery({
    queryKey: ["assignmentHistory", clientId, page, size],
    queryFn: () => fetchAssignmentHistory(token, clientId, page, size),
    enabled: !!token && !!clientId,
  });
};

export const useAssignStaff = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffIds, notes }: { staffIds: string[]; notes?: string }) => {
      const token = localStorage.getItem("token") as string;
      return assignStaffToClient(token, clientId, staffIds, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientAssignments", clientId] });
      queryClient.invalidateQueries({ queryKey: ["availableStaff", clientId] });
      queryClient.invalidateQueries({ queryKey: ["assignmentHistory", clientId] });
    },
  });
};

export const useUnassignStaff = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, notes }: { staffId: string; notes?: string }) => {
      const token = localStorage.getItem("token") as string;
      return unassignStaffFromClient(token, clientId, staffId, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientAssignments", clientId] });
      queryClient.invalidateQueries({ queryKey: ["availableStaff", clientId] });
      queryClient.invalidateQueries({ queryKey: ["assignmentHistory", clientId] });
    },
  });
};
