import { getHorizonPayContracts } from "@/lib/contracts/horizonpay-contracts";
import { getContractReadiness } from "@/lib/contracts/contract-readiness";
import {
  buildSorobanTransaction,
  getDefaultRepaymentAssetContractId,
  submitSorobanTransaction,
} from "@/lib/contracts/soroban-operations";
import { getPrismaClient } from "@/lib/db/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type { SorobanArg } from "@/lib/contracts/soroban-operations";
import { fallbackWorkspaceData } from "./fallback-workspace";
import type {
  ContractOperationView,
  PrepareOperationInput,
  RoleWorkspace,
  WorkspaceData,
  WorkspaceOperationStatus,
} from "./workspace-types";
import {
  formatCents,
  titleCase,
  centsFromDollarInput,
  timestampFromDateInput,
  formatShortDate,
} from "@/lib/utils";

type DbOffer = Awaited<ReturnType<typeof queryWorkspaceFromDatabase>>["offers"][number];
type DbOperation = Awaited<ReturnType<typeof queryWorkspaceFromDatabase>>["operations"][number];

type OperationDefinition = {
  contractId: string;
  method: string;
  args: Record<string, unknown>;
  sorobanArgs: SorobanArg[];
};

function displayOfferStatus(status: string) {
  if (status === "REPAID") return "Settled";
  return titleCase(status);
}

function onchainOfferIdFrom(offer?: Pick<DbOffer, "onchainOfferId" | "publicId"> | null, fallback?: string) {
  if (offer?.onchainOfferId) return offer.onchainOfferId;
  const candidate = offer?.publicId ?? fallback ?? "0";
  const numeric = candidate.replace(/\D/g, "");
  return numeric || "0";
}

function requireStringArg(args: Record<string, unknown>, key: string) {
  const value = args[key];
  if (typeof value !== "string" || value.includes("_required") || value === "0") {
    throw new Error(`${key} is required before this Soroban transaction can be built.`);
  }
  return value;
}

