import Link from "next/link";
import { ScrollNav } from "./scroll-nav";
import { WalletConnectButton } from "./wallet-provider";

type SiteNavProps = {
  activeRoute?: "home" | "marketplace" | "onboarding" | "dashboard";
  ctaHref?: string;
  ctaLabel?: string;
  showCta?: boolean;
  showWalletConnect?: boolean;
};

const pageRoutes = [
  { href: "/", label: "Home", route: "home" },
  { href: "/marketplace", label: "Offers", route: "marketplace" },
  { href: "/dashboard", label: "Get started", route: "dashboard" },
] as const;

export function SiteNav({
  activeRoute = "home",
  ctaHref = "/dashboard",
  ctaLabel = "Get started",
  showCta = false,
  showWalletConnect = true,
}: SiteNavProps) {
  return (
    <ScrollNav>
      <nav
        aria-label="Primary navigation"
        className="glass-nav site-nav mx-auto max-w-7xl rounded-[28px] px-4 py-3 sm:rounded-full sm:px-5"
      >
        <Link href="/" className="site-nav-brand">
          <span className="site-nav-mark">HP</span>
          <span className="site-nav-name">HorizonPay</span>
        </Link>

        <div className="site-nav-links" aria-label="Page routes">
          {pageRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={route.route === activeRoute ? "is-active" : undefined}
              aria-current={route.route === activeRoute ? "page" : undefined}
            >
              {route.label}
            </Link>
          ))}
        </div>

        <div className="site-nav-actions">
          {showCta && (
            <Link href={ctaHref} className="site-nav-cta">
              {ctaLabel}
            </Link>
          )}
          {showWalletConnect && <WalletConnectButton />}
        </div>
      </nav>
    </ScrollNav>
  );
}
