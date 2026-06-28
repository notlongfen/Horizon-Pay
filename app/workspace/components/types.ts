// Workspace component types
// Extends the existing workspace-types.ts with UI-specific types

import type { 
  ContractOperationView, 
  WorkspaceData, 
  WorkspaceRole,
  RoleWorkspace,
} from "@/lib/workspace/workspace-types";

// Offer status types for display
export type OfferDisplayStatus = 
  | "Draft"
  | "Pending Debtor Acknowledgement"
  | "Acknowledged"
  | "Active"
  | "Listed"
  | "Funded"
  | "Partially Repaid"
  | "Settled"
  | "Repaid"
  | "Overdue"
  | "Defaulted"
  | "Disputed"
  | "Frozen"
  | "Cancelled";

// Status badge variants
export type StatusBadgeVariant = 
  | "draft"
  | "pending"
  | "active"
  | "success"
  | "warning"
  | "danger"
  | "frozen"
  | "cancelled";

// Action types
export type WorkspaceAction = 
  | "Create Offer"
  | "List Offer"
  | "Acknowledge"
  | "Fund Offer"
  | "Repay"
  | "Repay Full"
  | "Open Dispute"
  | "Cancel Offer"
  | "Freeze Offer"
  | "Verify Business"
  | "Verify Debtor"
  | "Verify Investor"
  | "Enable Asset";

// Offer row data for table
export interface OfferRow {
  id: string;
  title: string;
  counterparty: string;
  category: string;
  amount: string;
  fundingPrice: string;
  status: OfferDisplayStatus;
  statusVariant: StatusBadgeVariant;
  onchainOfferId: string | undefined;
  dueDate: string;
}

// Operation display data
export interface OperationDisplay {
  id: string;
  operation: string;
  method: string;
  contractId: string;
  status: string;
  walletAddress: string | undefined;
  txHash: string | undefined;
  errorMessage: string | undefined;
  args: Record<string, unknown>;
}

// Workspace UI state
export interface WorkspaceUIState {
  selectedOfferId: string | undefined;
  selectedRole: WorkspaceRole;
  walletAddress: string;
  isWalletConnected: boolean;
  preparedOperation: ContractOperationView | null;
  isSubmitting: boolean;
  error: string | null;
  notice: string | null;
  showAdvanced: boolean;
}

// Props for components
export interface RoleSelectorProps {
  roles: WorkspaceRole[];
  activeRole: WorkspaceRole;
  onRoleChange: (role: WorkspaceRole) => void;
}

export interface WalletConnectProps {
  walletAddress: string;
  isConnected: boolean;
  network: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onAddressChange: (address: string) => void;
}

export interface OfferTableProps {
  offers: OfferRow[];
  selectedOfferId: string | undefined;
  onSelectOffer: (offerId: string) => void;
  onAction: (action: WorkspaceAction, offerId: string) => void;
  activeRole: WorkspaceRole;
  isLoading: boolean;
}

export interface ActionBarProps {
  activeRole: WorkspaceRole;
  selectedOffer: OfferRow | null;
  onAction: (action: WorkspaceAction, offerId?: string) => void;
  isPreparing: boolean;
  walletAddress: string;
  readinessChecks: Array<{ label: string; status: "ready" | "blocked" | "unknown"; detail: string }>;
}

export interface OperationPanelProps {
  operation: ContractOperationView | null;
  onExecute: (operation: ContractOperationView) => void;
  onDismiss: () => void;
  isPending: boolean;
}

export interface OfferDetailsProps {
  offer: OfferRow | null;
  liveState: any | null; // OfferLiveState from parent
  isLoading: boolean;
}

export interface StatusBadgeProps {
  status: OfferDisplayStatus;
  variant?: StatusBadgeVariant;
  className?: string;
}