function requireInputField(fields: Record<string, string>, key: string, label: string) {
  const value = fields[key]?.trim();
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

function requirePositiveCents(value: bigint, label: string) {
  if (value <= BigInt(0)) throw new Error(`${label} must be greater than zero.`);
}

function validatePrepareInput(input: PrepareOperationInput) {
  const fields = input.fields ?? {};
  const action = input.action;

  if (
    [
      "Create Offer",
      "List Offer",
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
    ].includes(action) &&
    !input.walletAddress
  ) {
    throw new Error("A connected signing wallet is required.");
  }

  if (action === "Create Offer") {
    requireInputField(fields, "debtorWallet", "Debtor wallet");
    requireInputField(fields, "repaymentAsset", "Asset contract");
    requireInputField(fields, "metadataHash", "Metadata hash");
    requirePositiveCents(centsFromDollarInput(fields.principalAmount), "Principal amount");
    requirePositiveCents(centsFromDollarInput(fields.fundingPrice), "Funding price");
  }

  if (
    ["List Offer", "Acknowledge", "Fund Offer", "Repay", "Repay Full", "Open Dispute", "Cancel Offer", "Freeze Offer"].includes(
      action,
    ) &&
    !input.offerId
  ) {
    throw new Error("Select an Offer before preparing this operation.");
  }

  if (["Verify Business", "Verify Debtor", "Verify Investor"].includes(action)) {
    requireInputField(fields, "targetWallet", "Target wallet");
  }

  if (action === "Enable Asset") {
    requireInputField(fields, "assetContract", "Asset contract");
  }

  if (action === "Repay") {
    requirePositiveCents(centsFromDollarInput(fields.repaymentAmount), "Repayment amount");
  }
}

async function assertOperationReadiness(operation: DbOperation, sourceWallet: string) {
  const args = operation.args as Record<string, unknown>;

  if (operation.method === "create_offer" || operation.method === "list_offer") {
    const asset =
      typeof args.repayment_asset === "string"
        ? args.repayment_asset
        : getDefaultRepaymentAssetContractId();
    const readiness = await getContractReadiness({
      walletAddress: sourceWallet,
      repaymentAsset: asset,
    });

    if (readiness.suspended === true) throw new Error("Wallet is suspended on-chain.");
    if (readiness.businessVerified === false) {
      throw new Error("Business wallet must be verified on-chain before creating Offers.");
    }
    if (operation.method === "create_offer" && readiness.supportedAsset === false) {
      throw new Error("Repayment asset must be enabled in protocol config before creating Offers.");
    }
  }

  if (operation.method === "fund_offer") {
    const readiness = await getContractReadiness({ walletAddress: sourceWallet });
    if (readiness.suspended === true) throw new Error("Wallet is suspended on-chain.");
    if (readiness.investorVerified === false) {
      throw new Error("Investor wallet must be verified on-chain before funding Offers.");
    }
  }

  if (operation.method === "acknowledge_offer" || operation.method === "repay_full" || operation.method === "repay_offer") {
    const readiness = await getContractReadiness({ walletAddress: sourceWallet });
    if (readiness.suspended === true) throw new Error("Wallet is suspended on-chain.");
    if (readiness.debtorVerified === false) {
      throw new Error("Debtor wallet must be verified on-chain before this operation.");
    }
  }
}

function sorobanArgsFromSavedOperation(operation: Pick<DbOperation, "method" | "args">): SorobanArg[] {
  const args = operation.args as Record<string, unknown>;

  if (operation.method === "create_offer") {
    return [
      { type: "address", value: requireStringArg(args, "business") },
      { type: "address", value: requireStringArg(args, "debtor") },
      { type: "i128", value: requireStringArg(args, "principal_amount") },
      { type: "i128", value: requireStringArg(args, "funding_price") },
      { type: "address", value: requireStringArg(args, "repayment_asset") },
      { type: "u64", value: requireStringArg(args, "due_timestamp") },
      { type: "bytes", value: requireStringArg(args, "metadata_hash") },
    ];
  }

  if (operation.method === "acknowledge_offer" || operation.method === "list_offer") {
    return [{ type: "u64", value: requireStringArg(args, "offer_id") }];
  }

  if (operation.method === "fund_offer") {
    return [
      { type: "u64", value: requireStringArg(args, "offer_id") },
      { type: "address", value: requireStringArg(args, "investor") },
    ];
  }

  if (operation.method === "repay_full") {
    return [
      { type: "u64", value: requireStringArg(args, "offer_id") },
      { type: "address", value: requireStringArg(args, "payer") },
    ];
  }

  if (operation.method === "repay_offer") {
    return [
      { type: "u64", value: requireStringArg(args, "offer_id") },
      { type: "address", value: requireStringArg(args, "payer") },
      { type: "i128", value: requireStringArg(args, "amount") },
    ];
  }

  if (operation.method === "freeze_offer") {
    return [
      { type: "address", value: requireStringArg(args, "caller") },
      { type: "u64", value: requireStringArg(args, "offer_id") },
    ];
  }

  if (operation.method === "set_business_verified") {
    return [
      { type: "address", value: requireStringArg(args, "caller") },
      { type: "address", value: requireStringArg(args, "business") },
      { type: "bool", value: args.verified === true },
    ];
  }

  if (operation.method === "set_debtor_verified") {
    return [
      { type: "address", value: requireStringArg(args, "caller") },
      { type: "address", value: requireStringArg(args, "debtor") },
      { type: "bool", value: args.verified === true },
    ];
  }

  if (operation.method === "set_investor_verified") {
    return [
      { type: "address", value: requireStringArg(args, "caller") },
      { type: "address", value: requireStringArg(args, "investor") },
      { type: "bool", value: args.verified === true },
    ];
  }

  if (operation.method === "set_supported_asset") {
    return [
      { type: "address", value: requireStringArg(args, "asset") },
      { type: "bool", value: args.supported === true },
    ];
  }

  throw new Error(`Unsupported Soroban method ${operation.method}.`);
}

function mapStatus(status: string): WorkspaceOperationStatus {
  if (status === "PENDING_SIGNATURE") return "Pending signature";
  return titleCase(status) as WorkspaceOperationStatus;
}

function toOfferRow(offer: DbOffer) {
  return {
    id: offer.publicId,
    title: offer.business.name,
    counterparty: offer.debtor.name,
    category: offer.category,
    amount: formatCents(offer.principalAmountCents),
    fundingPrice: formatCents(offer.fundingPriceCents),
    due: formatShortDate(offer.dueDate),
    status: displayOfferStatus(offer.status),
    risk: titleCase(offer.risk),
    metadataHash: offer.metadataHash,
    onchainOfferId: offer.onchainOfferId ?? undefined,
  };
}

function toOperationView(operation: DbOperation): ContractOperationView {
  return {
    id: operation.id,
    operation: operation.operation,
    contractId: operation.contractId,
    method: operation.method,
    args: operation.args as Record<string, unknown>,
    status: mapStatus(operation.status),
    walletAddress: operation.walletAddress ?? undefined,
    txHash: operation.txHash ?? undefined,
    errorMessage: operation.errorMessage ?? undefined,
  };
}

async function queryWorkspaceFromDatabase() {
  const prisma = getPrismaClient();

  const [offers, operations, reviews, investors] = await Promise.all([
    prisma.offer.findMany({
      orderBy: [{ dueDate: "asc" }],
      include: {
        business: true,
        debtor: true,
        fundingPositions: true,
        repayments: true,
      },
    }),
    prisma.contractOperation.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 20,
    }),
    prisma.adminReview.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 10,
      include: { offer: true },
    }),
    prisma.investorProfile.findMany({
      include: { positions: true },
    }),
  ]);

  return { offers, operations, reviews, investors };
}

