import { prefetchInvestorDashboard } from "@/lib/query/prefetch";
import { HydrationProvider } from "@/app/components/providers/hydration-provider";
import { WalletProvider } from "@/app/components/wallet-provider";
import InvestorDashboardClientPage from "./client-page";

export default async function InvestorDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ wallet?: string; offer?: string; offerId?: string; action?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const wallet = resolvedSearchParams?.wallet || "";

  // Prefetch data if wallet is available
  const dehydratedState = wallet 
    ? await prefetchInvestorDashboard(wallet)
    : null;

  return (
    <HydrationProvider dehydratedState={dehydratedState}>
      <WalletProvider initialAddress={wallet || undefined}>
        <InvestorDashboardClientPage searchParams={searchParams} initialWallet={wallet || undefined} />
      </WalletProvider>
    </HydrationProvider>
  );
}
