"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { apiClient } from "@/lib/api/client";

export function useDebtorDashboard(wallet: string) {
  return useQuery({
    queryKey: queryKeys.debtor.dashboard(wallet),
    queryFn: () => apiClient.getDebtorDashboard(wallet),
    staleTime: 15 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!wallet,
  });
}

export function useDebtorProfile(wallet: string) {
  return useQuery({
    queryKey: queryKeys.debtor.profile(wallet),
    queryFn: () => apiClient.getDebtorDashboard(wallet).then((d) => d.debtor),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!wallet,
  });
}

export function useDebtorOffers(wallet: string) {
  return useQuery({
    queryKey: queryKeys.debtor.offers(wallet),
    queryFn: () => apiClient.getDebtorDashboard(wallet).then((d) => d.offers),
    staleTime: 15 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!wallet,
  });
}

export function useDebtorVerificationStatus(wallet: string) {
  return useQuery({
    queryKey: queryKeys.verification.debtor.all(),
    queryFn: () => apiClient.getDebtorVerificationStatus(wallet),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!wallet,
  });
}