function buildRoleWorkspaces(
  offers: DbOffer[],
  operations: DbOperation[],
  investorCount: number,
): RoleWorkspace[] {
  const totalPrincipal = offers.reduce(
    (total, offer) => total + offer.principalAmountCents,
    BigInt(0),
  );
  const totalFunding = offers.reduce(
    (total, offer) => total + offer.fundingPriceCents,
    BigInt(0),
  );
  const listed = offers.filter((offer) => offer.status === "LISTED");
  const funded = offers.filter((offer) => offer.status === "FUNDED");
  const pending = offers.filter((offer) =>
    ["DRAFT", "PENDING_DEBTOR_ACKNOWLEDGEMENT"].includes(offer.status),
  );
  const acknowledged = offers.filter((offer) =>
    ["ACKNOWLEDGED", "ACTIVE", "LISTED", "FUNDED", "PARTIALLY_REPAID", "SETTLED", "REPAID"].includes(offer.status),
  );
  const rows = offers.map(toOfferRow);

  const operationsByName = (names: string[]) =>
    operations
      .filter((operation) => names.includes(operation.operation))
      .map(toOperationView);

  return [
    {
      role: "business",
      title: "Business workspace",
      summary: "Create backed Offers, request debtor acknowledgement, list receivables, and track funding.",
      verification: "KYB workflow connected",
      metrics: [
        { label: "Receivables", value: formatCents(totalPrincipal), detail: `${offers.length} Offers in workspace` },
        { label: "Liquidity unlocked", value: formatCents(totalFunding), detail: `${listed.length + funded.length} fundable Offers` },
        { label: "Pending ACK", value: pending.length.toString(), detail: "Need debtor review before listing" },
      ],
      offers: rows,
      operations: operationsByName(["Create Offer", "Request Acknowledgement", "List Offer", "Cancel Offer"]),
      primaryActions: ["Create Offer", "List Offer", "Cancel Offer"],
    },
    {
      role: "debtor",
      title: "Debtor obligations",
      summary: "Review assigned Offers, acknowledge or dispute terms, and repay active receivables.",
      verification: "Debtor verification tracked",
      metrics: [
        { label: "Assigned Offers", value: offers.length.toString(), detail: "Visible to assigned debtors" },
        { label: "Acknowledged", value: acknowledged.length.toString(), detail: "Can be listed or funded" },
        { label: "Remaining", value: formatCents(totalPrincipal), detail: "Before repayment records" },
      ],
      offers: rows,
      operations: operationsByName(["Acknowledge", "Open Dispute", "Repay", "Repay Full"]),
      primaryActions: ["Acknowledge", "Open Dispute", "Repay", "Repay Full"],
    },
    {
      role: "investor",
      title: "Investor portfolio",
      summary: "Accept disclosures, fund listed Offers, and track repayment performance.",
      verification: investorCount > 0 ? "Investor approved" : "Investor checks pending",
      metrics: [
        { label: "Listed Offers", value: listed.length.toString(), detail: "Available after acknowledgement" },
        { label: "Expected repayment", value: formatCents(totalPrincipal), detail: "Across listed positions" },
        { label: "Funded", value: funded.length.toString(), detail: "Claim owner transitions tracked" },
      ],
      offers: rows.filter((offer) => ["Listed", "Funded", "Partially Repaid"].includes(offer.status)),
      operations: operationsByName(["Fund Offer"]),
      primaryActions: ["Fund Offer"],
    },
    {
      role: "admin",
      title: "Compliance console",
      summary: "Review verification, disputes, suspicious Offers, freezes, and audit events.",
      verification: "Operator controls",
      metrics: [
        { label: "Open Offers", value: offers.length.toString(), detail: "Across all lifecycle states" },
        { label: "Listed", value: listed.length.toString(), detail: "Marketplace visibility" },
        { label: "Operations", value: operations.length.toString(), detail: "Prepared contract actions" },
      ],
      offers: rows,
      operations: operationsByName(["Freeze Offer", "Approve KYB", "Verify Business", "Verify Debtor", "Verify Investor", "Enable Asset", "Open Dispute"]),
      primaryActions: ["Verify Business", "Verify Debtor", "Verify Investor", "Enable Asset", "Freeze Offer"],
    },
  ];
}

