import { prefetchBusinessDashboard } from "@/lib/query/prefetch";
import { HydrationProvider } from "@/app/components/providers/hydration-provider";
import { WalletProvider } from "@/app/components/wallet-provider";
import BusinessDashboardClientPage from "./client-page";

export default async function BusinessDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ wallet?: string; offer?: string; offerId?: string; action?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const wallet = resolvedSearchParams?.wallet || "";

  // Prefetch data if wallet is available
  const dehydratedState = wallet 
    ? await prefetchBusinessDashboard(wallet)
    : null;

  return (
    <HydrationProvider dehydratedState={dehydratedState}>
      <WalletProvider initialAddress={wallet || undefined}>
        <BusinessDashboardClientPage searchParams={searchParams} initialWallet={wallet || undefined} />
      </WalletProvider>
    </HydrationProvider>
  );
}
