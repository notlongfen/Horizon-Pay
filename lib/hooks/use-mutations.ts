"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { apiClient } from "@/lib/api/client";

// ============================================
// OFFER MUTATIONS
// ============================================

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post("/api/operations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.all() });
    },
    onError: (error) => {
      console.error("Failed to create offer:", error);
    },
  });
}

export function useAcknowledgeOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, wallet }: { offerId: string; wallet: string }) =>
      apiClient.post(`/api/offers/${offerId}/acknowledge`, { wallet }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.offers.byId(variables.offerId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.debtor.dashboard(variables.wallet),
      });
    },
    onError: (error) => {
      console.error("Failed to acknowledge offer:", error);
    },
  });
}

// ============================================
// OPERATION MUTATIONS
// ============================================

export function usePrepareOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: any) => apiClient.prepareOperation(input),
    onSuccess: (data) => {
      // Invalidate operations cache
      queryClient.invalidateQueries({ queryKey: queryKeys.operations.all() });
      
      // Invalidate workspace data if offer was created/modified
      if (data.operation?.offerId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspace.all() });
      }
    },
    onError: (error) => {
      console.error("Failed to prepare operation:", error);
    },
  });
}

export function useBuildTransaction() {
  return useMutation({
    mutationFn: (params: { operationId: string; walletAddress: string }) =>
      apiClient.buildTransaction(params),
    onError: (error) => {
      console.error("Failed to build transaction:", error);
    },
  });
}

export function useSubmitTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { operationId: string; signedXdr: string }) =>
      apiClient.submitTransaction(params),
    onSuccess: (data) => {
      // Invalidate operations and workspace data
      queryClient.invalidateQueries({ queryKey: queryKeys.operations.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.all() });
      
      // Invalidate specific offer if present
      if (data.operation?.offerId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.offers.byId(data.operation.offerId),
        });
      }
    },
    onError: (error) => {
      console.error("Failed to submit transaction:", error);
    },
  });
}

// ============================================
// VERIFICATION MUTATIONS
// ============================================

export function useSubmitInvestorVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.submitInvestorVerification(data),
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.verification.investor.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.investor.dashboard(variables.wallet),
      });
    },
    onError: (error) => {
      console.error("Failed to submit investor verification:", error);
    },
  });
}

export function useSubmitDebtorVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.submitDebtorVerification(data),
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.verification.debtor.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.debtor.dashboard(variables.wallet),
      });
    },
    onError: (error) => {
      console.error("Failed to submit debtor verification:", error);
    },
  });
}

export function useSubmitBusinessVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.submitBusinessVerification(data),
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.verification.business.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.business.dashboard(variables.wallet),
      });
    },
    onError: (error) => {
      console.error("Failed to submit business verification:", error);
    },
  });
}

// ============================================
// FUNDING MUTATIONS
// ============================================

export function useFundOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, wallet, amount }: { offerId: string; wallet: string; amount: string }) =>
      apiClient.post(`/api/offers/${offerId}/fund`, { wallet, amount }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.offers.byId(variables.offerId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.investor.dashboard(variables.wallet),
      });
    },
    onError: (error) => {
      console.error("Failed to fund offer:", error);
    },
  });
}

// ============================================
// REPAYMENT MUTATIONS
// ============================================

export function useRepayOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, wallet, amount }: { offerId: string; wallet: string; amount: string }) =>
      apiClient.post(`/api/offers/${offerId}/repay`, { wallet, amount }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.offers.byId(variables.offerId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.debtor.dashboard(variables.wallet),
      });
    },
    onError: (error) => {
      console.error("Failed to repay offer:", error);
    },
  });
}

export function useRepayFull() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, wallet }: { offerId: string; wallet: string }) =>
      apiClient.post(`/api/offers/${offerId}/repay-full`, { wallet }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.offers.byId(variables.offerId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.debtor.dashboard(variables.wallet),
      });
    },
    onError: (error) => {
      console.error("Failed to repay full:", error);
    },
  });
}