export async function getWorkspaceData(): Promise<WorkspaceData> {
  const contracts = getHorizonPayContracts();

  if (!process.env.DATABASE_URL) {
    return {
      ...fallbackWorkspaceData,
      contracts,
    };
  }

  try {
    const { offers, operations, reviews, investors } =
      await queryWorkspaceFromDatabase();

    return {
      contracts,
      source: "database",
      roles: buildRoleWorkspaces(offers, operations, investors.length),
      adminReviews: reviews.map((review) => ({
        id: review.id,
        subject: review.subject,
        reason: review.reason,
        status: titleCase(review.status),
        severity: review.severity,
        offerId: review.offer?.publicId,
      })),
    };
  } catch (error) {
    console.error("Failed to read workspace data from Prisma", error);
    return {
      ...fallbackWorkspaceData,
      contracts,
    };
  }
}

function operationFor(
  input: PrepareOperationInput,
  offer?: Pick<DbOffer, "onchainOfferId" | "publicId"> | null,
): OperationDefinition {
  const contracts = getHorizonPayContracts();
  const fields = input.fields ?? {};
  const offerId = onchainOfferIdFrom(offer, input.offerId);
  const wallet = input.walletAddress ?? "wallet_required";
  const debtor = fields.debtorWallet || "debtor_wallet_required";
  const principalAmount = centsFromDollarInput(fields.principalAmount || fields.repaymentAmount, "0").toString();
  const fundingPrice = centsFromDollarInput(fields.fundingPrice || fields.principalAmount, "0").toString();
  const repaymentAmount = centsFromDollarInput(fields.repaymentAmount, "0").toString();
  const repaymentAsset = fields.repaymentAsset || getDefaultRepaymentAssetContractId();
  const metadataHash = fields.metadataHash || `hp_meta_${Date.now()}`;
  const dueTimestamp = timestampFromDateInput(fields.dueDate);

  const operationMap: Record<string, OperationDefinition> = {
    "Create Offer": {
      contractId: contracts.offerRegistry,
      method: "create_offer",
      args: {
        business: wallet,
        debtor,
        principal_amount: principalAmount,
        funding_price: fundingPrice,
        repayment_asset: repaymentAsset,
        due_timestamp: dueTimestamp,
        metadata_hash: metadataHash,
      },
      sorobanArgs: [
        { type: "address", value: wallet },
        { type: "address", value: debtor },
        { type: "i128", value: principalAmount },
        { type: "i128", value: fundingPrice },
        { type: "address", value: repaymentAsset },
        { type: "u64", value: dueTimestamp },
        { type: "bytes", value: metadataHash },
      ],
    },
    "Request Acknowledgement": {
      contractId: contracts.offerRegistry,
      method: "acknowledge_offer",
      args: { offer_id: offerId },
      sorobanArgs: [{ type: "u64", value: offerId }],
    },
    Acknowledge: {
      contractId: contracts.offerRegistry,
      method: "acknowledge_offer",
      args: { offer_id: offerId },
      sorobanArgs: [{ type: "u64", value: offerId }],
    },
    "List Offer": {
      contractId: contracts.marketplace,
      method: "list_offer",
      args: { offer_id: offerId },
      sorobanArgs: [{ type: "u64", value: offerId }],
    },
    "Fund Offer": {
      contractId: contracts.marketplace,
      method: "fund_offer",
      args: { offer_id: offerId, investor: wallet },
      sorobanArgs: [
        { type: "u64", value: offerId },
        { type: "address", value: wallet },
      ],
    },
    "Repay Full": {
      contractId: contracts.settlement,
      method: "repay_full",
      args: { offer_id: offerId, payer: wallet },
      sorobanArgs: [
        { type: "u64", value: offerId },
        { type: "address", value: wallet },
      ],
    },
    Repay: {
      contractId: contracts.settlement,
      method: "repay_offer",
      args: { offer_id: offerId, payer: wallet, amount: repaymentAmount },
      sorobanArgs: [
        { type: "u64", value: offerId },
        { type: "address", value: wallet },
        { type: "i128", value: repaymentAmount },
      ],
    },
    "Open Dispute": {
      contractId: "offchain-review",
      method: "open_dispute",
      args: { offer_id: offerId, reporter: wallet, reason: fields.disputeReason || "terms_review" },
      sorobanArgs: [],
    },
    "Cancel Offer": {
      contractId: "offchain-review",
      method: "cancel_offer_review",
      args: { offer_id: offerId, requester: wallet, reason: fields.cancelReason || "business_cancelled" },
      sorobanArgs: [],
    },
    "Freeze Offer": {
      contractId: contracts.offerRegistry,
      method: "freeze_offer",
      args: { caller: wallet, offer_id: offerId },
      sorobanArgs: [
        { type: "address", value: wallet },
        { type: "u64", value: offerId },
      ],
    },
    "Approve KYB": {
      contractId: contracts.verificationRegistry,
      method: "set_business_verified",
      args: { caller: wallet, business: fields.targetWallet || fields.businessWallet || wallet, verified: true },
      sorobanArgs: [
        { type: "address", value: wallet },
        { type: "address", value: fields.targetWallet || fields.businessWallet || wallet },
        { type: "bool", value: true },
      ],
    },
    "Verify Business": {
      contractId: contracts.verificationRegistry,
      method: "set_business_verified",
      args: { caller: wallet, business: fields.targetWallet || wallet, verified: true },
      sorobanArgs: [
        { type: "address", value: wallet },
        { type: "address", value: fields.targetWallet || wallet },
        { type: "bool", value: true },
      ],
    },
    "Verify Debtor": {
      contractId: contracts.verificationRegistry,
      method: "set_debtor_verified",
      args: { caller: wallet, debtor: fields.targetWallet || wallet, verified: true },
      sorobanArgs: [
        { type: "address", value: wallet },
        { type: "address", value: fields.targetWallet || wallet },
        { type: "bool", value: true },
      ],
    },
    "Verify Investor": {
      contractId: contracts.verificationRegistry,
      method: "set_investor_verified",
      args: { caller: wallet, investor: fields.targetWallet || wallet, verified: true },
      sorobanArgs: [
        { type: "address", value: wallet },
        { type: "address", value: fields.targetWallet || wallet },
        { type: "bool", value: true },
      ],
    },
    "Enable Asset": {
      contractId: contracts.config,
      method: "set_supported_asset",
      args: { asset: fields.assetContract || repaymentAsset, supported: true },
      sorobanArgs: [
        { type: "address", value: fields.assetContract || repaymentAsset },
        { type: "bool", value: true },
      ],
    },
  };

  return operationMap[input.action] ?? operationMap["Create Offer"];
}

