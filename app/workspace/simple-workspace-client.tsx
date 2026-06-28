"use client";

import { useEffect, useMemo, useState } from "react";
import type { WorkspaceData, WorkspaceRole } from "@/lib/workspace/workspace-types";
import { useWallet, NetworkBadge } from "../components/wallet-provider";
import { formatStellarAddress } from "@/lib/utils";
import { BorderGlow } from "../components/border-glow";

interface SimpleWorkspaceClientProps {
  data: WorkspaceData;
  initialOfferId?: string;
  initialRole?: string;
}

function getStatusVariant(status: string) {
  const variants = {
    DRAFT: "default",
    PENDING_DEBTOR_ACKNOWLEDGEMENT: "warning",
    ACTIVE: "success",
    ACKNOWLEDGED: "success",
    LISTED: "info",
    FUNDED: "success",
    PARTIALLY_REPAID: "warning",
    SETTLED: "success",
    REPAID: "success",
    OVERDUE: "danger",
    DEFAULTED: "danger",
    DISPUTED: "warning",
    FROZEN: "danger",
    CANCELLED: "default",
  };
  return variants[status as keyof typeof variants] || "default";
}

function getDisplayStatus(status: string): string {
  const statusMap: Record<string, string> = {
    DRAFT: "Draft",
    PENDING_DEBTOR_ACKNOWLEDGEMENT: "Pending ACK",
    ACTIVE: "Active",
    ACKNOWLEDGED: "Acknowledged",
    LISTED: "Listed",
    FUNDED: "Funded",
    PARTIALLY_REPAID: "Partially Repaid",
    SETTLED: "Settled",
    REPAID: "Repaid",
    OVERDUE: "Overdue",
    DEFAULTED: "Defaulted",
    DISPUTED: "Disputed",
    FROZEN: "Frozen",
    CANCELLED: "Cancelled",
  };
  return statusMap[status] || status;
}

