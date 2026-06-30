"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/app/components/wallet-provider";
import { useBusinessVerificationStatus } from "@/lib/hooks";

interface BusinessVerificationClientPageProps {
  initialWallet?: string;
}

import { BorderGlow } from "@/app/components/border-glow";
import { Particles } from "@/app/components/particles";
import { ScrollParallax } from "@/app/components/scroll-parallax";
import { SiteNav } from "@/app/components/site-nav";
import { SectionLabel, Card } from "@/app/components/ui";
import { BusinessKYBForm } from "./business-kyb-form";
import { MetricCardsSkeleton } from "@/lib/utils/loading";

// Note: Metadata moved to layout since this is now a client component
// export const metadata: Metadata = {
//   title: "Business KYB Verification | HorizonPay",
//   description:
//     "Complete your Know Your Business verification to unlock full access to HorizonPay features.",
//   openGraph: {
//     title: "Business KYB Verification | HorizonPay",
//     description:
//       "Submit your business documents for KYB verification and start creating receivable Offers.",
//     type: "website",
//   },
// };

const businessDocumentTypes = [
  {
    type: "BUSINESS_LICENSE",
    label: "Business License",
    description: "Valid business operating license",
    required: true,
  },
  {
    type: "INCORPORATION_CERTIFICATE",
    label: "Certificate of Incorporation",
    description: "Official incorporation documents",
    required: true,
  },
  {
    type: "TAX_ID",
    label: "Tax Identification",
    description: "Tax ID or EIN number",
    required: true,
  },
  {
    type: "BANK_STATEMENT",
    label: "Bank Statement",
    description: "Recent bank statement (within 3 months)",
    required: false,
  },
] as const;

const businessInfoFields = [
  {
    name: "registrationNumber",
    label: "Registration Number",
    type: "text",
    placeholder: "Enter your business registration number",
    required: true,
  },
  {
    name: "taxId",
    label: "Tax ID / EIN",
    type: "text",
    placeholder: "Enter your tax identification number",
    required: true,
  },
  {
    name: "businessAddress",
    label: "Business Address",
    type: "text",
    placeholder: "Enter your business address",
    required: true,
  },
  {
    name: "city",
    label: "City",
    type: "text",
    placeholder: "Enter city",
    required: true,
  },
  {
    name: "state",
    label: "State / Province",
    type: "text",
    placeholder: "Enter state or province",
    required: false,
  },
  {
    name: "country",
    label: "Country",
    type: "text",
    placeholder: "Enter country",
    required: true,
  },
  {
    name: "postalCode",
    label: "Postal Code",
    type: "text",
    placeholder: "Enter postal code",
    required: false,
  },
  {
    name: "website",
    label: "Website",
    type: "url",
    placeholder: "https://yourbusiness.com",
    required: false,
  },
  {
    name: "contactEmail",
    label: "Contact Email",
    type: "email",
    placeholder: "contact@yourbusiness.com",
    required: true,
  },
  {
    name: "contactPhone",
    label: "Contact Phone",
    type: "tel",
    placeholder: "+1 (555) 123-4567",
    required: false,
  },
  {
    name: "legalRepresentative",
    label: "Legal Representative",
    type: "text",
    placeholder: "Name of authorized legal representative",
    required: true,
  },
];

export function BusinessVerificationClientPage({ initialWallet }: BusinessVerificationClientPageProps = {}) {
  const router = useRouter();
  const { address: walletAddress, isConnected } = useWallet();
  // Use custom hook for data fetching
  // Use initial wallet if provided, otherwise fall back to connected wallet
  const effectiveWallet = initialWallet || walletAddress || "";
  const { data: verificationData, isLoading, isError, error } = useBusinessVerificationStatus(
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
          <SectionLabel>Business KYB Verification</SectionLabel>
          <h1 className="text-balance text-5xl font-semibold leading-[0.96] tracking-tight sm:text-6xl">
            Verify your business to{" "}
            <span className="ice-gradient">unlock full access</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/64 sm:text-lg sm:leading-8">
            Complete Know Your Business verification to create Funding Offers
            and access HorizonPay's full receivables funding capabilities.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/dashboard/business"
              className="glass-button inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#020504]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <BusinessKYBForm
        walletAddress={walletAddress}
        initialProfile={profile}
        initialDocuments={documents}
      />

      <section className="parallax-section px-5 pb-10 pt-20">
        <BorderGlow className="glass-panel mx-auto max-w-7xl overflow-hidden p-7 sm:p-10 lg:p-14">
          <footer className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/46 sm:flex-row sm:items-center sm:justify-between">
            <p>HorizonPay. Verified receivables funding on Stellar.</p>
            <div className="flex gap-5">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <Link href="/marketplace" className="hover:text-white">
                Offers
              </Link>
              <Link href="/dashboard/business" className="hover:text-white">
                Dashboard
              </Link>
            </div>
          </footer>
        </BorderGlow>
      </section>
    </main>
  );
}

// Default export for backward compatibility
export default BusinessVerificationClientPage;