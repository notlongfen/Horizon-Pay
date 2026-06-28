import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import {
  getHorizonPayContracts,
  horizonPayWasmHashes,
} from "../lib/contracts/horizonpay-contracts";
import { getDefaultRepaymentAssetContractId } from "../lib/contracts/soroban-operations";

const contracts = getHorizonPayContracts();
const repaymentAsset = getDefaultRepaymentAssetContractId();

const seedOffers = [
  {
    publicId: "HP-1048",
    business: "BrightCare Clinic",
    debtor: "Maya Lopez",
    category: "Service receivable",
    summary: "Dental treatment plan acknowledged by the patient.",
    industry: "Clinic services",
    principalAmountCents: BigInt(1_280_000),
    fundingPriceCents: BigInt(1_212_000),
    expectedRepaymentCents: BigInt(1_280_000),
    dueDate: new Date("2026-08-18T00:00:00.000Z"),
    risk: "LOW",
    fundedBasisPoints: 9470,
    metadataHash: "hp_meta_1048_brightcare",
    onchainOfferId: "1048",
    notes: [
      "Treatment plan was accepted before marketplace listing.",
      "Repayment follows the debtor acknowledgment milestone.",
    ],
    proof: [
      "Signed service estimate",
      "KYB record from business onboarding",
      "Debtor acknowledgment timestamp",
    ],
    timeline: [
      { label: "Created", value: "Jun 19, 2026" },
      { label: "Acknowledged", value: "Jun 20, 2026" },
      { label: "Listed", value: "Jun 21, 2026" },
      { label: "Expected repayment", value: "Aug 18, 2026" },
    ],
  },
  {
    publicId: "HP-1052",
    business: "Northline Supply",
    debtor: "Tidepoint Retail",
    category: "Invoice",
    summary: "Wholesale equipment invoice with 45-day repayment terms.",
    industry: "B2B supply",
    principalAmountCents: BigInt(2_400_000),
    fundingPriceCents: BigInt(2_298_000),
    expectedRepaymentCents: BigInt(2_400_000),
    dueDate: new Date("2026-09-02T00:00:00.000Z"),
    risk: "MODERATE",
    fundedBasisPoints: 9580,
    metadataHash: "hp_meta_1052_northline",
    onchainOfferId: "1052",
    notes: [
      "Invoice amount covers a single equipment delivery batch.",
      "Settlement aligns with the buyer's standard net terms.",
    ],
    proof: [
      "Issued invoice",
      "Buyer receipt confirmation",
      "Acknowledgment record",
    ],
    timeline: [
      { label: "Created", value: "Jul 05, 2026" },
      { label: "Acknowledged", value: "Jul 06, 2026" },
      { label: "Listed", value: "Jul 08, 2026" },
      { label: "Expected repayment", value: "Sep 02, 2026" },
    ],
  },
  {
    publicId: "HP-1061",
    business: "Atlas Learning Studio",
    debtor: "Jordan Kim",
    category: "Installment receivable",
    summary: "Course installment receivable acknowledged by the student.",
    industry: "Education",
    principalAmountCents: BigInt(460_000),
    fundingPriceCents: BigInt(439_000),
    expectedRepaymentCents: BigInt(460_000),
    dueDate: new Date("2026-07-29T00:00:00.000Z"),
    risk: "LOW",
    fundedBasisPoints: 9540,
    metadataHash: "hp_meta_1061_atlas",
    onchainOfferId: "1061",
    notes: [
      "Installment plan is linked to the learner enrollment record.",
      "Repayment is expected from the agreed schedule, not open-ended billing.",
    ],
    proof: [
      "Enrollment agreement",
      "Installment schedule",
      "Debtor acknowledgment record",
    ],
    timeline: [
      { label: "Created", value: "Jul 01, 2026" },
      { label: "Acknowledged", value: "Jul 02, 2026" },
      { label: "Listed", value: "Jul 03, 2026" },
      { label: "Expected repayment", value: "Jul 29, 2026" },
    ],
  },
] as const;

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed HorizonPay.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

