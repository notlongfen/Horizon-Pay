"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { apiClient } from "@/lib/api/client";

export function useBusinessDashboard(wallet: string) {
  return useQuery({
    queryKey: queryKeys.business.dashboard(wallet),
    queryFn: () => apiClient.getBusinessDashboard(wallet),
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!wallet,
  });
}

export function useBusinessProfile(wallet: string) {
  return useQuery({
    queryKey: queryKeys.business.profile(wallet),
    queryFn: () => apiClient.getBusinessDashboard(wallet).then((d) => d.business),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!wallet,
  });
}

export function useBusinessOffers(wallet: string) {
  return useQuery({
    queryKey: queryKeys.business.offers(wallet),
    queryFn: () => apiClient.getBusinessDashboard(wallet).then((d) => d.offers),
    staleTime: 15 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!wallet,
  });
}

export function useBusinessVerificationStatus(wallet: string) {
  return useQuery({
    queryKey: queryKeys.verification.business.all(),
    queryFn: () => apiClient.getBusinessVerificationStatus(wallet),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!wallet,
  });
}
