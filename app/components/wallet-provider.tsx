"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  getWalletKit,
  signStellarTransaction,
  getSelectedWalletNetwork,
  connectWallet as connectWalletUtil,
  disconnectWallet as disconnectWalletUtil,
  getWalletAddress,
  formatStellarAddress as formatStellarAddressUtil,
} from "@/lib/wallet";

// Wallet event type for cross-component communication
const walletAddressEvent = "horizonpay:wallet-address";

/**
 * Wallet status types
 */
type WalletStatus = "idle" | "loading" | "connected" | "error" | "disconnected";

/**
 * Wallet context value
 */
interface WalletContextValue {
  // State
  address: string | undefined;
  status: WalletStatus;
  message: string;
  network: string | null;
  isConnecting: boolean;
  error: string | null;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (params: { xdr: string; networkPassphrase: string }) => Promise<string>;
  getNetwork: () => Promise<string>;
  refreshAddress: () => Promise<void>;
  
  // Display helpers
  formattedAddress: string;
  isConnected: boolean;
}

/**
 * Wallet context
 */
const WalletContext = createContext<WalletContextValue | null>(null);

/**
 * Wallet provider props
 */
interface WalletProviderProps {
  children: ReactNode;
  // Optional: Initial wallet address (for SSR hydration)
  initialAddress?: string;
}

/**
 * Wallet Provider Component
 * Centralized wallet management for the entire app
 */