function truncateAddress(address: string, length = 10): string {
  if (!address) return "N/A";
  return address.length <= length * 2
    ? address
    : `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function SimpleWorkspaceClient({
  data,
  initialOfferId,
  initialRole,
}: SimpleWorkspaceClientProps) {
  // Wallet from context
  const { 
    address: walletAddress, 
    network: walletNetwork, 
    connect: handleConnectWallet, 
    disconnect: handleDisconnectWallet,
    signTransaction,
  } = useWallet();

  // State
  const [activeRole, setActiveRole] = useState<WorkspaceRole>(
    (initialRole as WorkspaceRole) || (initialOfferId ? "investor" : "business")
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | undefined>(initialOfferId);

  // Derived state
  const activeWorkspace = useMemo(
    () => data.roles.find((role) => role.role === activeRole) ?? data.roles[0],
    [activeRole, data.roles]
  );

  const selectedOffer = useMemo(
    () => activeWorkspace.offers.find((offer) => offer.id === selectedOfferId) ?? null,
    [activeWorkspace.offers, selectedOfferId]
  );

  // Handle offer selection
  const handleSelectOffer = (offerId: string) => {
    setSelectedOfferId(offerId);
  };

  // Clear error/notice
  const clearMessages = () => {
    setError(null);
    setNotice(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">{activeWorkspace.title}</h1>
            <p className="text-white/60 mt-1">{activeWorkspace.summary}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Wallet Connect */}
            {walletAddress ? (
              <>
                <div className="flex items-center gap-2">
                  <NetworkBadge network={walletNetwork || "unknown"} />
                  <span className="font-mono text-sm">{formatStellarAddress(walletAddress)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnectWallet}
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnectWallet}
                className="px-4 py-2 text-sm font-medium bg-cyan-200 text-cyan-950 rounded-lg hover:bg-cyan-100 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Error and Notice */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={clearMessages}
            className="text-xs text-red-400/70 hover:text-red-400 mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {notice && (
        <div className="mb-6 p-4 bg-cyan-900/20 border border-cyan-700/20 rounded-lg">
          <p className="text-sm text-cyan-400">{notice}</p>
          <button
            onClick={clearMessages}
            className="text-xs text-cyan-400/70 hover:text-cyan-400 mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {walletNetwork && !walletNetwork.includes("test") && (
        <div className="mb-6 p-4 bg-amber-900/20 border border-amber-700/20 rounded-lg">
          <p className="text-sm text-amber-400">
            Wallet network is {walletNetwork}. Please switch to Stellar Testnet.
          </p>
        </div>
      )}

      {/* Offer Details Modal */}
      {selectedOffer && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setSelectedOfferId(undefined)}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none p-4">
            <div
              className="modal-wrapper pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content-inner">
                <BorderGlow className="glass-panel p-8 relative">
                <button
                  onClick={() => setSelectedOfferId(undefined)}
                  className="modal-close-btn"
                  aria-label="Close"
                >
                  ×
                </button>
                <h3 className="text-xl font-semibold text-white mb-6">{selectedOffer.title}</h3>
              <dl className="grid gap-4">
                <div className="border-b border-white/10 pb-4">
                  <dt className="text-sm text-white/50 uppercase tracking-wider">ID</dt>
                  <dd className="text-white/80 mt-1">{selectedOffer.id}</dd>
                </div>
                <div className="border-b border-white/10 pb-4">
                  <dt className="text-sm text-white/50 uppercase tracking-wider">Counterparty</dt>
                  <dd className="text-white/80 mt-1">{selectedOffer.counterparty}</dd>
                </div>
                <div className="border-b border-white/10 pb-4">
                  <dt className="text-sm text-white/50 uppercase tracking-wider">Category</dt>
                  <dd className="text-white/80 mt-1">{selectedOffer.category}</dd>
                </div>
                <div className="border-b border-white/10 pb-4">
                  <dt className="text-sm text-white/50 uppercase tracking-wider">Due Date</dt>
                  <dd className="text-white/80 mt-1">{selectedOffer.due}</dd>
                </div>
                <div className="border-b border-white/10 pb-4">
                  <dt className="text-sm text-white/50 uppercase tracking-wider">Amount</dt>
                  <dd className="text-white/80 mt-1">{selectedOffer.amount}</dd>
                </div>
                <div className="border-b border-white/10 pb-4">
                  <dt className="text-sm text-white/50 uppercase tracking-wider">Funding Price</dt>
                  <dd className="text-white/80 mt-1">{selectedOffer.fundingPrice}</dd>
                </div>
                <div className="border-b border-white/10 pb-4">
                  <dt className="text-sm text-white/50 uppercase tracking-wider">Risk</dt>
                  <dd className="text-white/80 mt-1">{selectedOffer.risk}</dd>
                </div>
                <div className="border-b border-white/10 pb-4">
                  <dt className="text-sm text-white/50 uppercase tracking-wider">Status</dt>
                  <dd className="text-white/80 mt-1">{getDisplayStatus(selectedOffer.status)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-white/50 uppercase tracking-wider">Onchain ID</dt>
                  <dd className="text-white/80 mt-1 font-mono text-xs">
                    {selectedOffer.onchainOfferId || "N/A"}
                  </dd>
                </div>
              </dl>
              </BorderGlow>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Offers Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Offers</h2>
            <span className="text-sm text-white/46">
              {activeWorkspace.offers.length} total
            </span>
          </div>

          {activeWorkspace.offers.length === 0 ? (
            <BorderGlow className="glass-panel p-8 text-center">
              <p className="text-lg text-white/64">No Offers yet</p>
              <p className="mt-2 text-sm text-white/46">
                {activeRole === "business"
                  ? "Create your first Funding Offer to unlock liquidity"
                  : activeRole === "debtor"
                  ? "No payment obligations found"
                  : activeRole === "investor"
                  ? "No Offers available for funding"
                  : "No Offers to manage"}
              </p>
            </BorderGlow>
          ) : (
            <BorderGlow className="glass-panel">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Offer</th>
                    <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Counterparty</th>
                    <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Amount</th>
                    <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Due</th>
                    <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Status</th>
                    <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">View</th>
                  </tr>
                </thead>
                <tbody>
                  {activeWorkspace.offers.map((offer) => (
                    <tr
                      key={offer.id}
                      className="border-b border-white/8 hover:bg-white/8 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <p className="font-semibold text-white">{offer.id}</p>
                        <p className="text-xs text-white/46 truncate">{offer.title}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white/76">{offer.counterparty}</p>
                        <p className="text-xs text-white/46">{offer.category}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-white">{offer.amount}</p>
                        <p className="text-xs text-white/46">{offer.fundingPrice}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white/76">{offer.due}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            getStatusVariant(offer.status) === "success"
                              ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                              : getStatusVariant(offer.status) === "warning"
                              ? "border-lime-400/30 bg-lime-400/10 text-lime-100"
                              : getStatusVariant(offer.status) === "danger"
                              ? "border-red-400/30 bg-red-400/10 text-red-100"
                              : "border-white/10 bg-white/5 text-white/46"
                          }`}
                        >
                          {getDisplayStatus(offer.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleSelectOffer(offer.id)}
                          className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/76 transition hover:bg-white/10"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </BorderGlow>
          )}
        </div>
      </div>

      {/* Contract Info */}
      <details className="border-t border-white/[0.06] pt-6">
        <summary className="cursor-pointer text-sm font-medium text-white/60 hover:text-white">
          Contract Information
        </summary>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Network</p>
            <p className="font-mono text-sm text-white/80">{data.contracts.network}</p>
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Offer Registry</p>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${data.contracts.offerRegistry}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-cyan-400 hover:text-cyan-300 transition-colors block truncate"
              title="View on Stellar Expert"
            >
              {truncateAddress(data.contracts.offerRegistry, 12)}
            </a>
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Marketplace</p>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${data.contracts.marketplace}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-cyan-400 hover:text-cyan-300 transition-colors block truncate"
              title="View on Stellar Expert"
            >
              {truncateAddress(data.contracts.marketplace, 12)}
            </a>
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Settlement</p>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${data.contracts.settlement}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-cyan-400 hover:text-cyan-300 transition-colors block truncate"
              title="View on Stellar Expert"
            >
              {truncateAddress(data.contracts.settlement, 12)}
            </a>
          </div>
        </div>
      </details>
    </div>
  );
}
