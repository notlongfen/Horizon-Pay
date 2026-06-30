import { VerificationStatus } from "../../app/generated/prisma/enums";

/**
 * Verification status labels for display purposes
 */
export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Verification pending",
  SUBMITTED: "Submitted for review",
  IN_REVIEW: "Under review",
  KYB_VERIFIED: "KYB verified",
  KYC_VERIFIED: "KYC verified",
  SUSPENDED: "Verification suspended",
  REJECTED: "Verification rejected",
};

/**
 * Get human-readable label for a verification status
 */
export function getVerificationLabel(status: string | VerificationStatus | null | undefined): string {
  if (!status) return "Unknown status";
  return VERIFICATION_STATUS_LABELS[status] || "Unknown status";
}

/**
 * Verification status color mapping for UI
 */
export type VerificationStatusColor = "success" | "warning" | "error" | "default";

export const VERIFICATION_STATUS_COLORS: Record<string, VerificationStatusColor> = {
  PENDING: "warning",
  SUBMITTED: "warning",
  IN_REVIEW: "warning",
  KYB_VERIFIED: "success",
  KYC_VERIFIED: "success",
  SUSPENDED: "error",
  REJECTED: "error",
};

/**
 * Get color for a verification status (for UI badges)
 */
export function getVerificationStatusColor(status: string | VerificationStatus | null | undefined): VerificationStatusColor {
  if (!status) return "default";
  return VERIFICATION_STATUS_COLORS[status] || "default";
}

/**
 * Check if a verification status is approved
 */
export function isVerificationApproved(status: string | VerificationStatus | null | undefined): boolean {
  return status === "KYB_VERIFIED" || status === "KYC_VERIFIED";
}

/**
 * Check if a verification status is pending
 */
export function isVerificationPending(status: string | VerificationStatus | null | undefined): boolean {
  return status === "PENDING" || status === "SUBMITTED" || status === "IN_REVIEW";
}

/**
 * Check if a verification status is failed/rejected
 */
export function isVerificationFailed(status: string | VerificationStatus | null | undefined): boolean {
  return status === "SUSPENDED" || status === "REJECTED";
}

/**
 * Get the appropriate verification status type based on role
 * - Businesses: KYB_VERIFIED
 * - Investors/Debtors: KYC_VERIFIED
 */
export function getVerificationStatusForRole(role: "business" | "investor" | "debtor"): VerificationStatus {
  return role === "business" ? "KYB_VERIFIED" : "KYC_VERIFIED";
}

/**
 * Check if user has the required verification status for their role
 */
export function hasRequiredVerificationStatus(
  role: "business" | "investor" | "debtor",
  status: string | VerificationStatus | null | undefined
): boolean {
  const requiredStatus = getVerificationStatusForRole(role);
  return status === requiredStatus;
}

/**
 * Verification role labels for display
 */
export const VERIFICATION_ROLE_LABELS: Record<string, string> = {
  business: "KYB",
  investor: "KYC",
  debtor: "KYC",
};

/**
 * Get the verification type label for a role
 */
export function getVerificationTypeLabel(role: "business" | "investor" | "debtor"): string {
  return VERIFICATION_ROLE_LABELS[role] || "Verification";
}