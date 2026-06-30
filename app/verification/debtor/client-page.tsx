"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/app/components/wallet-provider";
import { useDebtorVerificationStatus } from "@/lib/hooks";

interface DebtorVerificationClientPageProps {
  initialWallet?: string;
}

import { BorderGlow } from "@/app/components/border-glow";
import { Particles } from "@/app/components/particles";
import { ScrollParallax } from "@/app/components/scroll-parallax";
import { SiteNav } from "@/app/components/site-nav";
import { SectionLabel, Card } from "@/app/components/ui";
import { DebtorKYCForm } from "./debtor-kyc-form";
import { MetricCardsSkeleton } from "@/lib/utils/loading";

// Metadata moved to layout since this is now a client component
// export const metadata: Metadata = {
//   title: "Debtor Verification | HorizonPay",
//   description:
//     "Complete your debtor verification to acknowledge receivable Offers on HorizonPay.",
//   openGraph: {
//     title: "Debtor Verification | HorizonPay",
//     description:
//       "Submit your debtor verification documents to start acknowledging receivable obligations.",
//     type: "website",
//   },
// };

export function DebtorVerificationClientPage({ initialWallet }: DebtorVerificationClientPageProps = {}) {
  const router = useRouter();
  const { address: walletAddress, isConnected } = useWallet();
  // Use custom hook for data fetching
  // Use initial wallet if provided, otherwise fall back to connected wallet
  const effectiveWallet = initialWallet || walletAddress || "";
  const { data: verificationData, isLoading, isError, error } = useDebtorVerificationStatus(
    effectiveWallet
  );

  const profile = verificationData?.profile || null;
  const documents = profile?.verificationDocuments || [];

  // Redirect to onboarding if no wallet connected
  useEffect(() => {
    if (!isLoading && !walletAddress && !initialWallet) {
      router.push("/onboarding");
    }
  }, [walletAddress, isLoading, router, initialWallet]);

  // Also check if we have an initial wallet but no connected wallet
  if (!isLoading && !walletAddress && !initialWallet) {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#020504] text-white">
        <div className="galaxy-field" aria-hidden="true" />
        <div className="aurora-field" aria-hidden="true" />
        <div
          className="stellar-grid"
          data-parallax
          data-parallax-speed="0.035"
          aria-hidden="true"
        />
        <ScrollParallax />
        <Particles
          className="fixed inset-0 z-[1]"
          particleColors={["#ffffff", "#5cf6ff", "#d8ff8f"]}
          particleCount={220}
          particleSpread={10}
          speed={0.16}
          particleBaseSize={1.05}
          moveParticlesOnHover={false}
          alphaParticles
        />
        <SiteNav activeRoute="onboarding" />
        <section className="parallax-section mx-auto max-w-7xl px-5 pb-20 pt-32">
          <div className="text-center">
            <MetricCardsSkeleton count={1} />
          </div>
        </section>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#020504] text-white">
        <div className="galaxy-field" aria-hidden="true" />
        <div className="aurora-field" aria-hidden="true" />
        <div
          className="stellar-grid"
          data-parallax
          data-parallax-speed="0.035"
          aria-hidden="true"
        />
        <ScrollParallax />
        <Particles
          className="fixed inset-0 z-[1]"
          particleColors={["#ffffff", "#5cf6ff", "#d8ff8f"]}
          particleCount={220}
          particleSpread={10}
          speed={0.16}
          particleBaseSize={1.05}
          moveParticlesOnHover={false}
          alphaParticles
        />
        <SiteNav activeRoute="onboarding" />
        <section className="parallax-section mx-auto max-w-7xl px-5 pb-20 pt-32">
          <Card padding="md">
            <p className="text-rose-400">Failed to load verification data: {error?.message}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-cyan-400 hover:text-cyan-300">
              Retry
            </button>
          </Card>
        </section>
      </main>
    );
  }

  if (!walletAddress && !initialWallet) {
    return null; // Will redirect
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020504] text-white">
      <div className="galaxy-field" aria-hidden="true" />
      <div className="aurora-field" aria-hidden="true" />
      <div
        className="stellar-grid"
        data-parallax
        data-parallax-speed="0.035"
        aria-hidden="true"
      />
      <ScrollParallax />
      <Particles
        className="fixed inset-0 z-[1]"
        particleColors={["#ffffff", "#5cf6ff", "#d8ff8f"]}
        particleCount={220}
        particleSpread={10}
        speed={0.16}
        particleBaseSize={1.05}
        moveParticlesOnHover={false}
        alphaParticles
      />

      <SiteNav activeRoute="onboarding" />

      <section className="parallax-section mx-auto max-w-7xl px-5 pb-20 pt-32">
        <div className="max-w-4xl">
          <SectionLabel>Debtor Verification</SectionLabel>
          <h1 className="text-balance text-5xl font-semibold leading-[0.96] tracking-tight sm:text-6xl">
            Verify your debtor identity to{" "}
            <span className="ice-gradient">acknowledge receivable obligations</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/64 sm:text-lg sm:leading-8">
            Complete debtor verification to acknowledge and repay receivable Offers
            on HorizonPay.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/dashboard/debtor"
              className="glass-button inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#020504]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <DebtorKYCForm
        walletAddress={walletAddress}
        initialProfile={profile}
        initialDocuments={documents}
      />

    </main>
  );
}

// Default export for backward compatibility
export default DebtorVerificationClientPage;
