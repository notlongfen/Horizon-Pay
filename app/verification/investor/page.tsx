import { prefetchInvestorVerificationStatus } from "@/lib/query/prefetch";
import { HydrationProvider } from "@/app/components/providers/hydration-provider";
import { WalletProvider } from "@/app/components/wallet-provider";
import InvestorVerificationClientPage from "./client-page";

export default async function InvestorVerificationPage({
  searchParams,
}: {
  searchParams?: Promise<{ wallet?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const wallet = resolvedSearchParams?.wallet || "";

  // Prefetch verification data if wallet is available
  const dehydratedState = wallet 
    ? await prefetchInvestorVerificationStatus(wallet)
    : null;

  return (
    <HydrationProvider dehydratedState={dehydratedState}>
      <WalletProvider initialAddress={wallet || undefined}>
        <InvestorVerificationClientPage initialWallet={wallet || undefined} />
      </WalletProvider>
    </HydrationProvider>
  );
}
