import type { Metadata } from "next";
import Link from "next/link";
import { BorderGlow } from "../components/border-glow";
import { Particles } from "../components/particles";
import { ScrollParallax } from "../components/scroll-parallax";
import { SiteNav } from "../components/site-nav";
import { getMarketplaceData } from "@/lib/marketplace/marketplace-service";
import { MarketplaceOfferBrowser } from "./marketplace-offer-browser";

export const metadata: Metadata = {
  title: "Offer Marketplace | HorizonPay",
  description:
    "Browse debtor-acknowledged receivable Offers from verified businesses on HorizonPay.",
  openGraph: {
    title: "Offer Marketplace | HorizonPay",
    description:
      "Investor marketplace for verified receivable Offers with purchase price, due date, risk context, and Stellar repayment status.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Offer Marketplace | HorizonPay",
    description:
      "Browse acknowledged Offers backed by invoices, services, products, subscriptions, and pay-later agreements.",
  },
};

export const dynamic = "force-dynamic";

const evaluationPoints = [
  "Business verification status",
  "Product or service backing",
  "Debtor acknowledgement",
  "Purchase price and expected repayment",
  "Due date and repayment asset",
  "Offer status from the registry",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="section-label mb-5 w-fit rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
      {children}
    </p>
  );
}

function ArrowGlyph() {
  return (
    <span aria-hidden="true" className="ml-2 inline-block text-cyan-950">
      -&gt;
    </span>
  );
}

function MarketplaceObject() {
  return (
    <div className="marketplace-object" aria-hidden="true">
      <div className="marketplace-orbit" />
      <div className="marketplace-offer-card marketplace-offer-card-top">
        <span>Offer</span>
        <strong>$12.8k</strong>
      </div>
      <div className="marketplace-offer-card marketplace-offer-card-mid">
        <span>Purchase</span>
        <strong>$12.1k</strong>
      </div>
      <div className="marketplace-offer-card marketplace-offer-card-low">
        <span>Due</span>
        <strong>43d</strong>
      </div>
      <div className="marketplace-ack-pill">Debtor ACK</div>
      <div className="marketplace-verified-pill">KYB verified</div>
    </div>
  );
}

export default async function MarketplacePage() {
  const { offers, stats, contracts } = await getMarketplaceData();
  const offerStats = [
    { label: "Listed Offers", value: stats.listedOffers },
    { label: "Receivables value", value: stats.receivablesValue },
    { label: "Median due window", value: stats.medianDueWindow },
    { label: "Acknowledged", value: stats.acknowledged },
  ];

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

      <SiteNav
        activeRoute="marketplace"
        ctaHref="#access"
        ctaLabel="Buyer access"
      />

      <section className="parallax-section mx-auto grid min-h-[760px] max-w-7xl gap-12 px-5 pb-20 pt-32 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pt-36">
        <div data-parallax data-parallax-speed="0.014">
          <SectionLabel>Verified Offer marketplace</SectionLabel>
          <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.96] tracking-tight sm:text-7xl">
            Browse acknowledged receivables{" "}
            <span className="ice-gradient">before purchase</span>
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-white/64 sm:text-lg sm:leading-8">
            HorizonPay lists Offers only after a verified business
            creates the receivable and the debtor acknowledges the obligation.
            Buyers compare real-world backing, terms, due dates, and status
            before committing capital.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#offers"
              className="star-button inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-200 px-6 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#020504]"
            >
              View listed Offers <ArrowGlyph />
            </Link>
            <Link
              href="#evaluate"
              className="glass-button inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#020504]"
            >
              Review evaluation model
            </Link>
          </div>
          <div className="mt-7 grid max-w-2xl gap-3 text-xs text-white/52 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <span className="block font-semibold uppercase tracking-[0.18em] text-cyan-100/62">
                Network
              </span>
              <strong className="mt-2 block text-sm text-white">
                Stellar {contracts.network}
              </strong>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <span className="block font-semibold uppercase tracking-[0.18em] text-cyan-100/62">
                Marketplace
              </span>
              <strong className="mt-2 block truncate font-mono text-xs text-white">
                {contracts.marketplace}
              </strong>
            </div>
          </div>
        </div>

        <div data-parallax data-parallax-speed="-0.045">
          <MarketplaceObject />
        </div>
      </section>

      <section className="parallax-section mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {offerStats.map((stat) => (
            <BorderGlow key={stat.label} className="glass-panel p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
                {stat.label}
              </p>
              <p className="mt-5 text-4xl font-semibold tracking-tight text-white">
                {stat.value}
              </p>
              <div className="mt-4 h-px bg-gradient-to-r from-cyan-400/30 to-transparent" />
            </BorderGlow>
          ))}
        </div>
      </section>

      <MarketplaceOfferBrowser offers={offers} />

      <section id="evaluate" className="parallax-section mx-auto max-w-7xl px-5 py-24">
        <BorderGlow className="glass-panel overflow-hidden p-7 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionLabel>Buyer evaluation</SectionLabel>
              <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                Purchase starts with verification, not yield hype.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/62">
                HorizonPay helps buyers understand what the Offer is, who
                created it, whether the debtor acknowledged it, and how
                repayment is expected to settle on Stellar.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {evaluationPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm font-semibold text-white/76"
                >
                  <span className="mr-2 text-cyan-200">+</span>
                  {point}
                </div>
              ))}
            </div>
          </div>
        </BorderGlow>
      </section>

      <section id="access" className="parallax-section px-5 pb-10 pt-20">
        <BorderGlow className="glass-panel mx-auto max-w-7xl overflow-hidden p-7 sm:p-10 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <SectionLabel>Buyer access</SectionLabel>
              <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                Request access before purchasing receivable Offers.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62">
                Purchase requests start with buyer verification, disclosure
                acceptance, and clear allocation terms before capital moves.
              </p>
              <Link
                href="/onboarding"
                className="star-button mt-9 inline-flex min-h-12 items-center rounded-full bg-cyan-200 px-6 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#07110f]"
              >
                Request buyer access <ArrowGlyph />
              </Link>
            </div>
            <div
              className="cta-object"
              data-parallax
              data-parallax-speed="-0.04"
              aria-hidden="true"
            >
              <div className="cta-ring" />
              <div className="cta-ledger">
                <span>Buyer funds</span>
                <strong>$12,120</strong>
              </div>
              <div className="cta-ledger secondary">
                <span>Debtor repays</span>
                <strong>$12,800</strong>
              </div>
            </div>
          </div>
          <footer className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/46 sm:flex-row sm:items-center sm:justify-between">
            <p>HorizonPay. Verified receivables purchase on Stellar.</p>
            <div className="flex gap-5">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <Link href="#offers" className="hover:text-white">
                Offers
              </Link>
              <Link href="#evaluate" className="hover:text-white">
                Evaluate
              </Link>
            </div>
          </footer>
        </BorderGlow>
      </section>
    </main>
  );
}
