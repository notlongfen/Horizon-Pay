import { prefetchBusinessVerificationStatus } from "@/lib/query/prefetch";
import { HydrationProvider } from "@/app/components/providers/hydration-provider";
import { WalletProvider } from "@/app/components/wallet-provider";
import BusinessVerificationClientPage from "./client-page";

export default async function BusinessVerificationPage({
  searchParams,
}: {
  searchParams?: Promise<{ wallet?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const wallet = resolvedSearchParams?.wallet || "";

  // Prefetch verification data if wallet is available
  const dehydratedState = wallet 
    ? await prefetchBusinessVerificationStatus(wallet)
    : null;

  return (
    <HydrationProvider dehydratedState={dehydratedState}>
      <WalletProvider initialAddress={wallet || undefined}>
        <BusinessVerificationClientPage initialWallet={wallet || undefined} />
      </WalletProvider>
    </HydrationProvider>
  );
}
