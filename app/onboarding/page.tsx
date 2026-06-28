import type { Metadata } from "next";
import Link from "next/link";
import { BorderGlow } from "../components/border-glow";
import { Particles } from "../components/particles";
import { ScrollParallax } from "../components/scroll-parallax";
import { SiteNav } from "../components/site-nav";
import { WalletConnectButton } from "../components/wallet-provider";
import { RoleOnboardingPanel } from "./role-onboarding-panel";

export const metadata: Metadata = {
  title: "Onboarding | HorizonPay",
  description:
    "Connect a Stellar wallet, select a HorizonPay role, and start the verification path for receivable Offers.",
  openGraph: {
    title: "Onboarding | HorizonPay",
    description:
      "Role-based onboarding for businesses, investors, and debtors using HorizonPay verified receivable Offers.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Onboarding | HorizonPay",
    description:
      "Connect a wallet, choose your role, and continue toward verification on HorizonPay.",
  },
};

const verificationSteps = [
  {
    step: "01",
    title: "Connect wallet",
    copy: "Use a Stellar-compatible wallet so HorizonPay can anchor the role, signatures, and future Offer actions to a clear account.",
  },
  {
    step: "02",
    title: "Choose role",
    copy: "Select whether this account creates Offers, funds listed Offers, or acknowledges receivable obligations.",
  },
  {
    step: "03",
    title: "Verify access",
    copy: "Complete the relevant KYB, investor, or debtor verification path before restricted actions become available.",
  },
];

const statusRows = [
  { label: "Wallet", value: "Required", tone: "cyan" },
  { label: "Role", value: "Select one", tone: "lime" },
  { label: "Verification", value: "Not started", tone: "neutral" },
  { label: "Access", value: "Read-only", tone: "neutral" },
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

function OnboardingObject() {
  return (
    <div className="onboarding-object" aria-hidden="true">
      <div className="onboarding-orbit" />
      <div className="identity-disc">
        <span>HP</span>
      </div>
      <div className="identity-card identity-card-business">
        <span>Business</span>
        <strong>KYB</strong>
      </div>
      <div className="identity-card identity-card-investor">
        <span>Investor</span>
        <strong>Access</strong>
      </div>
      <div className="identity-card identity-card-debtor">
        <span>Debtor</span>
        <strong>ACK</strong>
      </div>
      <div className="identity-path identity-path-one" />
      <div className="identity-path identity-path-two" />
    </div>
  );
}

export default function OnboardingPage() {
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
        activeRoute="onboarding"
        ctaHref="/onboarding"
        ctaLabel="Start onboarding"
      />

      <section className="parallax-section mx-auto grid min-h-[780px] max-w-7xl gap-12 px-5 pb-20 pt-32 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pt-36">
        <div data-parallax data-parallax-speed="0.014">
          <SectionLabel>Wallet and role setup</SectionLabel>
          <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.96] tracking-tight sm:text-7xl">
            Start with the account that will{" "}
            <span className="ice-gradient">sign the flow</span>
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-white/64 sm:text-lg sm:leading-8">
            HorizonPay routes each user into the right verification path before
            they create, acknowledge, fund, or repay receivable Offers.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#setup"
              className="star-button inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-200 px-6 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#020504]"
            >
              Choose role <ArrowGlyph />
            </Link>
            <Link
              href="/marketplace"
              className="glass-button inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#020504]"
            >
              Preview Offers
            </Link>
          </div>
        </div>

        <div data-parallax data-parallax-speed="-0.045">
          <OnboardingObject />
        </div>
      </section>

      <section id="setup" className="parallax-section mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <BorderGlow className="glass-panel onboarding-wallet-panel p-6 sm:p-7">
            <SectionLabel>Account status</SectionLabel>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Connect wallet, then pick your role.
            </h2>
            <p className="mt-4 leading-7 text-white/62">
              Use the same wallet for all signatures and restricted actions
              throughout your chosen HorizonPay path.
            </p>
            <div className="mt-7">
              <WalletConnectButton />
            </div>
            <dl className="onboarding-status-grid">
              {statusRows.map((row) => (
                <div key={row.label} className={`tone-${row.tone}`}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </BorderGlow>

          <BorderGlow className="glass-panel p-4 sm:p-5">
            <RoleOnboardingPanel />
          </BorderGlow>
        </div>
      </section>

      <section className="parallax-section mx-auto max-w-7xl px-5 py-24">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="lg:sticky lg:top-32">
            <SectionLabel>Verification sequence</SectionLabel>
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Every restricted action starts behind a clear gate.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/62">
              Businesses, investors, and debtors see different next steps, but
              the product keeps the same trust order: account → role →
              verification → action.
            </p>
          </div>
          <div className="grid gap-4">
            {verificationSteps.map((item) => (
              <BorderGlow key={item.step} className="glass-panel onboarding-step-card">
                <span>{item.step}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </BorderGlow>
            ))}
          </div>
        </div>
      </section>

      <section className="parallax-section px-5 pb-10 pt-8">
        <BorderGlow className="glass-panel mx-auto max-w-7xl overflow-hidden p-7 sm:p-10 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <SectionLabel>Next dashboard</SectionLabel>
              <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                Continue from onboarding into the business dashboard.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62">
                After role selection and verification, continue into role
                dashboards for Offer creation, acknowledgements, funding,
                repayment, and compliance review.
              </p>
              <Link
                href="/dashboard/business"
                className="star-button mt-9 inline-flex min-h-12 items-center rounded-full bg-cyan-200 px-6 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#07110f]"
              >
                Open dashboard <ArrowGlyph />
              </Link>
            </div>
            <div className="onboarding-next-panel" aria-hidden="true">
              <div>
                <span>Business dashboard</span>
                <strong>$86.4k</strong>
                <small>Receivables value</small>
              </div>
              <div>
                <span>Offer creation</span>
                <strong>Ready</strong>
                <small>After KYB approval</small>
              </div>
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
              <a href="#setup" className="hover:text-white">
                Onboarding
              </a>
            </div>
          </footer>
        </BorderGlow>
      </section>
    </main>
  );
}
