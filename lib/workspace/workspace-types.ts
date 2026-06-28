import type { HorizonPayContracts } from "@/lib/contracts/horizonpay-contracts";

export type WorkspaceRole = "business" | "debtor" | "investor" | "admin";
export type WorkspaceOperationStatus =
  | "Draft"
  | "Ready"
  | "Pending signature"
  | "Submitted"
  | "Confirmed"
  | "Failed";

export type WorkspaceMetric = {
  label: string;
  value: string;
  detail: string;
};

export type WorkspaceOfferRow = {
  id: string;
  title: string;
  counterparty: string;
  category: string;
  amount: string;
  fundingPrice: string;
  due: string;
  status: string;
  risk: string;
  metadataHash: string;
  onchainOfferId?: string;
};

export type ContractOperationView = {
  id: string;
  operation: string;
  contractId: string;
  method: string;
  args: Record<string, unknown>;
  status: WorkspaceOperationStatus;
  walletAddress?: string;
  txHash?: string;
  errorMessage?: string;
  unsignedXdr?: string;
  networkPassphrase?: string;
};

export type SetupReadinessView = {
  admin?: ContractReadinessSummary;
  business?: ContractReadinessSummary;
  debtor?: ContractReadinessSummary;
  investor?: ContractReadinessSummary;
};

export type ContractReadinessSummary = {
  walletAddress?: string;
  businessVerified: boolean | null;
  debtorVerified: boolean | null;
  investorVerified: boolean | null;
  suspended: boolean | null;
  supportedAsset: boolean | null;
};

export type RoleWorkspace = {
  role: WorkspaceRole;
  title: string;
  summary: string;
  verification: string;
  metrics: WorkspaceMetric[];
  offers: WorkspaceOfferRow[];
  operations: ContractOperationView[];
  primaryActions: string[];
};

export type AdminReviewView = {
  id: string;
  subject: string;
  reason: string;
  status: string;
  severity: string;
  offerId?: string;
};

export type WorkspaceData = {
  contracts: HorizonPayContracts;
  roles: RoleWorkspace[];
  adminReviews: AdminReviewView[];
  source: "database" | "fallback";
};

export type PrepareOperationInput = {
  role: WorkspaceRole;
  action: string;
  offerId?: string;
  walletAddress?: string;
  fields?: Record<string, string>;
};
