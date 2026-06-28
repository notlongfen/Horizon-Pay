"use client";

import { type HTMLAttributes } from "react";

/**
 * Status badge variant types
 */
export type StatusBadgeVariant =
  | "default"
  | "draft"
  | "pending"
  | "active"
  | "success"
  | "warning"
  | "danger"
  | "frozen"
  | "cancelled";

/**
 * Status badge props
 */
export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: string;
  variant?: StatusBadgeVariant;
}

/**
 * Variant to color mapping
 */
const variantClasses: Record<StatusBadgeVariant, string> = {
  default: "border-white/10 bg-white/5 text-white/46",
  draft: "border-amber-700/30 bg-amber-900/30 text-amber-300",
  pending: "border-blue-700/30 bg-blue-900/30 text-blue-300",
  active: "border-cyan-700/30 bg-cyan-900/30 text-cyan-300",
  success: "border-emerald-700/30 bg-emerald-900/30 text-emerald-300",
  warning: "border-yellow-700/30 bg-yellow-900/30 text-yellow-300",
  danger: "border-red-700/30 bg-red-900/30 text-red-300",
  frozen: "border-indigo-700/30 bg-indigo-900/30 text-indigo-300",
  cancelled: "border-gray-600/30 bg-gray-800/30 text-gray-400",
};

/**
 * Status to variant mapping for common status values
 */
function getStatusVariant(status: string): StatusBadgeVariant {
  const statusMap: Record<string, StatusBadgeVariant> = {
    DRAFT: "default",
    PENDING_DEBTOR_ACKNOWLEDGEMENT: "warning",
    ACTIVE: "success",
    ACKNOWLEDGED: "success",
    LISTED: "active",
    FUNDED: "success",
    PARTIALLY_REPAID: "warning",
    SETTLED: "success",
    REPAID: "success",
    OVERDUE: "danger",
    DEFAULTED: "danger",
    DISPUTED: "warning",
    FROZEN: "frozen",
    CANCELLED: "cancelled",
  };

  const lowerStatus = status?.toUpperCase();
  return statusMap[lowerStatus as keyof typeof statusMap] || "default";
}

/**
 * Display label mapping for status values
 */
function getDisplayLabel(status: string): string {
  const labelMap: Record<string, string> = {
    DRAFT: "Draft",
    PENDING_DEBTOR_ACKNOWLEDGEMENT: "Pending ACK",
    ACTIVE: "Active",
    ACKNOWLEDGED: "Acknowledged",
    LISTED: "Listed",
    FUNDED: "Funded",
    PARTIALLY_REPAID: "Partially Repaid",
    SETTLED: "Settled",
    REPAID: "Repaid",
    OVERDUE: "Overdue",
    DEFAULTED: "Defaulted",
    DISPUTED: "Disputed",
    FROZEN: "Frozen",
    CANCELLED: "Cancelled",
  };

  const upperStatus = status?.toUpperCase();
  return labelMap[upperStatus as keyof typeof labelMap] || status;
}

/**
 * StatusBadge component - Displays a status pill with appropriate styling
 */
export function StatusBadge({
  status,
  variant: propVariant,
  className = "",
  ...props
}: StatusBadgeProps) {
  const variant = propVariant || getStatusVariant(status);
  const classes = variantClasses[variant];
  const label = getDisplayLabel(status);

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${classes} ${className}`}
      {...props}
    >
      {label}
    </span>
  );
}

/**
 * OnchainBadge component - Shows when an offer is on-chain
 */
export function OnchainBadge({
  onchainOfferId,
  className = "",
  ...props
}: { onchainOfferId?: string } & HTMLAttributes<HTMLSpanElement>) {
  if (!onchainOfferId) return null;

  return (
    <span
      className={`px-2 py-0.5 text-[10px] font-mono bg-cyan-900/20 text-cyan-300 rounded border border-cyan-700/20 ${className}`}
      title="On-chain Offer ID"
      {...props}
    >
      #{onchainOfferId}
    </span>
  );
}

/**
 * NetworkBadge component - Shows the network (e.g., Testnet, Mainnet)
 */
export function NetworkBadge({
  network,
  className = "",
  ...props
}: { network: string } & HTMLAttributes<HTMLSpanElement>) {
  const label = network?.toLowerCase() === "testnet" ? "Testnet" : network?.toUpperCase() || "Unknown";

  return (
    <span
      className={`px-2 py-0.5 text-[10px] font-medium bg-lime-900/20 text-lime-300 rounded border border-lime-700/20 ${className}`}
      {...props}
    >
      {label}
    </span>
  );
}

/**
 * WalletAddress component - Displays a wallet address with optional truncation
 */
export function WalletAddress({
  address,
  truncate = true,
  className = "",
  ...props
}: { address?: string; truncate?: boolean } & HTMLAttributes<HTMLSpanElement>) {
  if (!address) {
    return (
      <span className={`text-white/50 ${className}`} {...props}>
        Not connected
      </span>
    );
  }

  const display = truncate ? `${address.slice(0, 10)}...${address.slice(-10)}` : address;

  return (
    <span
      className={`font-mono text-sm text-white/80 ${className}`}
      title={address}
      {...props}
    >
      {display}
    </span>
  );
}

/**
 * Truncate address utility function
 */
export function truncateAddress(address: string, length = 10): string {
  if (!address) return "N/A";
  return address.length <= length * 2
    ? address
    : `${address.slice(0, length)}...${address.slice(-length)}`;
}
