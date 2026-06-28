"use client";

import type { ModuleInterface } from "@creit.tech/stellar-wallets-kit/types";

let kitInitPromise: Promise<
  typeof import("@creit.tech/stellar-wallets-kit/sdk")["StellarWalletsKit"]
> | null = null;

export function formatStellarAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}

export async function getWalletKit() {
  if (kitInitPromise) return kitInitPromise;

  kitInitPromise = (async () => {
    const [{ StellarWalletsKit }, { defaultModules }, walletConnect, kitTypes] =
      await Promise.all([
        import("@creit.tech/stellar-wallets-kit/sdk"),
        import("@creit.tech/stellar-wallets-kit/modules/utils"),
        import("@creit.tech/stellar-wallets-kit/modules/wallet-connect"),
        import("@creit.tech/stellar-wallets-kit/types"),
      ]);

    const modules: ModuleInterface[] = defaultModules();
    const walletConnectProjectId =
      process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

    if (walletConnectProjectId) {
      modules.push(
        new walletConnect.WalletConnectModule({
          projectId: walletConnectProjectId,
          allowedChains: [walletConnect.WalletConnectTargetChain.TESTNET],
          metadata: {
            name: "HorizonPay",
            description: "Verified receivables funding on Stellar.",
            url: window.location.origin,
            icons: [`${window.location.origin}/favicon.ico`],
          },
        }),
      );
    }

    StellarWalletsKit.init({
      modules,
      network: kitTypes.Networks.TESTNET,
      theme: {
        ...kitTypes.SwkAppDarkTheme,
        background: "#030706",
        "background-secondary": "#07110f",
        primary: "#5cf6ff",
        "primary-foreground": "#021112",
        "border-radius": "18px",
        "font-family":
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
      authModal: {
        showInstallLabel: true,
        hideUnsupportedWallets: false,
      },
    });

    return StellarWalletsKit;
  })();

  return kitInitPromise;
}

export async function signStellarTransaction(params: {
  xdr: string;
  networkPassphrase: string;
  address: string;
}): Promise<{ signedTxXdr: string; signerAddress?: string }> {
  const kit = await getWalletKit();
  return kit.signTransaction(params.xdr, {
    networkPassphrase: params.networkPassphrase,
    address: params.address,
  });
}

export async function getSelectedWalletNetwork() {
  const kit = await getWalletKit();
  const maybeNetworkReader = kit as unknown as {
    getNetwork?: () => Promise<string> | string;
  };

  if (!maybeNetworkReader.getNetwork) return "TESTNET";

  return maybeNetworkReader.getNetwork();
}

export async function connectWallet(): Promise<string> {
  const kit = await getWalletKit();
  const result = await kit.authModal();
  return result.address;
}

export async function getWalletAddress(): Promise<string> {
  const kit = await getWalletKit();
  const result = await kit.getAddress();
  return result.address;
}

export async function disconnectWallet(): Promise<void> {
  const kit = await getWalletKit();
  await kit.disconnect();
}
