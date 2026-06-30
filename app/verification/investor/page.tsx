"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/app/components/wallet-provider";
import { useInvestorVerificationStatus } from "@/lib/hooks";

import { BorderGlow } from "@/app/components/border-glow";
import { Particles } from "@/app/components/particles";
import { ScrollParallax } from "@/app/components/scroll-parallax";
import { SiteNav } from "@/app/components/site-nav";
import { SectionLabel, Card } from "@/app/components/ui";
import { InvestorKYCForm } from "./investor-kyc-form";
import { MetricCardsSkeleton } from "@/lib/utils/loading";

// Metadata moved to layout since this is now a client component
// export const metadata: Metadata = {
//   title: "Investor KYC Verification | HorizonPay",
//   description:
//     "Complete your Know Your Customer verification to unlock full access to HorizonPay features as an investor.",
//   openGraph: {
//     title: "Investor KYC Verification | HorizonPay",
//     description:
//       "Submit your investor documents for KYC verification and start funding receivable Offers.",
//     type: "website",
//   },
// };

export default function InvestorKYCPage() {
  const router = useRouter();
  const { address: walletAddress, isConnected } = useWallet();
  // Use custom hook for data fetching
  const { data: verificationData, isLoading, isError, error } = useInvestorVerificationStatus(
    walletAddress || ""
  );

  const profile = verificationData?.profile || null;
  const documents = profile?.verificationDocuments || [];

  // Redirect to onboarding if no wallet connected
  useEffect(() => {
    if (!isLoading && !walletAddress) {
      router.push("/onboarding");
    }
  }, [walletAddress, isLoading, router]);

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

  if (!walletAddress) {
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
          <SectionLabel>Investor KYC Verification</SectionLabel>
          <h1 className="text-balance text-5xl font-semibold leading-[0.96] tracking-tight sm:text-6xl">
            Verify your investor identity to{" "}
            <span className="ice-gradient">unlock full access</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/64 sm:text-lg sm:leading-8">
            Complete Know Your Customer verification to fund receivable Offers
            and access HorizonPay&apos;s full investment capabilities.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/dashboard/investor"
              className="glass-button inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#020504]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <InvestorKYCForm
        walletAddress={walletAddress}
        initialProfile={profile}
        initialDocuments={documents}
      />

    </main>
  );
}
