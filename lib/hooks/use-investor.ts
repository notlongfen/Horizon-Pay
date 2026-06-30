"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { apiClient } from "@/lib/api/client";

export function useInvestorDashboard(wallet: string) {
  return useQuery({
    queryKey: queryKeys.investor.dashboard(wallet),
    queryFn: () => apiClient.getInvestorDashboard(wallet),
    staleTime: 15 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!wallet,
  });
}

export function useInvestorProfile(wallet: string) {
  return useQuery({
    queryKey: queryKeys.investor.profile(wallet),
    queryFn: () => apiClient.getInvestorDashboard(wallet).then((d) => d.investor),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!wallet,
  });
}

export function useInvestorPortfolio(wallet: string) {
  return useQuery({
    queryKey: queryKeys.investor.portfolio(wallet),
    queryFn: () => apiClient.getInvestorDashboard(wallet).then((d) => d.offers),
    staleTime: 15 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!wallet,
  });
}

export function useInvestorVerificationStatus(wallet: string) {
  return useQuery({
    queryKey: queryKeys.verification.investor.all(),
    queryFn: () => apiClient.getInvestorVerificationStatus(wallet),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!wallet,
  });
}