async function main() {
  const prisma = createPrisma();

  await prisma.contractDeployment.upsert({
    where: {
      network_version: {
        network: contracts.network,
        version: contracts.version,
      },
    },
    update: {
      passphrase: contracts.passphrase,
      deployerPublicKey: contracts.deployerPublicKey,
      factory: contracts.factory,
      config: contracts.config,
      verification: contracts.verificationRegistry,
      offerRegistry: contracts.offerRegistry,
      marketplace: contracts.marketplace,
      settlement: contracts.settlement,
      riskRegistry: contracts.riskRegistry,
      fractionalization: contracts.fractionalization,
      wasmHashes: horizonPayWasmHashes,
    },
    create: {
      network: contracts.network,
      passphrase: contracts.passphrase,
      deployerPublicKey: contracts.deployerPublicKey,
      version: contracts.version,
      factory: contracts.factory,
      config: contracts.config,
      verification: contracts.verificationRegistry,
      offerRegistry: contracts.offerRegistry,
      marketplace: contracts.marketplace,
      settlement: contracts.settlement,
      riskRegistry: contracts.riskRegistry,
      fractionalization: contracts.fractionalization,
      wasmHashes: horizonPayWasmHashes,
    },
  });

  for (const offer of seedOffers) {
    await prisma.offer.deleteMany({
      where: {
        publicId: offer.publicId,
      },
    });

    await prisma.offer.create({
      data: {
        publicId: offer.publicId,
        category: offer.category,
        summary: offer.summary,
        principalAmountCents: offer.principalAmountCents,
        fundingPriceCents: offer.fundingPriceCents,
        expectedRepaymentCents: offer.expectedRepaymentCents,
        repaymentAsset,
        dueDate: offer.dueDate,
        status: "LISTED",
        risk: offer.risk,
        fundedBasisPoints: offer.fundedBasisPoints,
        metadataHash: offer.metadataHash,
        onchainOfferId: offer.onchainOfferId,
        offerRegistryContract: contracts.offerRegistry,
        marketplaceContract: contracts.marketplace,
        settlementContract: contracts.settlement,
        lastIndexedLedger: 0,
        lastIndexedAt: new Date(),
        business: {
          connectOrCreate: {
            where: {
              walletAddress: `seed-business-${offer.publicId}`,
            },
            create: {
              name: offer.business,
              industry: offer.industry,
              walletAddress: `seed-business-${offer.publicId}`,
              verificationStatus: "KYB_VERIFIED",
              metadataHash: `${offer.metadataHash}_business`,
            },
          },
        },
        debtor: {
          connectOrCreate: {
            where: {
              walletAddress: `seed-debtor-${offer.publicId}`,
            },
            create: {
              name: offer.debtor,
              walletAddress: `seed-debtor-${offer.publicId}`,
              metadataHash: `${offer.metadataHash}_debtor`,
            },
          },
        },
        notes: {
          create: offer.notes.map((body, sortOrder) => ({ body, sortOrder })),
        },
        proofItems: {
          create: offer.proof.map((label, sortOrder) => ({ label, sortOrder })),
        },
        timeline: {
          create: offer.timeline.map((item, sortOrder) => ({
            ...item,
            sortOrder,
          })),
        },
      },
    });
  }

  const investor = await prisma.investorProfile.upsert({
    where: {
      walletAddress: "seed-investor-horizon",
    },
    update: {
      name: "Horizon Yield Desk",
      verificationStatus: "KYB_VERIFIED",
      metadataHash: "hp_meta_investor_horizon",
    },
    create: {
      name: "Horizon Yield Desk",
      walletAddress: "seed-investor-horizon",
      verificationStatus: "KYB_VERIFIED",
      metadataHash: "hp_meta_investor_horizon",
    },
  });

  const firstOffer = await prisma.offer.findUnique({
    where: { publicId: "HP-1048" },
    include: { business: true, debtor: true },
  });
  const secondOffer = await prisma.offer.findUnique({
    where: { publicId: "HP-1052" },
    include: { business: true, debtor: true },
  });

  if (firstOffer) {
    await prisma.workspaceUser.createMany({
      data: [
        {
          role: "BUSINESS",
          displayName: firstOffer.business.name,
          walletAddress: firstOffer.business.walletAddress,
          businessId: firstOffer.businessId,
        },
        {
          role: "DEBTOR",
          displayName: firstOffer.debtor.name,
          walletAddress: firstOffer.debtor.walletAddress,
          debtorId: firstOffer.debtorId,
        },
        {
          role: "INVESTOR",
          displayName: investor.name,
          walletAddress: investor.walletAddress,
          investorId: investor.id,
        },
        {
          role: "ADMIN",
          displayName: "Compliance Operator",
          walletAddress: contracts.deployerPublicKey,
        },
      ],
    });

    await prisma.fundingPosition.create({
      data: {
        offerId: firstOffer.id,
        investorId: investor.id,
        amountFundedCents: firstOffer.fundingPriceCents,
        expectedReturnCents: firstOffer.expectedRepaymentCents,
        status: "CONFIRMED",
        txHash: "seed_tx_fund_1048",
      },
    });

    await prisma.repayment.create({
      data: {
        offerId: firstOffer.id,
        debtorId: firstOffer.debtorId,
        amountCents: BigInt(320_000),
        remainingCents: firstOffer.expectedRepaymentCents - BigInt(320_000),
        status: "SUBMITTED",
        txHash: "seed_tx_repay_1048_partial",
      },
    });
  }

  if (secondOffer) {
    await prisma.adminReview.createMany({
      data: [
        {
          offerId: secondOffer.id,
          subject: "Repeated supplier metadata pattern",
          reason: "Multiple high-value Offers share similar document hashes and need operator review before additional listings.",
          status: "OPEN",
          severity: "High",
        },
        {
          offerId: secondOffer.id,
          subject: "Disclosure check",
          reason: "Investor disclosure copy should be accepted before funding this moderate-risk Offer.",
          status: "OPEN",
          severity: "Medium",
        },
      ],
    });
  }

  const operationSeeds = [
    {
      offer: firstOffer,
      operation: "Create Offer",
      contractId: contracts.offerRegistry,
      method: "create_offer",
      args: {
        principal_amount: "1280000",
        funding_price: "1212000",
        repayment_asset: "USDC",
        metadata_hash: "hp_meta_1048_brightcare",
      },
      status: "CONFIRMED",
    },
    {
      offer: firstOffer,
      operation: "Acknowledge Offer",
      contractId: contracts.offerRegistry,
      method: "acknowledge_offer",
      args: { offer_id: "1048" },
      status: "CONFIRMED",
    },
    {
      offer: secondOffer,
      operation: "Fund Offer",
      contractId: contracts.marketplace,
      method: "fund_offer",
      args: { offer_id: "1052", investor: investor.walletAddress },
      status: "READY",
    },
    {
      offer: firstOffer,
      operation: "Repay Full",
      contractId: contracts.settlement,
      method: "repay_full",
      args: { offer_id: "1048", payer: firstOffer?.debtor.walletAddress ?? "seed-debtor-HP-1048" },
      status: "READY",
    },
    {
      offer: secondOffer,
      operation: "Freeze Offer",
      contractId: contracts.offerRegistry,
      method: "freeze_offer",
      args: { offer_id: "1052", reason: "metadata_review" },
      status: "READY",
    },
  ] as const;

  for (const operation of operationSeeds) {
    await prisma.contractOperation.create({
      data: {
        offerId: operation.offer?.id,
        operation: operation.operation,
        contractId: operation.contractId,
        method: operation.method,
        args: operation.args,
        status: operation.status,
        walletAddress: investor.walletAddress,
      },
    });
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
