import { prefetchDebtorDashboard } from "@/lib/query/prefetch";
import { HydrationProvider } from "@/app/components/providers/hydration-provider";
import { WalletProvider } from "@/app/components/wallet-provider";
import DebtorDashboardClientPage from "./client-page";

export default async function DebtorDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ wallet?: string; offer?: string; offerId?: string; action?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const wallet = resolvedSearchParams?.wallet || "";

  // Prefetch data if wallet is available
  const dehydratedState = wallet 
    ? await prefetchDebtorDashboard(wallet)
    : null;

  return (
    <HydrationProvider dehydratedState={dehydratedState}>
      <WalletProvider initialAddress={wallet || undefined}>
        <DebtorDashboardClientPage searchParams={searchParams} initialWallet={wallet || undefined} />
      </WalletProvider>
    </HydrationProvider>
  );
}
