import type { Metadata } from "next";
import Link from "next/link";
import { getHorizonPayContracts } from "@/lib/contracts/horizonpay-contracts";
import { getPrismaClient } from "@/lib/db/prisma";
import { CreateOfferForm } from "./create-offer-form";
import { Card, SectionLabel, ArrowGlyph } from "@/app/components/ui";
import { Particles } from "@/app/components/particles";
import { ScrollParallax } from "@/app/components/scroll-parallax";
import { SiteNav } from "@/app/components/site-nav";
import { isVerificationApproved } from "@/lib/utils";

const categories = [
  "Invoice",
  "Product sale",
  "Medical service",
  "Consulting service",
  "Subscription",
  "Education installment",
  "Pay-later agreement",
  "Repair service",
  "Supplier invoice",
  "B2B contract",
  "Marketplace settlement",
  "Other",
] as const;

const industries = [
  "Healthcare",
  "Agency",
  "Freelancer",
  "B2B supplier",
  "SaaS",
  "Education",
  "Retail",
  "Manufacturing",
  "Professional services",
  "Technology",
  "Other",
] as const;

const DEFAULT_REPAYMENT_ASSET =
  process.env.NEXT_PUBLIC_HORIZONPAY_REPAYMENT_ASSET_CONTRACT_ID ||
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export const metadata: Metadata = {
  title: "Create Offer | HorizonPay",
  description:
    "Create a verified receivable Offer backed by real products, services, invoices, or agreements on HorizonPay.",
  openGraph: {
    title: "Create Offer | HorizonPay",
    description:
      "Verified businesses create Funding Offers backed by real receivables on Stellar.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Offer | HorizonPay",
    description:
      "Create verified receivable Offers for liquidity on HorizonPay.",
  },
};



async function getBusinessProfile(walletAddress: string | undefined) {
  if (!walletAddress) return null;

  try {
    const prisma = getPrismaClient();
    return await prisma.businessProfile.findUnique({
      where: { walletAddress },
    });
  } catch {
    return null;
  }
}

export default async function CreateOfferPage({
  searchParams,
}: {
  searchParams?: Promise<{ business?: string; debtor?: string }>;
}) {
  const contracts = getHorizonPayContracts();
  const params = await searchParams;
  const businessWallet = params?.business;

  const businessProfile = await getBusinessProfile(businessWallet);
  const isVerifiedBusiness = isVerificationApproved(businessProfile?.verificationStatus);

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
        particleCount={200}
        particleSpread={10}
        speed={0.14}
        particleBaseSize={1}
        moveParticlesOnHover={false}
        alphaParticles
      />

      <SiteNav activeRoute="marketplace" />
      {/* Form Section */}
      <section
        id="form"
        className="parallax-section mx-auto max-w-7xl px-5 pt-32 pb-16"
      >
        <Card padding="lg">
          <h1 className="text-3xl font-semibold text-white mb-8 text-center ice-gradient">Create Offer</h1>
          <CreateOfferForm
            businessProfile={businessProfile}
            defaultRepaymentAsset={DEFAULT_REPAYMENT_ASSET}
            categories={categories}
            industries={industries}
          />
        </Card>
      </section>

      {/* Flow Explanation Section */}
      <section className="parallax-section px-5 pb-10 pt-20">
        <Card padding="lg" overflowHidden>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <SectionLabel>How it works</SectionLabel>
              <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                Create, get acknowledged, then list for funding.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62">
                The Offer enters draft status immediately. Once your debtor
                acknowledges the obligation, you can list it in the marketplace
                for verified investors to fund.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                {
                  step: "01",
                  title: "Create Offer",
                  desc: "Draft your receivable with all required details",
                },
                {
                  step: "02",
                  title: "Debtor ACK",
                  desc: "Assigned debtor reviews and acknowledges obligation",
                },
                {
                  step: "03",
                  title: "List & Fund",
                  desc: "List for funding. Investors provide liquidity.",
                },
              ].map((item) => (
                <Card key={item.step} padding="sm" className="create-flow-card">
                  <span className="text-sm text-cyan-100/60">{item.step}</span>
                  <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm text-white/58">{item.desc}</p>
                </Card>
              ))}
            </div>
          </div>
          <footer className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/46 sm:flex-row sm:items-center sm:justify-between">
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
        </Card>
      </section>
    </main>
  );
}
