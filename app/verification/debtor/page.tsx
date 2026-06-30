import { prefetchDebtorVerificationStatus } from "@/lib/query/prefetch";
import { HydrationProvider } from "@/app/components/providers/hydration-provider";
import { WalletProvider } from "@/app/components/wallet-provider";
import DebtorVerificationClientPage from "./client-page";

export default async function DebtorVerificationPage({
  searchParams,
}: {
  searchParams?: Promise<{ wallet?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const wallet = resolvedSearchParams?.wallet || "";

  // Prefetch verification data if wallet is available
  const dehydratedState = wallet 
    ? await prefetchDebtorVerificationStatus(wallet)
    : null;

  return (
    <HydrationProvider dehydratedState={dehydratedState}>
      <WalletProvider initialAddress={wallet || undefined}>
        <DebtorVerificationClientPage initialWallet={wallet || undefined} />
      </WalletProvider>
    </HydrationProvider>
  );
}
