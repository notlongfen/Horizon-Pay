// Shared formatting utilities
// Used across marketplace, workspace, and dashboard components

// Helper to get currency formatter - recreate each time to avoid serialization issues
function getCurrencyFormatter() {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Helper to get short date formatter - recreate each time to avoid serialization issues
function getDateFormatter() {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

// Helper to get long date formatter - recreate each time to avoid serialization issues
function getLongDateFormatter() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format cents to USD currency string
 * @example formatCents(1250) // "$12.50"
 */
export function formatCents(cents: bigint | number): string {
  return getCurrencyFormatter().format(Number(cents) / 100);
}

/**
 * Convert string to cents (multiplies by 100)
 * @example centsFromDollarInput("12.50") // 1250n
 */
export function centsFromDollarInput(value?: string, fallback = "0"): bigint {
  const normalized = (value || fallback).replace(/[^0-9.]/g, "");
  const [whole = "0", fraction = ""] = normalized.split(".");
  return BigInt(whole || "0") * BigInt(100) + BigInt((fraction + "00").slice(0, 2));
}

/**
 * Format date to short format (e.g., "Jan 15, 2025")
 */
export function formatShortDate(date: Date): string {
  return getDateFormatter().format(date);
}

/**
 * Format date to long format (e.g., "January 15, 2025")
 */
export function formatLongDate(date: Date): string {
  return getLongDateFormatter().format(date);
}

/**
 * Calculate days until a date
 */
export function daysUntil(date: Date): number {
  const diffMs = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / 86_400_000));
}

/**
 * Convert date input to timestamp
 */
export function timestampFromDateInput(value?: string): string {
  const date = value ? new Date(`${value}T00:00:00.000Z`) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return Math.floor(date.getTime() / 1000).toString();
}

/**
 * Convert snake_case or UPPER_CASE to Title Case
 * @example titleCase("DRAFT_STATUS") // "Draft Status"
 * @example titleCase("pending_acknowledgement") // "Pending Acknowledgement"
 */
export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Format Stellar address for display (truncate middle)
 */
export function formatStellarAddress(address: string, length = 10): string {
  if (!address) return "N/A";
  return address.length <= length * 2
    ? address
    : `${address.slice(0, length)}...${address.slice(-length)}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}