// Map offer status to badge variant
export function getStatusVariant(status: OfferDisplayStatus): StatusBadgeVariant {
  const variantMap: Record<OfferDisplayStatus, StatusBadgeVariant> = {
    "Draft": "draft",
    "Pending Debtor Acknowledgement": "pending",
    "Acknowledged": "active",
    "Active": "active",
    "Listed": "success",
    "Funded": "success",
    "Partially Repaid": "active",
    "Settled": "success",
    "Repaid": "success",
    "Overdue": "danger",
    "Defaulted": "danger",
    "Disputed": "warning",
    "Frozen": "frozen",
    "Cancelled": "cancelled",
  };
  return variantMap[status] || "draft";
}

// Format offer amount for display
export function formatAmount(cents: bigint | string | number): string {
  if (typeof cents === 'bigint') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(cents) / 100);
  }
  if (typeof cents === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }
  return cents;
}

// Truncate wallet address for display
export function truncateAddress(address: string, length: number = 12): string {
  if (!address || address.length <= length) return address;
  const prefix = address.slice(0, Math.floor(length / 2));
  const suffix = address.slice(-Math.floor(length / 2));
  return `${prefix}...${suffix}`;
}

// Format date for display
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Get action label for role and offer status
export function getActionForRole(role: WorkspaceRole, status: OfferDisplayStatus): WorkspaceAction {
  const actionMap: Record<WorkspaceRole, Record<OfferDisplayStatus, WorkspaceAction>> = {
    business: {
      "Draft": "Create Offer",
      "Pending Debtor Acknowledgement": "Cancel Offer",
      "Acknowledged": "List Offer",
      "Active": "List Offer",
      "Listed": "Create Offer",
      "Funded": "Create Offer",
      "Partially Repaid": "Create Offer",
      "Settled": "Create Offer",
      "Repaid": "Create Offer",
      "Overdue": "Create Offer",
      "Defaulted": "Create Offer",
      "Disputed": "Create Offer",
      "Frozen": "Create Offer",
      "Cancelled": "Create Offer",
    },
    debtor: {
      "Draft": "Acknowledge",
      "Pending Debtor Acknowledgement": "Acknowledge",
      "Acknowledged": "Open Dispute",
      "Active": "Open Dispute",
      "Listed": "Open Dispute",
      "Funded": "Repay",
      "Partially Repaid": "Repay",
      "Settled": "Open Dispute",
      "Repaid": "Open Dispute",
      "Overdue": "Repay",
      "Defaulted": "Open Dispute",
      "Disputed": "Open Dispute",
      "Frozen": "Open Dispute",
      "Cancelled": "Open Dispute",
    },
    investor: {
      "Draft": "Fund Offer",
      "Pending Debtor Acknowledgement": "Fund Offer",
      "Acknowledged": "Fund Offer",
      "Active": "Fund Offer",
      "Listed": "Fund Offer",
      "Funded": "Fund Offer",
      "Partially Repaid": "Fund Offer",
      "Settled": "Fund Offer",
      "Repaid": "Fund Offer",
      "Overdue": "Fund Offer",
      "Defaulted": "Fund Offer",
      "Disputed": "Fund Offer",
      "Frozen": "Fund Offer",
      "Cancelled": "Fund Offer",
    },
    admin: {
      "Draft": "Freeze Offer",
      "Pending Debtor Acknowledgement": "Freeze Offer",
      "Acknowledged": "Freeze Offer",
      "Active": "Freeze Offer",
      "Listed": "Freeze Offer",
      "Funded": "Freeze Offer",
      "Partially Repaid": "Freeze Offer",
      "Settled": "Freeze Offer",
      "Repaid": "Freeze Offer",
      "Overdue": "Freeze Offer",
      "Defaulted": "Freeze Offer",
      "Disputed": "Freeze Offer",
      "Frozen": "Freeze Offer",
      "Cancelled": "Freeze Offer",
    },
  };
  return actionMap[role]?.[status] || "Create Offer";
}
