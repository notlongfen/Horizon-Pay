import deployment from "@/docs/v2/horizonpay-testnet-deployment.json";

export type HorizonPayContracts = {
  network: string;
  passphrase: string;
  deployerPublicKey: string;
  version: number;
  factory: string;
  config: string;
  verificationRegistry: string;
  offerRegistry: string;
  marketplace: string;
  settlement: string;
  riskRegistry: string;
  fractionalization: string;
};

const deployedContracts: HorizonPayContracts = {
  network: deployment.network,
  passphrase: deployment.networkPassphrase,
  deployerPublicKey: deployment.deployer.publicKey,
  version: deployment.version,
  factory: deployment.contracts.factory,
  config: deployment.contracts.config,
  verificationRegistry: deployment.contracts.verificationRegistry,
  offerRegistry: deployment.contracts.offerRegistry,
  marketplace: deployment.contracts.marketplace,
  settlement: deployment.contracts.settlement,
  riskRegistry: deployment.contracts.riskRegistry,
  fractionalization: deployment.contracts.fractionalization,
};

function envOrDefault(key: string, fallback: string) {
  return process.env[key] || fallback;
}

export function getHorizonPayContracts(): HorizonPayContracts {
  return {
    network: envOrDefault("NEXT_PUBLIC_STELLAR_NETWORK", deployedContracts.network),
    passphrase: envOrDefault(
      "NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE",
      deployedContracts.passphrase,
    ),
    deployerPublicKey: deployedContracts.deployerPublicKey,
    version: deployedContracts.version,
    factory: envOrDefault(
      "NEXT_PUBLIC_HORIZONPAY_FACTORY_CONTRACT_ID",
      deployedContracts.factory,
    ),
    config: envOrDefault(
      "NEXT_PUBLIC_HORIZONPAY_CONFIG_CONTRACT_ID",
      deployedContracts.config,
    ),
    verificationRegistry: envOrDefault(
      "NEXT_PUBLIC_HORIZONPAY_VERIFICATION_REGISTRY_CONTRACT_ID",
      deployedContracts.verificationRegistry,
    ),
    offerRegistry: envOrDefault(
      "NEXT_PUBLIC_HORIZONPAY_OFFER_REGISTRY_CONTRACT_ID",
      deployedContracts.offerRegistry,
    ),
    marketplace: envOrDefault(
      "NEXT_PUBLIC_HORIZONPAY_MARKETPLACE_CONTRACT_ID",
      deployedContracts.marketplace,
    ),
    settlement: envOrDefault(
      "NEXT_PUBLIC_HORIZONPAY_SETTLEMENT_CONTRACT_ID",
      deployedContracts.settlement,
    ),
    riskRegistry: envOrDefault(
      "NEXT_PUBLIC_HORIZONPAY_RISK_REGISTRY_CONTRACT_ID",
      deployedContracts.riskRegistry,
    ),
    fractionalization: envOrDefault(
      "NEXT_PUBLIC_HORIZONPAY_FRACTIONALIZATION_CONTRACT_ID",
      deployedContracts.fractionalization,
    ),
  };
}

export const horizonPayWasmHashes = {
  factory: deployment.wasmHashes.factory,
  config: deployment.wasmHashes.config,
  verification: deployment.wasmHashes.verificationRegistry,
  offerRegistry: deployment.wasmHashes.offerRegistry,
  marketplace: deployment.wasmHashes.marketplace,
  settlement: deployment.wasmHashes.settlement,
  riskRegistry: deployment.wasmHashes.riskRegistry,
  fractionalization: deployment.wasmHashes.fractionalization,
} as const;
