"use client";

import { StatusBadge, OnchainBadge } from "./status-badge";
import { formatAmount, formatDate } from "./types";
import type { OfferDetailsProps } from "./types";

interface OfferDetailsPanelProps extends OfferDetailsProps {
  onClose?: () => void;
}

export function OfferDetailsPanel({ offer, liveState, isLoading, onClose }: OfferDetailsPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-white/[0.08] rounded mb-4" />
          <div className="h-4 w-24 bg-white/[0.08] rounded mb-2" />
          <div className="h-4 w-48 bg-white/[0.08] rounded mb-2" />
          <div className="h-4 w-36 bg-white/[0.08] rounded" />
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-6">
        <p className="text-white/60 text-center">Select an offer to view details</p>
      </div>
    );
  }

  // Calculate discount percentage
  const principal = parseFloat(offer.amount.replace(/[^\d.]/g, ""));
  const funding = parseFloat(offer.fundingPrice.replace(/[^\d.]/g, ""));
  const discount = principal > 0 ? ((principal - funding) / principal) * 100 : 0;

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-6 relative">
      {/* Close button for modal context */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/46 hover:text-white text-2xl font-light transition-colors"
          aria-label="Close"
        >
          ×
        </button>
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            Offer {offer.id}
            <OnchainBadge onchainOfferId={offer.onchainOfferId} />
          </h3>
          <p className="text-sm text-white/60 mt-1">{offer.category}</p>
        </div>
        <StatusBadge status={offer.status} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Counterparty</p>
          <p className="text-white">{offer.counterparty}</p>
        </div>
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Due Date</p>
          <p className="text-white">{offer.dueDate}</p>
        </div>
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Principal</p>
          <p className="text-lg font-semibold text-white">{offer.amount}</p>
        </div>
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Funding Price</p>
          <p className="text-lg font-semibold text-cyan-300">{offer.fundingPrice}</p>
        </div>
      </div>

      {/* Discount */}
      {discount > 0 && (
        <div className="mb-6 p-4 bg-cyan-900/10 border border-cyan-700/10 rounded">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Discount</p>
          <p className="text-2xl font-bold text-cyan-300">{discount.toFixed(1)}%</p>
          <p className="text-sm text-white/60 mt-1">
            You save {formatAmount(principal - funding)}
          </p>
        </div>
      )}

      {/* Live State (from blockchain) */}
      {liveState && (
        <div className="border-t border-white/[0.06] pt-6">
          <h4 className="text-sm font-medium text-white/80 mb-4">On-Chain State</h4>
          <div className="space-y-3">
            {liveState.offer?.status === "ready" && (
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-white/80">Offer exists on-chain</span>
              </div>
            )}
            {liveState.listed?.value === true && (
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-white/80">Listed in marketplace</span>
              </div>
            )}
            {liveState.funded?.value === true && (
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-white/80">Fully funded</span>
              </div>
            )}
            {liveState.remainingAmount?.value && (
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-sm text-white/80">
                  Remaining: {liveState.remainingAmount.value}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
