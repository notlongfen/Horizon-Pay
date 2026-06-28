import { getHorizonPayContracts } from "./horizonpay-contracts";
import { readSorobanContract } from "./soroban-operations";

type LiveRead<T = unknown> = {
  status: "ready" | "unavailable";
  value: T | null;
  error?: string;
};

export type OfferLiveState = {
  offerId: string;
  offer: LiveRead;
  listing: LiveRead;
  listed: LiveRead<boolean>;
  remainingAmount: LiveRead<string>;
  repaymentStatus: LiveRead;
};

function jsonSafe(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(jsonSafe);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, jsonSafe(nested)]),
    );
  }
  return value;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Contract read failed.";
}

async function readValue<T>(
  fn: () => Promise<unknown>,
  normalize: (value: unknown) => T | null = (value) => jsonSafe(value) as T,
): Promise<LiveRead<T>> {
  try {
    const value = await fn();
    return {
      status: "ready",
      value: normalize(value),
    };
  } catch (error) {
    return {
      status: "unavailable",
      value: null,
      error: errorMessage(error),
    };
  }
}

export async function getOfferLiveState(params: {
  offerId: string;
  sourceAddress?: string;
}): Promise<OfferLiveState> {
  const contracts = getHorizonPayContracts();
  const offerId = params.offerId.replace(/\D/g, "") || "0";
  const offerArg = { type: "u64" as const, value: offerId };

  const [offer, listing, listed, remainingAmount, repaymentStatus] =
    await Promise.all([
      readValue(() =>
        readSorobanContract({
          sourceAddress: params.sourceAddress,
          contractId: contracts.offerRegistry,
          method: "get_offer",
          args: [offerArg],
        }),
      ),
      readValue(() =>
        readSorobanContract({
          sourceAddress: params.sourceAddress,
          contractId: contracts.marketplace,
          method: "get_listing",
          args: [offerArg],
        }),
      ),
      readValue(
        () =>
          readSorobanContract({
            sourceAddress: params.sourceAddress,
            contractId: contracts.marketplace,
            method: "is_listed",
            args: [offerArg],
          }),
        (value) => (typeof value === "boolean" ? value : null),
      ),
      readValue(
        () =>
          readSorobanContract({
            sourceAddress: params.sourceAddress,
            contractId: contracts.settlement,
            method: "get_remaining_amount",
            args: [offerArg],
          }),
        (value) =>
          typeof value === "bigint" || typeof value === "number" || typeof value === "string"
            ? value.toString()
            : null,
      ),
      readValue(() =>
        readSorobanContract({
          sourceAddress: params.sourceAddress,
          contractId: contracts.settlement,
          method: "get_repayment_status",
          args: [offerArg],
        }),
      ),
    ]);

  return {
    offerId,
    offer,
    listing,
    listed,
    remainingAmount,
    repaymentStatus,
  };
}
