"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const roleItems = [
  { label: "Business", role: "business" },
  { label: "Debtor", role: "debtor" },
  { label: "Investor", role: "investor" },
  { label: "Admin", role: "admin" },
] as const;

type DashboardRole = (typeof roleItems)[number]["role"];

const preservedQueryKeys = [
  "offer",
  "offerId",
  "action",
  "reviewId",
] as const;

function getActiveRoleFromPath(pathname: string): DashboardRole {
  if (pathname.startsWith("/dashboard/business")) return "business";
  if (pathname.startsWith("/dashboard/debtor")) return "debtor";
  if (pathname.startsWith("/dashboard/investor")) return "investor";
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  return "business";
}

export function RoleSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeRole = getActiveRoleFromPath(pathname);
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const preservedQuery = useMemo(() => {
    const nextParams = new URLSearchParams();
    for (const key of preservedQueryKeys) {
      const value = searchParams.get(key);
      if (value) nextParams.set(key, value);
    }
    return nextParams.toString();
  }, [searchParams]);

  const hasOperationContext =
    Boolean(searchParams.get("offer") ?? searchParams.get("offerId")) ||
    Boolean(searchParams.get("action") ?? searchParams.get("reviewId"));

  function roleHref(role: DashboardRole) {
    const query = preservedQuery ? `?${preservedQuery}` : "";
    const hash = currentHash || (hasOperationContext ? "#operations" : "");
    return `/dashboard/${role}${query}${hash}`;
  }

  return (
    <div className="mx-auto max-w-4xl px-5 pt-32 pb-6">
      <nav className="glass-panel flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 p-2">
        {roleItems.map((item) => {
          const isActive = item.role === activeRole;
          return (
            <Link
              key={item.role}
              href={roleHref(item.role)}
              className={`px-10 py-5 text-lg font-medium rounded-xl transition-colors ${
                isActive
                  ? "bg-cyan-200/15 text-cyan-100 border border-cyan-200/30"
                  : "text-white/64 hover:text-white hover:bg-white/5"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
