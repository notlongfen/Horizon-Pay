import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Particles } from "@/app/components/particles";
import { ScrollParallax } from "@/app/components/scroll-parallax";
import { SiteNav } from "@/app/components/site-nav";
import { WalletConnectButton } from "@/app/components/wallet-provider";
import { getPrismaClient } from "@/lib/db/prisma";
import { getHorizonPayContracts } from "@/lib/contracts/horizonpay-contracts";
import { Card, SectionLabel, StatusBadge, ArrowGlyph } from "@/app/components/ui";
import { formatCents, titleCase, formatLongDate } from "@/lib/utils";

function statusLabel(status: string) {
  return titleCase(status);
}

export const metadata: Metadata = {
  title: "Acknowledge Offer | HorizonPay",
  description:
    "Review and acknowledge your payment obligation for this verified receivable Offer on HorizonPay.",
  openGraph: {
    title: "Acknowledge Offer | HorizonPay",
    description:
      "Debtor acknowledgement page for verified receivable Offers with transparent terms and business details.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Acknowledge Offer | HorizonPay",
    description:
      "Review business, amount, due date, and terms before acknowledging your payment obligation.",
  },
};

export const dynamic = "force-dynamic";

import { getVerificationLabel } from "@/lib/utils";

// Use the centralized verification label utility

function riskLabel(risk: string) {
  if (risk === "LOW") return "Low";
  if (risk === "ELEVATED") return "Elevated";
  return "Moderate";
}

function daysUntil(date: Date) {
  const diffMs = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / 86_400_000));
}



function AcknowledgementObject() {
  return (
    <div className="acknowledgement-object" aria-hidden="true">
      <div className="ack-orbit" />
      <div className="ack-disc">
        <span>ACK</span>
      </div>
      <div className="ack-card ack-card-primary">
        <span>Offer</span>
        <strong>$12.8k</strong>
      </div>
      <div className="ack-card ack-card-secondary">
        <span>Due</span>
        <strong>43d</strong>
      </div>
      <div className="ack-pill">Verify and sign</div>
    </div>
  );
}

