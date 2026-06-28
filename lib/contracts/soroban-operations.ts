import {
  Address,
  Asset,
  BASE_FEE,
  Contract,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/rpc";
import { Api } from "@stellar/stellar-sdk/rpc";
import { getHorizonPayContracts } from "./horizonpay-contracts";

export type SorobanArg =
  | { type: "address"; value: string }
  | { type: "bytes"; value: string }
  | { type: "string"; value: string }
  | { type: "symbol"; value: string }
  | { type: "u64"; value: string | number | bigint }
  | { type: "i128"; value: string | number | bigint }
  | { type: "bool"; value: boolean };

export type BuildSorobanTransactionInput = {
  sourceAddress: string;
  contractId: string;
  method: string;
  args: SorobanArg[];
};

export type ReadSorobanContractInput = {
  sourceAddress?: string;
  contractId: string;
  method: string;
  args: SorobanArg[];
};

export type BuildSorobanTransactionResult = {
  unsignedXdr: string;
  networkPassphrase: string;
};

export type SubmitSorobanTransactionInput = {
  signedXdr: string;
};

export type SubmitSorobanTransactionResult = {
  hash: string;
  status: string;
  latestLedger?: number;
  returnValue?: unknown;
};

const defaultTestnetRpcUrl = "https://soroban-testnet.stellar.org";

function getRpcUrl() {
  return process.env.STELLAR_RPC_URL || process.env.NEXT_PUBLIC_STELLAR_RPC_URL || defaultTestnetRpcUrl;
}

function toScVal(arg: SorobanArg) {
  if (arg.type === "address") return Address.fromString(arg.value).toScVal();
  if (arg.type === "bytes") return nativeToScVal(Buffer.from(arg.value));
  if (arg.type === "bool") return nativeToScVal(arg.value);
  if (arg.type === "i128") return nativeToScVal(BigInt(arg.value), { type: "i128" });
  if (arg.type === "u64") return nativeToScVal(BigInt(arg.value), { type: "u64" });
  if (arg.type === "symbol") return nativeToScVal(arg.value, { type: "symbol" });
  return nativeToScVal(arg.value, { type: "string" });
}

export function getDefaultRepaymentAssetContractId() {
  return (
    process.env.NEXT_PUBLIC_HORIZONPAY_REPAYMENT_ASSET_CONTRACT_ID ||
    process.env.HORIZONPAY_REPAYMENT_ASSET_CONTRACT_ID ||
    Asset.native().contractId(Networks.TESTNET)
  );
}

export async function buildSorobanTransaction(
  input: BuildSorobanTransactionInput,
): Promise<BuildSorobanTransactionResult> {
  const contracts = getHorizonPayContracts();
  const server = new Server(getRpcUrl());
  const account = await server.getAccount(input.sourceAddress);
  const contract = new Contract(input.contractId);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: contracts.passphrase,
  })
    .addOperation(contract.call(input.method, ...input.args.map(toScVal)))
    .setTimeout(90)
    .build();

  const prepared = await server.prepareTransaction(transaction);

  return {
    unsignedXdr: prepared.toEnvelope().toXDR("base64"),
    networkPassphrase: contracts.passphrase,
  };
}

export async function readSorobanContract(input: ReadSorobanContractInput) {
  const contracts = getHorizonPayContracts();
  const server = new Server(getRpcUrl());
  const sourceAddress = input.sourceAddress || contracts.deployerPublicKey;
  const account = await server.getAccount(sourceAddress);
  const contract = new Contract(input.contractId);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: contracts.passphrase,
  })
    .addOperation(contract.call(input.method, ...input.args.map(toScVal)))
    .setTimeout(90)
    .build();

  const simulated = await server.simulateTransaction(transaction);

  if (!Api.isSimulationSuccess(simulated)) {
    throw new Error(simulated.error || `Read call ${input.method} failed.`);
  }

  return simulated.result?.retval ? scValToNative(simulated.result.retval) : null;
}

export async function submitSorobanTransaction(
  input: SubmitSorobanTransactionInput,
): Promise<SubmitSorobanTransactionResult> {
  const contracts = getHorizonPayContracts();
  const server = new Server(getRpcUrl());
  const transaction = TransactionBuilder.fromXDR(input.signedXdr, contracts.passphrase);
  const submitted = await server.sendTransaction(transaction);

  if (submitted.status === "ERROR") {
    throw new Error(
      submitted.errorResult?.toXDR("base64") ??
        "Soroban transaction failed before inclusion.",
    );
  }

  if (submitted.status !== "PENDING" && submitted.status !== "DUPLICATE") {
    return {
      hash: submitted.hash,
      status: submitted.status,
      latestLedger: submitted.latestLedger,
    };
  }

  for (let attempt = 0; attempt < 12; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const result = await server.getTransaction(submitted.hash);

    if (result.status === "SUCCESS") {
      return {
        hash: submitted.hash,
        status: result.status,
        latestLedger: result.latestLedger,
        returnValue: result.returnValue ? scValToNative(result.returnValue) : undefined,
      };
    }

    if (result.status === "FAILED") {
      throw new Error(
        result.resultXdr?.toXDR("base64") ?? "Soroban transaction failed.",
      );
    }
  }

  return {
    hash: submitted.hash,
    status: "PENDING",
    latestLedger: submitted.latestLedger,
  };
}
