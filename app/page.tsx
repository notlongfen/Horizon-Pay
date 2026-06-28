import Link from "next/link";
import { BorderGlow } from "./components/border-glow";
import { Particles } from "./components/particles";
import { ScrollParallax } from "./components/scroll-parallax";
import { SiteNav } from "./components/site-nav";

const networks = [
  "USDC",
  "Soroban",
  "Stellar",
  "Anchors",
  "Wallets",
  "KYC",
  "Invoices",
  "Stablecoins",
  "Indexers",
  "Investors",
];

const lifecycleSteps = [
  {
    step: "01",
    title: "Create Offer",
    copy: "A KYB-approved business drafts a Funding Offer backed by an invoice, service, subscription, product sale, or pay-later agreement.",
  },
  {
    step: "02",
    title: "Acknowledge",
    copy: "The debtor reviews the terms and acknowledges the obligation before the receivable can become active and fundable.",
  },
  {
    step: "03",
    title: "Fund",
    copy: "Verified investors fund the Offer at transparent terms, giving the business immediate liquidity from future payment.",
  },
  {
    step: "04",
    title: "Settle",
    copy: "When the debtor repays, Stellar and Soroban route repayment to the investor position with clear on-chain status updates.",
  },
];

const products = [
  {
    name: "Offer Studio",
    title: "Verified receivable creation",
    copy: "Approved businesses create receivable Offers with amount, due date, category, proof, and repayment terms.",
  },
  {
    name: "Funding Market",
    title: "Investor funding marketplace",
    copy: "Verified investors review acknowledged Offers and fund real-world receivables with transparent pricing and risk context.",
  },
  {
    name: "Repay Rail",
    title: "Stellar settlement flow",
    copy: "Debtors repay through stable-value Stellar rails while Soroban logic tracks Offer status and investor repayment.",
  },
];

const traction = [
  "Clinics",
  "Agencies",
  "Freelancers",
  "B2B suppliers",
  "SaaS",
];

