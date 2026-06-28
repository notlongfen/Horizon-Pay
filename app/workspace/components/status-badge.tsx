"use client";

import { getStatusVariant, truncateAddress } from "./types";
import type { StatusBadgeProps } from "./types";

const variantClasses: Record<string, string> = {
  draft: "bg-amber-900/30 text-amber-300 border-amber-700/30",
  pending: "bg-blue-900/30 text-blue-300 border-blue-700/30",
  active: "bg-cyan-900/30 text-cyan-300 border-cyan-700/30",
  success: "bg-emerald-900/30 text-emerald-300 border-emerald-700/30",
  warning: "bg-yellow-900/30 text-yellow-300 border-yellow-700/30",
  danger: "bg-red-900/30 text-red-300 border-red-700/30",
  frozen: "bg-indigo-900/30 text-indigo-300 border-indigo-700/30",
  cancelled: "bg-gray-800/30 text-gray-400 border-gray-600/30",
};

const variantLabels: Record<string, string> = {
  draft: "Draft",
  pending: "Pending",
  active: "Active",
  success: "Complete",
  warning: "Warning",
  danger: "Error",
  frozen: "Frozen",
  cancelled: "Cancelled",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const variant = getStatusVariant(status);
  const classes = variantClasses[variant] || variantClasses.draft;
  const label = variantLabels[variant] || status;

  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${classes} ${className}`}
    >
      {label}
    </span>
  );
}

// Onchain ID badge - shows when offer is on-chain
export function OnchainBadge({ onchainOfferId }: { onchainOfferId: string | undefined }) {
  if (!onchainOfferId) return null;

  return (
    <span
      className="px-2 py-0.5 text-[10px] font-mono bg-cyan-900/20 text-cyan-300 rounded border border-cyan-700/20"
      title="On-chain Offer ID"
    >
      #{onchainOfferId}
    </span>
  );
}

// Network badge
export function NetworkBadge({ network }: { network: string }) {
  const label = network === "testnet" ? "Testnet" : network.toUpperCase();
  
  return (
    <span
      className="px-2 py-0.5 text-[10px] font-medium bg-lime-900/20 text-lime-300 rounded border border-lime-700/20"
    >
      {label}
    </span>
  );
}

// Wallet address display
export function WalletAddress({ address, truncate }: { address: string; truncate?: boolean }) {
  if (!address) return <span className="text-white/50">Not connected</span>;
  
  const display = truncate ? truncateAddress(address, 10) : address;
  
  return (
    <span
      className="font-mono text-sm text-white/80"
      title={address}
    >
      {display}
    </span>
  );
}
