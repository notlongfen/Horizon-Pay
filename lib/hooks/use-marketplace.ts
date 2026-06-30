"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { apiClient } from "@/lib/api/client";

export function useMarketplaceData() {
  return useQuery({
    queryKey: queryKeys.marketplace.all(),
    queryFn: () => apiClient.getMarketplaceData(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMarketplaceOffer(id: string) {
  return useQuery({
    queryKey: queryKeys.marketplace.offer(id),
    queryFn: () => apiClient.getOfferById(id),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useMarketplaceStats() {
  const { data, ...rest } = useMarketplaceData();

  return {
    data: data?.stats,
    ...rest,
  };
}

export function useMarketplaceContracts() {
  const { data, ...rest } = useMarketplaceData();

  return {
    data: data?.contracts,
    ...rest,
  };
}
