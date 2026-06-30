import { QueryClient, dehydrate } from "@tanstack/react-query";
import { getWorkspaceData } from "@/lib/workspace/workspace-service";
import { HydrationProvider } from "@/app/components/providers/hydration-provider";
import { WalletProvider } from "@/app/components/wallet-provider";
import { queryKeys } from "@/lib/query/keys";
import { apiClient } from "@/lib/api/client";
import AdminDashboardClientPage from "./client-page";

export default async function AdminDashboardPage() {
  // Admin dashboard doesn't require a specific wallet - it fetches all data
  // Create a single query client for both prefetches
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.admin.dashboard(),
      queryFn: () => apiClient.getAdminDashboard(),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.workspace.data(),
      queryFn: getWorkspaceData,
    }),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationProvider dehydratedState={dehydratedState}>
      <WalletProvider>
        <AdminDashboardClientPage />
      </WalletProvider>
    </HydrationProvider>
  );
}
