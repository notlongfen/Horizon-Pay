"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { apiClient } from "@/lib/api/client";

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: () => apiClient.getAdminDashboard(),
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAdminReviews() {
  const { data, ...rest } = useAdminDashboard();

  return {
    data: data?.adminReviews || [],
    ...rest,
  };
}

export function useAllOffers() {
  const { data, ...rest } = useAdminDashboard();

  return {
    data: data?.offers || [],
    ...rest,
  };
}