async function getOfferData(offerId: string) {
  const prisma = getPrismaClient();

  try {
    const offer = await prisma.offer.findUnique({
      where: {
        publicId: offerId,
      },
      include: {
        business: true,
        debtor: true,
        notes: { orderBy: { sortOrder: "asc" } },
        proofItems: { orderBy: { sortOrder: "asc" } },
        timeline: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!offer) {
      return null;
    }

    return {
      offer,
      business: offer.business,
      debtor: offer.debtor,
      contracts: getHorizonPayContracts(),
    };
  } catch (error) {
    console.error("Failed to fetch offer data:", error);
    return null;
  }
}

function OfferSummaryCard({ offer, business }: {
  offer: any;
  business: any;
}) {
  const dueInDays = daysUntil(offer.dueDate);

  return (
    <Card variant="glass" padding="md" className="ack-summary-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
            Offer Summary
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {offer.summary || `Receivable ${offer.publicId}`}
          </h2>
        </div>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
          Pending ACK
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Business
          </p>
          <p className="mt-3 text-xl font-semibold text-white">{business.name}</p>
          <p className="mt-1 text-xs text-white/46">
            {business.industry || "Verified business"}
          </p>
          <p className="mt-2 text-xs text-white/46">
            {getVerificationLabel(business.verificationStatus)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Principal Amount
          </p>
          <p className="mt-3 text-xl font-semibold text-white">
            {formatCents(offer.principalAmountCents)}
          </p>
          <p className="mt-1 text-xs text-white/46">
            Full repayment amount
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Due Date
          </p>
          <p className="mt-3 text-xl font-semibold text-white">
            {formatLongDate(offer.dueDate)}
          </p>
          <p className="mt-1 text-xs text-white/46">
            {dueInDays > 0 ? `In ${dueInDays} days` : "Due today"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Funding Price
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {formatCents(offer.fundingPriceCents)}
          </p>
          <p className="mt-1 text-xs text-white/46">
            Investor pays this amount
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Expected Repayment
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {formatCents(offer.expectedRepaymentCents)}
          </p>
          <p className="mt-1 text-xs text-white/46">
            When debtor repays in full
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Risk Assessment
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {riskLabel(offer.risk)}
          </p>
          <p className="mt-1 text-xs text-white/46">
            Platform risk score
          </p>
        </div>
      </div>
    </Card>
  );
}

function OfferDetailsSection({ offer, business }: {
  offer: any;
  business: any;
}) {
  return (
    <Card variant="glass" padding="md">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
        Offer Details
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold text-white">Description</h3>
          <p className="mt-2 leading-7 text-white/64">{offer.summary}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Category</h3>
          <p className="mt-2 leading-7 text-white/64">{offer.category}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Repayment Asset</h3>
          <p className="mt-2 font-mono text-sm text-white/76">
            {offer.repaymentAsset}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Status</h3>
          <p className="mt-2 leading-7 text-white/64">
            {statusLabel(offer.status)}
          </p>
        </div>
      </div>

      {offer.notes && offer.notes.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white">Additional Notes</h3>
          <div className="mt-3 grid gap-3">
            {offer.notes.map((note: any, index: number) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/76"
              >
                {note.body}
              </div>
            ))}
          </div>
        </div>
      )}

      {offer.proofItems && offer.proofItems.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white">Supporting Proof</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {offer.proofItems.map((item: any, index: number) => (
              <span
                key={index}
                className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs font-medium text-white/64"
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function BusinessProfileSection({ business }: { business: any }) {
  return (
    <Card variant="glass" padding="md">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
        Business Profile
      </p>

      <div className="mt-6 flex items-start gap-6">
        <div className="flex-1">
          <h3 className="text-2xl font-semibold text-white">{business.name}</h3>
          <p className="mt-1 text-lg text-white/76">{business.industry}</p>
          <p className="mt-4 leading-7 text-white/64">{business.description}</p>
        </div>

        <div className="flex-shrink-0">
          <div className="rounded-full border-2 border-cyan-400/30 bg-cyan-400/10 px-6 py-3 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
              Verification
            </p>
            <p className="mt-1 text-sm font-semibold text-cyan-100">
              {getVerificationLabel(business.verificationStatus)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Business Wallet
          </p>
          <p className="mt-2 font-mono text-sm text-white/76 truncate">
            {business.walletAddress}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Registered Since
          </p>
          <p className="mt-2 text-sm text-white/76">
            {business.createdAt
              ? formatLongDate(new Date(business.createdAt))
              : "Not available"}
          </p>
        </div>
      </div>
    </Card>
  );
}

function AcknowledgementActions({ offerId }: { offerId: string }) {
  return (
    <Card variant="glass" padding="md" className="ack-actions-panel">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
        Your Action
      </p>

      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Review, then acknowledge this obligation
      </h2>

      <p className="mt-4 max-w-2xl leading-7 text-white/64">
        By acknowledging, you confirm that you understand and accept the payment
        obligation described in this Offer. The business has verified this
        receivable, and the amount, due date, and terms are binding. Once
        acknowledged, this Offer may be listed for investor funding.
      </p>

      <p className="mt-4 text-sm leading-6 text-white/46">
        If any details appear incorrect, use the Dispute option to flag the
        Offer for admin review before acknowledgement.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link
          href={`/offers/${offerId}/acknowledge/confirm`}
          className="star-button inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-200 px-6 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#07110f]"
        >
          Acknowledge Offer <ArrowGlyph />
        </Link>

        <Link
          href={`/offers/${offerId}/dispute`}
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#07110f]"
        >
          Dispute Offer
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href={`/dashboard/debtor?offer=${offerId}#operations`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/64 transition hover:bg-white/5 hover:text-white"
        >
          <span className="text-cyan-200">←</span>
          Back to Dashboard
        </Link>

        <Link
          href="/marketplace"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/64 transition hover:bg-white/5 hover:text-white"
        >
          View All Offers
        </Link>
      </div>
    </Card>
  );
}

function SecurityNotice() {
  return (
    <Card variant="glass" padding="sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full border border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center">
            <span className="text-cyan-100">🔒</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
            Security Notice
          </p>

          <p className="mt-2 text-sm leading-6 text-white/76">
            <strong className="text-white">Connect your wallet to acknowledge.</strong>
          </p>
        </div>
      </div>
    </Card>
  );
}

export default async function AcknowledgeOfferPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getOfferData(params.id);

  if (!data) {
    notFound();
  }

  const { offer, business, debtor } = data;

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
        particleCount={180}
        particleSpread={8}
        speed={0.14}
        particleBaseSize={0.95}
        moveParticlesOnHover={false}
        alphaParticles
      />

      <SiteNav activeRoute="marketplace" />

      <AcknowledgementObject />

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-16 sm:py-24">
        <SectionLabel>Debtor Acknowledgement</SectionLabel>

        <OfferSummaryCard offer={offer} business={business} />

        <div className="mt-8">
          <OfferDetailsSection offer={offer} business={business} />
        </div>

        <div className="mt-8">
          <BusinessProfileSection business={business} />
        </div>

        <div className="mt-8">
          <AcknowledgementActions offerId={offer.publicId} />
        </div>

        <div className="mt-8">
          <SecurityNotice />
        </div>
      </div>

      <section className="parallax-section px-5 pb-10 pt-20">
        <Card variant="glass" padding="lg" className="mx-auto max-w-7xl overflow-hidden">
          <footer className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/46 sm:flex-row sm:items-center sm:justify-between">
            <p>HorizonPay. Verified receivables funding on Stellar.</p>
            <div className="flex gap-5">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <Link href="/marketplace" className="hover:text-white">
                Offers
              </Link>
              <Link href={`/dashboard/debtor?offer=${offer.publicId}#operations`} className="hover:text-white">
                Dashboard
              </Link>
              <Link href="/dashboard" className="hover:text-white">
                Get Started
              </Link>
            </div>
          </footer>
        </Card>
      </section>
    </main>
  );
}