export function WalletProvider({ children, initialAddress }: WalletProviderProps) {
  const [address, setAddress] = useState<string | undefined>(initialAddress);
  const [status, setStatus] = useState<WalletStatus>("loading");
  const [message, setMessage] = useState("Initializing wallet kit");
  const [network, setNetwork] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format address for display
  const formattedAddress = address ? formatStellarAddressUtil(address) : "Connect wallet";
  const isConnected = status === "connected" && !!address;

  // Publish wallet address changes to other components
  const publishWalletAddress = useCallback((addr: string | undefined) => {
    window.dispatchEvent(
      new CustomEvent(walletAddressEvent, {
        detail: { address: addr },
      })
    );
  }, []);

  // Initialize wallet kit and listen for changes
  useEffect(() => {
    let isMounted = true;
    let unsubscribeState: (() => void) | undefined;
    let unsubscribeDisconnect: (() => void) | undefined;

    const init = async () => {
      try {
        const [{ KitEventType }, kit] = await Promise.all([
          import("@creit.tech/stellar-wallets-kit/types"),
          getWalletKit(),
        ]);

        // Subscribe to state changes
        unsubscribeState = kit.on(KitEventType.STATE_UPDATED, (event) => {
          if (!isMounted) return;
          const newAddress = event.payload.address;
          setAddress(newAddress);
          publishWalletAddress(newAddress);
          setStatus(newAddress ? "connected" : "idle");
          setMessage(
            newAddress
              ? "Wallet connected on Stellar"
              : "Connect a Stellar wallet"
          );
        });

        // Subscribe to disconnect events
        unsubscribeDisconnect = kit.on(KitEventType.DISCONNECT, () => {
          if (!isMounted) return;
          setAddress(undefined);
          publishWalletAddress(undefined);
          setStatus("idle");
          setMessage("Wallet disconnected");
          setNetwork(null);
        });

        // Get current address
        const current = await kit.getAddress().catch(() => undefined);
        
        if (!isMounted) return;
        const currentAddress = current?.address;
        setAddress(currentAddress);
        publishWalletAddress(currentAddress);
        setStatus(currentAddress ? "connected" : "idle");
        setMessage(
          currentAddress
            ? "Wallet connected on Stellar"
            : "Connect a Stellar wallet"
        );

        // Get network if connected
        if (currentAddress) {
          checkNetwork();
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus("error");
        setMessage(
          err instanceof Error ? err.message : "Wallet kit failed to load"
        );
      }
    };

    // Check wallet network
    const checkNetwork = async () => {
      try {
        const net = await getSelectedWalletNetwork();
        setNetwork(String(net).toLowerCase());
      } catch {
        setNetwork(null);
      }
    };

    // Listen for address changes from other components (for backwards compatibility)
    const handleWalletAddress = (event: Event) => {
      const detail = (event as CustomEvent<{ address?: string }>).detail;
      if (detail?.address !== address) {
        setAddress(detail.address || undefined);
        if (detail.address) {
          setStatus("connected");
          checkNetwork();
        } else {
          setStatus("idle");
          setNetwork(null);
        }
      }
    };

    window.addEventListener(walletAddressEvent, handleWalletAddress);
    void init();

    return () => {
      isMounted = false;
      unsubscribeState?.();
      unsubscribeDisconnect?.();
      window.removeEventListener(walletAddressEvent, handleWalletAddress);
    };
  }, [publishWalletAddress, address]);

  // Refresh network when address changes
  useEffect(() => {
    if (address) {
      getSelectedWalletNetwork()
        .then((net) => setNetwork(String(net).toLowerCase()))
        .catch(() => setNetwork(null));
    } else {
      setNetwork(null);
    }
  }, [address]);

  // Wallet connection handler
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setStatus("loading");
    setMessage(address ? "Opening wallet profile" : "Opening wallet selector");

    try {
      const kit = await getWalletKit();

      if (address) {
        await kit.profileModal();
      } else {
        const result = await kit.authModal();
        if (result?.address) {
          setAddress(result.address);
          publishWalletAddress(result.address);
          setStatus("connected");
          setMessage("Wallet connected on Stellar");
          setIsConnecting(false);
          return;
        }
      }

      // Refresh address after connection
      const current = await kit.getAddress().catch(() => undefined);
      const currentAddress = current?.address;
      setAddress(currentAddress);
      publishWalletAddress(currentAddress);
      setStatus(currentAddress ? "connected" : "idle");
      setMessage(
        currentAddress
          ? "Wallet connected on Stellar"
          : "Connect a Stellar wallet"
      );
    } catch (err) {
      setStatus(address ? "connected" : "idle");
      setMessage(
        err instanceof Error ? err.message : "Wallet connection cancelled"
      );
      setError(err instanceof Error ? err.message : "Wallet connection failed");
    } finally {
      setIsConnecting(false);
    }
  }, [address, publishWalletAddress]);

  // Wallet disconnection handler
  const disconnect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const kit = await getWalletKit();
      await kit.disconnect();
      setAddress(undefined);
      publishWalletAddress(undefined);
      setStatus("idle");
      setMessage("Wallet disconnected");
      setNetwork(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, [publishWalletAddress]);

  // Sign transaction
  const signTransaction = useCallback(
    async (params: { xdr: string; networkPassphrase: string }) => {
      return signStellarTransaction({
        xdr: params.xdr,
        networkPassphrase: params.networkPassphrase,
        address: address || "",
      });
    },
    [address]
  );

  // Get network
  const getNetwork = useCallback(async () => {
    return getSelectedWalletNetwork();
  }, []);

  // Refresh address
  const refreshAddress = useCallback(async () => {
    try {
      const addr = await getWalletAddress();
      setAddress(addr);
      publishWalletAddress(addr);
    } catch {
      setAddress(undefined);
      publishWalletAddress(undefined);
    }
  }, [publishWalletAddress]);

  // Context value
  const contextValue: WalletContextValue = {
    // State
    address,
    status,
    message,
    network,
    isConnecting,
    error,
    
    // Actions
    connect,
    disconnect,
    signTransaction,
    getNetwork,
    refreshAddress,
    
    // Display helpers
    formattedAddress,
    isConnected,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Hook to access wallet context
 */
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

/**
 * WalletConnectButton component
 * Reusable button that connects/displays wallet status
 */
export function WalletConnectButton() {
  const {
    address,
    status,
    message,
    isConnecting,
    formattedAddress,
    connect,
  } = useWallet();

  const isLoading = status === "loading" || isConnecting;
  const label = address ? formattedAddress : "Connect wallet";

  return (
    <button
      type="button"
      className="wallet-connect-button"
      onClick={connect}
      disabled={isLoading}
      aria-label={address ? `Wallet ${address}` : "Connect Stellar wallet"}
      title={message}
    >
      <span className={`wallet-status-dot ${status}`} aria-hidden="true" />
      <span className="wallet-connect-label">
        {isLoading ? "Connecting" : label}
      </span>
    </button>
  );
}

/**
 * WalletStatus component
 * Displays wallet address with network badge
 */
export function WalletStatus({ showDisconnect = false }: { showDisconnect?: boolean }) {
  const {
    address,
    network,
    formattedAddress,
    disconnect,
    isConnecting,
  } = useWallet();

  if (!address) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <NetworkBadge network={network || "unknown"} />
        <span className="font-mono text-sm">{formattedAddress}</span>
      </div>
      {showDisconnect && (
        <button
          type="button"
          onClick={disconnect}
          disabled={isConnecting}
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/64 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}

/**
 * NetworkBadge component
 * Displays network badge for wallet
 */
export function NetworkBadge({ network }: { network: string }) {
  const isTestnet = network?.toLowerCase().includes("test");
  const label = isTestnet ? "Testnet" : network || "Unknown";
  
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        isTestnet
          ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
          : "border-amber-400/30 bg-amber-400/10 text-amber-100"
      }`}
    >
      {label}
    </span>
  );
}
