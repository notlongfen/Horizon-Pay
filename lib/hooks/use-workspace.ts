"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { apiClient } from "@/lib/api/client";

export function useWorkspaceData() {
  return useQuery({
    queryKey: queryKeys.workspace.data(),
    queryFn: () => apiClient.getWorkspaceData(),
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useWorkspaceRoles() {
  const { data, ...rest } = useWorkspaceData();

  return {
    data: data?.roles,
    ...rest,
  };
}

export function useWorkspaceRole(role: string) {
  const { data: roles, ...rest } = useWorkspaceRoles();

  return {
    data: roles?.find((r: any) => r.role === role),
    ...rest,
  };
}

export function useWorkspaceOperations() {
  const { data: roles, ...rest } = useWorkspaceRoles();

  return {
    data: roles?.flatMap((role: any) => role.operations) || [],
    ...rest,
  };
}
