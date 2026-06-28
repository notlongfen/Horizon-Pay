import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BorderGlow } from "../components/border-glow";
import { Particles } from "../components/particles";
import { ScrollParallax } from "../components/scroll-parallax";
import { SiteNav } from "../components/site-nav";
import { RoleSwitcher } from "./role-switcher";

export const metadata: Metadata = {
  title: "Dashboard | HorizonPay",
  description: "Manage your role-specific operations and workflows",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

      {/* Role Switcher */}
      <Suspense fallback={null}>
        <RoleSwitcher />
      </Suspense>

      <section className="dashboard-content px-5">{children}</section>

      <section className="parallax-section px-5 pb-10 pt-20">
        <BorderGlow className="glass-panel mx-auto max-w-7xl overflow-hidden p-7 sm:p-10 lg:p-12">
          <footer className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/46 sm:flex-row sm:items-center sm:justify-between">
            <p>HorizonPay. Verified receivables funding on Stellar.</p>
            <div className="flex gap-5">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <Link href="/marketplace" className="hover:text-white">
                Offers
              </Link>
              <Link href="/onboarding" className="hover:text-white">
                Onboarding
              </Link>
            </div>
          </footer>
        </BorderGlow>
      </section>
    </main>
  );
}