const useCases = [
  "Invoice funding",
  "Pay-later Offers",
  "Subscription receivables",
  "Education installments",
  "Clinic payment plans",
  "B2B supplier terms",
  "Freelancer cash flow",
  "Embedded receivables funding",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="section-label mx-auto mb-5 w-fit rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
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

function FloatingTerminal({
  side,
  label,
  parallaxSpeed,
}: {
  side: "left" | "right";
  label: string;
  parallaxSpeed?: string;
}) {
  return (
    <div
      className={`floating-terminal hidden lg:block ${
        side === "left" ? "left-[-86px]" : "right-[-86px]"
      }`}
      data-parallax={parallaxSpeed ? "" : undefined}
      data-parallax-speed={parallaxSpeed}
      aria-hidden="true"
    >
      <div className="terminal-shell">
        <div className="terminal-screen">
          <div className="terminal-line" />
          <div className="terminal-line short" />
          <div className="terminal-chip">{label}</div>
        </div>
      </div>
    </div>
  );
}

function DebtStackObject() {
  return (
    <div className="debt-stack-object" aria-hidden="true">
      <div className="stack-orbit" />
      <div className="stack-card stack-card-top">
        <span>Offer</span>
        <strong>$12.8k</strong>
      </div>
      <div className="stack-card stack-card-mid">
        <span>Debtor</span>
        <strong>ACK</strong>
      </div>
      <div className="stack-card stack-card-low">
        <span>KYB</span>
        <strong>Verified</strong>
      </div>
      <div className="settlement-pill">Investor funded</div>
    </div>
  );
}

function OrbitalNetwork() {
  return (
    <div className="orbital-network" aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit-core">
        <span>HP</span>
      </div>
      {networks.map((network, index) => (
        <span key={network} className={`network-chip chip-${index + 1}`}>
          {network}
        </span>
      ))}
    </div>
  );
}

export default function Home() {
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
        particleCount={260}
        particleSpread={11}
        speed={0.18}
        particleBaseSize={1.15}
        moveParticlesOnHover={false}
        alphaParticles
      />

      <SiteNav activeRoute="home" />

      <section className="parallax-section relative mx-auto flex min-h-[1120px] max-w-7xl flex-col px-5 pb-20 pt-32 lg:min-h-[1180px] lg:pt-36">
        <FloatingTerminal
          side="left"
          label="Invoice"
          parallaxSpeed="-0.075"
        />
        <FloatingTerminal
          side="right"
          label="Stablecoin"
          parallaxSpeed="-0.055"
        />

        <div
          className="mx-auto max-w-4xl text-center"
          data-parallax
          data-parallax-speed="0.018"
        >
          <SectionLabel>Verified receivables funding on Stellar</SectionLabel>
          <h1 className="text-balance text-5xl font-semibold leading-[0.96] tracking-tight sm:text-7xl lg:text-8xl">
            Future payments{" "}
            <span className="ice-gradient">become present liquidity</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-white/64 sm:text-lg sm:leading-8">
            HorizonPay helps verified businesses create Funding Offers backed
            by real invoices, services, subscriptions, products, and pay-later
            agreements so investors can fund receivables with transparent terms.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/marketplace"
              className="star-button inline-flex min-h-12 items-center rounded-full bg-cyan-200 px-6 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#020504]"
            >
              Explore Funding Offers <ArrowGlyph />
            </Link>
            <Link
              href="#architecture"
              className="glass-button inline-flex min-h-12 items-center rounded-full px-6 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#020504]"
            >
              How the flow works
            </Link>
          </div>
        </div>

        <div
          className="relative mx-auto mt-12 h-[460px] w-full max-w-5xl sm:h-[540px]"
          data-parallax
          data-parallax-speed="-0.045"
        >
          <OrbitalNetwork />
        </div>

        <section
          id="what"
          className="relative mx-auto w-full max-w-6xl scroll-section"
          data-parallax
          data-parallax-speed="-0.025"
        >
          <BorderGlow className="glass-panel hero-info-panel grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
                What is HorizonPay?
              </p>
              <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
                A receivables funding marketplace, not random debt claims.
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-white/64">
                Only approved businesses can create Offers. Every Offer is
                backed by real commerce, acknowledged by the debtor, and shown
                to verified investors with amount, due date, funding price,
                repayment terms, risk context, and verification status.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/onboarding" className="mini-action">
                  Create verified Offers
                </Link>
              </div>
            </div>
            <DebtStackObject />
          </BorderGlow>
        </section>
      </section>

      <section id="products" className="parallax-section mx-auto max-w-7xl px-5 py-24">
        <SectionLabel>HorizonPay marketplace</SectionLabel>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Verified Offers with{" "}
            <span className="ice-gradient">debtor acknowledgement</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {products.map((product, index) => (
            <BorderGlow key={product.name} className="product-card glass-panel">
              <div
                className={`product-object object-${index + 1}`}
                data-parallax
                data-parallax-speed={index === 1 ? "-0.045" : "-0.032"}
                aria-hidden="true"
              >
                <div />
                <span />
              </div>
              <p className="text-sm text-cyan-100/70">{product.name}</p>
              <h3 className="mt-3 text-2xl font-semibold">{product.title}</h3>
              <p className="mt-4 leading-7 text-white/58">{product.copy}</p>
            </BorderGlow>
          ))}
        </div>
      </section>

      <section className="parallax-section mx-auto max-w-7xl px-5 py-20">
        <SectionLabel>Receivable examples</SectionLabel>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {traction.map((item) => (
            <div
              key={item}
              className="traction-orb"
              data-parallax
              data-parallax-speed="-0.018"
            >
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="architecture" className="parallax-section mx-auto max-w-7xl px-5 py-24">
        <SectionLabel>Receivable Offer lifecycle</SectionLabel>
        <div className="architecture-stage">
          <div
            className="architecture-core"
            data-parallax
            data-parallax-speed="-0.05"
            aria-hidden="true"
          >
            <div className="core-disc">
              <span>HP</span>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            {lifecycleSteps.map((item) => (
              <BorderGlow key={item.step} className="glass-panel lifecycle-card">
                <p className="font-mono text-sm text-cyan-200">{item.step}</p>
                <h3 className="mt-8 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-4 leading-7 text-white/58">{item.copy}</p>
              </BorderGlow>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className="parallax-section mx-auto max-w-7xl px-5 py-24">
        <SectionLabel>Cash-flow powered use cases</SectionLabel>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Receivables funding for businesses that wait to get paid
          </h2>
        </div>
        <BorderGlow className="glass-panel mt-12 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm font-semibold text-white/76"
            >
              <span className="mr-2 text-cyan-200">+</span>
              {item}
            </div>
          ))}
        </BorderGlow>
      </section>

      <section id="access" className="parallax-section px-5 pb-10 pt-20">
        <BorderGlow className="glass-panel mx-auto max-w-7xl overflow-hidden p-7 sm:p-10 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <SectionLabel>Access HorizonPay</SectionLabel>
              <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                Future promises to pay become present liquidity.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62">
                Start with business onboarding, Offer creation, debtor
                acknowledgement, investor funding, Stellar repayment, and
                portfolio visibility from the same account flow.
              </p>
              <Link
                href="/onboarding"
                className="star-button mt-9 inline-flex min-h-12 items-center rounded-full bg-cyan-200 px-6 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#07110f]"
              >
                Talk to the team <ArrowGlyph />
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
                <span>Funded</span>
                <strong>$950 now</strong>
              </div>
              <div className="cta-ledger secondary">
                <span>Expected</span>
                <strong>$1,000 due</strong>
              </div>
            </div>
          </div>
          <footer className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/46 sm:flex-row sm:items-center sm:justify-between">
            <p>HorizonPay. Verified receivables funding on Stellar.</p>
            <div className="flex gap-5">
              <Link href="#what" className="hover:text-white">
                PayFi
              </Link>
              <Link href="#architecture" className="hover:text-white">
                Architecture
              </Link>
              <Link href="/onboarding" className="hover:text-white">
                Access
              </Link>
            </div>
          </footer>
        </BorderGlow>
      </section>
    </main>
  );
}
