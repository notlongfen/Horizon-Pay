import { getHorizonPayContracts } from "./horizonpay-contracts";
import {
  getDefaultRepaymentAssetContractId,
  readSorobanContract,
} from "./soroban-operations";

export type ContractReadiness = {
  walletAddress?: string;
  repaymentAsset: string;
  businessVerified: boolean | null;
  debtorVerified: boolean | null;
  investorVerified: boolean | null;
  suspended: boolean | null;
  supportedAsset: boolean | null;
  checks: Array<{
    label: string;
    status: "ready" | "blocked" | "unknown";
    detail: string;
  }>;
};

function booleanOrNull(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function statusFrom(value: boolean | null, readyDetail: string, blockedDetail: string) {
  if (value === true) return { status: "ready" as const, detail: readyDetail };
  if (value === false) return { status: "blocked" as const, detail: blockedDetail };
  return { status: "unknown" as const, detail: "RPC check unavailable." };
}

export async function getContractReadiness(params: {
  walletAddress?: string;
  repaymentAsset?: string;
}): Promise<ContractReadiness> {
  const contracts = getHorizonPayContracts();
  const repaymentAsset = params.repaymentAsset || getDefaultRepaymentAssetContractId();
  const wallet = params.walletAddress;

  const [businessVerified, debtorVerified, investorVerified, suspended, supportedAsset] =
    await Promise.all([
      wallet
        ? readSorobanContract({
            contractId: contracts.verificationRegistry,
            method: "is_business_verified",
            args: [{ type: "address", value: wallet }],
          })
            .then(booleanOrNull)
            .catch(() => null)
        : Promise.resolve(null),
      wallet
        ? readSorobanContract({
            contractId: contracts.verificationRegistry,
            method: "is_debtor_verified",
            args: [{ type: "address", value: wallet }],
          })
            .then(booleanOrNull)
            .catch(() => null)
        : Promise.resolve(null),
      wallet
        ? readSorobanContract({
            contractId: contracts.verificationRegistry,
            method: "is_investor_verified",
            args: [{ type: "address", value: wallet }],
          })
            .then(booleanOrNull)
            .catch(() => null)
        : Promise.resolve(null),
      wallet
        ? readSorobanContract({
            contractId: contracts.verificationRegistry,
            method: "is_suspended",
            args: [{ type: "address", value: wallet }],
          })
            .then(booleanOrNull)
            .catch(() => null)
        : Promise.resolve(null),
      readSorobanContract({
        contractId: contracts.config,
        method: "is_supported_asset",
        args: [{ type: "address", value: repaymentAsset }],
      })
        .then(booleanOrNull)
        .catch(() => null),
    ]);

  const business = statusFrom(
    businessVerified,
    "Wallet can create business Offers.",
    "Wallet is not verified as a business on-chain.",
  );
  const debtor = statusFrom(
    debtorVerified,
    "Wallet can acknowledge and repay assigned Offers.",
    "Wallet is not verified as a debtor on-chain.",
  );
  const investor = statusFrom(
    investorVerified,
    "Wallet can fund listed Offers.",
    "Wallet is not verified as an investor on-chain.",
  );
  const asset = statusFrom(
    supportedAsset,
    "Repayment asset is enabled in protocol config.",
    "Repayment asset is not enabled in protocol config.",
  );

  return {
    walletAddress: wallet,
    repaymentAsset,
    businessVerified,
    debtorVerified,
    investorVerified,
    suspended,
    supportedAsset,
    checks: [
      { label: "Business verification", ...business },
      { label: "Debtor verification", ...debtor },
      { label: "Investor verification", ...investor },
      {
        label: "Suspension",
        status: suspended === false ? "ready" : suspended === true ? "blocked" : "unknown",
        detail:
          suspended === false
            ? "Wallet is not suspended."
            : suspended === true
              ? "Wallet is suspended on-chain."
              : "RPC check unavailable.",
      },
      { label: "Repayment asset", ...asset },
    ],
  };
}