export async function prepareContractOperation(input: PrepareOperationInput) {
  const contracts = getHorizonPayContracts();
  validatePrepareInput(input);

  if (!process.env.DATABASE_URL) {
    const operation = operationFor(input);
    const isOffchainReview = operation.contractId === "offchain-review";
    return {
      id: `local-${Date.now()}`,
      operation: input.action,
      contractId: operation.contractId,
      method: operation.method,
      args: operation.args as Prisma.InputJsonValue,
      status: (isOffchainReview ? "Confirmed" : "Ready") as WorkspaceOperationStatus,
      walletAddress: input.walletAddress,
    };
  }

  const prisma = getPrismaClient();
  let offer = input.offerId
    ? await prisma.offer.findUnique({ where: { publicId: input.offerId } })
    : null;
  const fields = input.fields ?? {};

  if (input.action === "Create Offer") {
    const publicId = `HP-${Date.now().toString().slice(-6)}`;
    const principalAmountCents = centsFromDollarInput(fields.principalAmount, "0");
    const fundingPriceCents = centsFromDollarInput(fields.fundingPrice || fields.principalAmount, "0");
    const businessWallet = input.walletAddress || `business-${publicId}`;
    const debtorWallet = fields.debtorWallet || `debtor-${publicId}`;

    offer = await prisma.offer.create({
      data: {
        publicId,
        category: fields.category || "Receivable Offer",
        summary: fields.summary || "Product or service receivable awaiting debtor acknowledgement.",
        principalAmountCents,
        fundingPriceCents,
        expectedRepaymentCents: principalAmountCents,
        repaymentAsset: fields.repaymentAsset || getDefaultRepaymentAssetContractId(),
        dueDate: fields.dueDate ? new Date(`${fields.dueDate}T00:00:00.000Z`) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "DRAFT",
        risk: "MODERATE",
        metadataHash: fields.metadataHash || `hp_meta_${publicId.toLowerCase()}`,
        offerRegistryContract: contracts.offerRegistry,
        marketplaceContract: contracts.marketplace,
        settlementContract: contracts.settlement,
        business: {
          connectOrCreate: {
            where: { walletAddress: businessWallet },
            create: {
              name: fields.businessName || "Verified business",
              industry: fields.category || "Receivables",
              walletAddress: businessWallet,
              verificationStatus: "KYB_VERIFIED",
              metadataHash: fields.metadataHash || `hp_business_${publicId.toLowerCase()}`,
            },
          },
        },
        debtor: {
          connectOrCreate: {
            where: { walletAddress: debtorWallet },
            create: {
              name: fields.debtorName || "Assigned debtor",
              walletAddress: debtorWallet,
              metadataHash: `hp_debtor_${publicId.toLowerCase()}`,
            },
          },
        },
        notes: {
          create: [{ body: "Offer draft created from workspace flow.", sortOrder: 0 }],
        },
        proofItems: {
          create: [{ label: fields.proofLabel || "Off-chain metadata hash recorded", sortOrder: 0 }],
        },
        timeline: {
          create: [{ label: "Created", value: new Date().toLocaleDateString("en-US"), sortOrder: 0 }],
        },
      },
    });
  }

  const operation = operationFor(input, offer);

  if (operation.method === "open_dispute" || operation.method === "cancel_offer_review") {
    if (!offer) throw new Error("Select an Offer before preparing this review action.");
    const isDispute = operation.method === "open_dispute";
    const reason = isDispute
      ? fields.disputeReason || "Offer terms were disputed by the debtor."
      : fields.cancelReason || "Offer was cancelled before funding.";

    const saved = await prisma.$transaction(async (tx) => {
      await tx.offer.update({
        where: { id: offer.id },
        data: { status: isDispute ? "DISPUTED" : "CANCELLED" },
      });

      await tx.adminReview.create({
        data: {
          offerId: offer.id,
          subject: isDispute ? "Offer dispute opened" : "Offer cancellation recorded",
          reason,
          status: isDispute ? "OPEN" : "RESOLVED",
          severity: isDispute ? "High" : "Medium",
        },
      });

      return tx.contractOperation.create({
        data: {
          offerId: offer.id,
          operation: input.action,
          contractId: operation.contractId,
          method: operation.method,
          args: operation.args as Prisma.InputJsonValue,
          status: "CONFIRMED",
          walletAddress: input.walletAddress,
        },
      });
    });

    return toOperationView(saved);
  }

  const saved = await prisma.contractOperation.create({
    data: {
      offerId: offer?.id,
      operation: input.action,
      contractId: operation.contractId,
      method: operation.method,
      args: operation.args as Prisma.InputJsonValue,
      status: input.walletAddress ? "READY" : "DRAFT",
      walletAddress: input.walletAddress,
    },
  });

  return toOperationView(saved);
}

