// Shared action configuration for workspace
// Centralized definitions for all workspace actions

// Action types
type WorkspaceAction = string;

/**
 * All available workspace actions
 */
export const WORKSPACE_ACTIONS = {
  // Business actions
  CREATE_OFFER: "Create Offer" as WorkspaceAction,
  LIST_OFFER: "List Offer" as WorkspaceAction,
  REQUEST_ACKNOWLEDGEMENT: "Request Acknowledgement" as WorkspaceAction,
  CANCEL_OFFER: "Cancel Offer" as WorkspaceAction,
  
  // Debtor actions
  ACKNOWLEDGE: "Acknowledge" as WorkspaceAction,
  REPAY: "Repay" as WorkspaceAction,
  REPAY_FULL: "Repay Full" as WorkspaceAction,
  OPEN_DISPUTE: "Open Dispute" as WorkspaceAction,
  
  // Investor actions
  FUND_OFFER: "Fund Offer" as WorkspaceAction,
  
  // Admin actions
  FREEZE_OFFER: "Freeze Offer" as WorkspaceAction,
  VERIFY_BUSINESS: "Verify Business" as WorkspaceAction,
  VERIFY_DEBTOR: "Verify Debtor" as WorkspaceAction,
  VERIFY_INVESTOR: "Verify Investor" as WorkspaceAction,
  ENABLE_ASSET: "Enable Asset" as WorkspaceAction,
  APPROVE_KYB: "Approve KYB" as WorkspaceAction,
} as const;

/**
 * Human-readable labels for actions
 */
export const ACTION_LABELS: Record<WorkspaceAction, string> = {
  "Create Offer": "Create New Offer",
  "List Offer": "List Selected Offer",
  "Request Acknowledgement": "Request ACK",
  "Acknowledge": "Acknowledge Offer",
  "Fund Offer": "Request Allocation",
  "Repay": "Make Partial Repayment",
  "Repay Full": "Repay in Full",
  "Open Dispute": "Open Dispute",
  "Cancel Offer": "Cancel Offer",
  "Freeze Offer": "Freeze Selected Offer",
  "Verify Business": "Verify Business",
  "Verify Debtor": "Verify Debtor",
  "Verify Investor": "Verify Investor",
  "Enable Asset": "Enable Asset",
  "Approve KYB": "Approve KYB",
} as const;

/**
 * Icons for actions (emoji for now, can be replaced with SVG later)
 */
export const ACTION_ICONS: Record<WorkspaceAction, string> = {
  "Create Offer": "+",
  "List Offer": "📋",
  "Request Acknowledgement": "📄",
  "Acknowledge": "✓",
  "Fund Offer": "💰",
  "Repay": "💳",
  "Repay Full": "💵",
  "Open Dispute": "⚠️",
  "Cancel Offer": "✕",
  "Freeze Offer": "❄️",
  "Verify Business": "🏢",
  "Verify Debtor": "👤",
  "Verify Investor": "📈",
  "Enable Asset": "🪙",
  "Approve KYB": "📋",
} as const;

/**
 * Primary actions for each role
 */
export const ROLE_PRIMARY_ACTIONS: Record<string, WorkspaceAction[]> = {
  business: ["Create Offer", "List Offer"],
  debtor: ["Acknowledge", "Repay Full", "Open Dispute"],
  investor: ["Fund Offer"],
  admin: ["Verify Business", "Verify Debtor", "Verify Investor", "Freeze Offer"],
} as const;

/**
 * All actions that require a wallet connection
 */
export const WALLET_REQUIRED_ACTIONS: WorkspaceAction[] = [
  "Create Offer",
  "List Offer",
  "Request Acknowledgement",
  "Acknowledge",
  "Fund Offer",
  "Repay",
  "Repay Full",
  "Open Dispute",
  "Cancel Offer",
  "Freeze Offer",
  "Verify Business",
  "Verify Debtor",
  "Verify Investor",
  "Enable Asset",
  "Approve KYB",
] as const;

/**
 * Actions that require an offer selection
 */
export const OFFER_REQUIRED_ACTIONS: WorkspaceAction[] = [
  "List Offer",
  "Request Acknowledgement",
  "Acknowledge",
  "Fund Offer",
  "Repay",
  "Repay Full",
  "Open Dispute",
  "Cancel Offer",
  "Freeze Offer",
] as const;

/**
 * Actions that require the offer to have an onchainOfferId
 */
export const ONCHAIN_REQUIRED_ACTIONS: WorkspaceAction[] = [
  "List Offer",
  "Fund Offer",
  "Repay",
  "Repay Full",
  "Freeze Offer",
] as const;

/**
 * Get label for an action
 */
export function getActionLabel(action: WorkspaceAction): string {
  return ACTION_LABELS[action] || action;
}

/**
 * Get icon for an action
 */
export function getActionIcon(action: WorkspaceAction): string {
  return ACTION_ICONS[action] || "";
}

/**
 * Check if action requires wallet
 */
export function requiresWallet(action: WorkspaceAction): boolean {
  return WALLET_REQUIRED_ACTIONS.includes(action);
}

/**
 * Check if action requires offer selection
 */
export function requiresOfferSelection(action: WorkspaceAction): boolean {
  return OFFER_REQUIRED_ACTIONS.includes(action);
}

/**
 * Check if action requires onchain offer ID
 */
export function requiresOnchainOfferId(action: WorkspaceAction): boolean {
  return ONCHAIN_REQUIRED_ACTIONS.includes(action);
}

/**
 * Get disabled reason for an action
 */
export function getActionDisabledReason(
  action: WorkspaceAction,
  options: {
    hasWallet?: boolean;
    hasSelection?: boolean;
    hasOnchainId?: boolean;
  } = {}
): string {
  const { hasWallet = true, hasSelection = true, hasOnchainId = true } = options;

  if (!hasWallet && requiresWallet(action)) {
    return "Connect a wallet first";
  }

  if (!hasSelection && requiresOfferSelection(action)) {
    return "Select an offer first";
  }

  if (!hasOnchainId && requiresOnchainOfferId(action)) {
    return "Offer must be submitted to blockchain first";
  }

  return "";
}

/**
 * Get primary actions for a role
 */
export function getPrimaryActionsForRole(role: string): WorkspaceAction[] {
  return ROLE_PRIMARY_ACTIONS[role] || [];
}