export async function buildPreparedContractTransaction(params: {
  operationId: string;
  walletAddress: string;
}) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to build a persisted Soroban transaction.");
  }

  const prisma = getPrismaClient();
  const operation = await prisma.contractOperation.findUnique({
    where: { id: params.operationId },
  });

  if (!operation) throw new Error("Operation was not found.");
  if (!params.walletAddress) throw new Error("A signing wallet address is required.");
  if (operation.contractId === "offchain-review") {
    throw new Error("This review action is already completed off-chain and does not require a wallet signature.");
  }
  await assertOperationReadiness(operation, params.walletAddress);

  const prepared = await buildSorobanTransaction({
    sourceAddress: params.walletAddress,
    contractId: operation.contractId,
    method: operation.method,
    args: sorobanArgsFromSavedOperation(operation),
  });

  const saved = await prisma.contractOperation.update({
    where: { id: operation.id },
    data: {
      status: "PENDING_SIGNATURE",
      walletAddress: params.walletAddress,
      errorMessage: null,
    },
  });

  return {
    ...toOperationView(saved),
    unsignedXdr: prepared.unsignedXdr,
    networkPassphrase: prepared.networkPassphrase,
  };
}

async function applyConfirmedOperation(
  operation: DbOperation,
  txHash: string,
  returnValue?: unknown,
) {
  const prisma = getPrismaClient();
  const args = operation.args as Record<string, unknown>;

  if (operation.method === "set_business_verified") {
    const walletAddress = typeof args.business === "string" ? args.business : operation.walletAddress;
    if (walletAddress) {
      await prisma.businessProfile.upsert({
        where: { walletAddress },
        update: { verificationStatus: "KYB_VERIFIED" },
        create: {
          name: "Verified business",
          industry: "Receivables",
          walletAddress,
          verificationStatus: "KYB_VERIFIED",
          metadataHash: `hp_business_${txHash}`,
        },
      });
    }
  }

  if (operation.method === "set_debtor_verified") {
    const walletAddress = typeof args.debtor === "string" ? args.debtor : operation.walletAddress;
    if (walletAddress) {
      await prisma.debtorProfile.upsert({
        where: { walletAddress },
        update: {},
        create: {
          name: "Verified debtor",
          walletAddress,
          metadataHash: `hp_debtor_${txHash}`,
        },
      });
    }
  }

  if (operation.method === "set_investor_verified") {
    const walletAddress = typeof args.investor === "string" ? args.investor : operation.walletAddress;
    if (walletAddress) {
      await prisma.investorProfile.upsert({
        where: { walletAddress },
        update: { verificationStatus: "KYB_VERIFIED" },
        create: {
          name: "Verified investor",
          walletAddress,
          verificationStatus: "KYB_VERIFIED",
          metadataHash: `hp_investor_${txHash}`,
        },
      });
    }
  }

  if (!operation.offerId) return;

  if (operation.method === "create_offer") {
    const onchainOfferId =
      typeof returnValue === "bigint"
        ? returnValue.toString()
        : typeof returnValue === "number" || typeof returnValue === "string"
          ? returnValue.toString()
          : undefined;

    if (onchainOfferId) {
      await prisma.offer.update({
        where: { id: operation.offerId },
        data: { onchainOfferId },
      });
    }
  }

  if (operation.method === "acknowledge_offer") {
    await prisma.offer.update({
      where: { id: operation.offerId },
      data: { status: "ACKNOWLEDGED" },
    });
  }

  if (operation.method === "list_offer") {
    await prisma.offer.update({
      where: { id: operation.offerId },
      data: { status: "LISTED" },
    });
  }

  if (operation.method === "fund_offer") {
    const offer = await prisma.offer.findUnique({ where: { id: operation.offerId } });
    if (!offer) return;

    const investor = await prisma.investorProfile.upsert({
      where: { walletAddress: operation.walletAddress ?? `investor-${txHash}` },
      update: { verificationStatus: "KYB_VERIFIED" },
      create: {
        name: "Workspace investor",
        walletAddress: operation.walletAddress ?? `investor-${txHash}`,
        verificationStatus: "KYB_VERIFIED",
        metadataHash: `hp_investor_${txHash}`,
      },
    });

    await prisma.$transaction([
      prisma.offer.update({
        where: { id: operation.offerId },
        data: { status: "FUNDED", fundedBasisPoints: 10000 },
      }),
      prisma.fundingPosition.create({
        data: {
          offerId: operation.offerId,
          investorId: investor.id,
          amountFundedCents: offer.fundingPriceCents,
          expectedReturnCents: offer.expectedRepaymentCents,
          status: "CONFIRMED",
          txHash,
        },
      }),
    ]);
  }

  if (operation.method === "repay_full") {
    const offer = await prisma.offer.findUnique({ where: { id: operation.offerId } });
    if (!offer) return;

    await prisma.$transaction([
      prisma.offer.update({
        where: { id: operation.offerId },
        data: { status: "SETTLED" },
      }),
      prisma.repayment.create({
        data: {
          offerId: operation.offerId,
          debtorId: offer.debtorId,
          amountCents: offer.expectedRepaymentCents,
          remainingCents: BigInt(0),
          status: "CONFIRMED",
          txHash,
        },
      }),
    ]);
  }

  if (operation.method === "repay_offer") {
    const offer = await prisma.offer.findUnique({
      where: { id: operation.offerId },
      include: { repayments: true },
    });
    if (!offer) return;

    const amount =
      typeof args.amount === "string"
        ? BigInt(args.amount)
        : typeof args.amount === "number"
          ? BigInt(args.amount)
          : BigInt(0);
    const previouslyRepaid = offer.repayments.reduce(
      (total, repayment) => total + repayment.amountCents,
      BigInt(0),
    );
    const remaining = offer.expectedRepaymentCents - previouslyRepaid - amount;
    const nextRemaining = remaining > BigInt(0) ? remaining : BigInt(0);

    await prisma.$transaction([
      prisma.offer.update({
        where: { id: operation.offerId },
        data: { status: nextRemaining === BigInt(0) ? "SETTLED" : "PARTIALLY_REPAID" },
      }),
      prisma.repayment.create({
        data: {
          offerId: operation.offerId,
          debtorId: offer.debtorId,
          amountCents: amount,
          remainingCents: nextRemaining,
          status: "CONFIRMED",
          txHash,
        },
      }),
    ]);
  }

  if (operation.method === "freeze_offer") {
    await prisma.offer.update({
      where: { id: operation.offerId },
      data: { status: "FROZEN" },
    });
  }
}

export async function submitSignedContractTransaction(params: {
  operationId: string;
  signedXdr: string;
}) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to submit a persisted Soroban transaction.");
  }

  const prisma = getPrismaClient();
  const operation = await prisma.contractOperation.update({
    where: { id: params.operationId },
    data: { status: "SUBMITTED", errorMessage: null },
  });

  try {
    const submitted = await submitSorobanTransaction({ signedXdr: params.signedXdr });
    const confirmed = submitted.status === "SUCCESS";
    const saved = await prisma.contractOperation.update({
      where: { id: operation.id },
      data: {
        status: confirmed ? "CONFIRMED" : "SUBMITTED",
        txHash: submitted.hash,
      },
    });

    if (confirmed) {
      await applyConfirmedOperation(saved, submitted.hash, submitted.returnValue);
    }

    return toOperationView(saved);
  } catch (error) {
    const saved = await prisma.contractOperation.update({
      where: { id: operation.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Soroban transaction failed.",
      },
    });

    return toOperationView(saved);
  }
}
