"use client";

import { StatusBadge, OnchainBadge } from "./status-badge";
import type { OfferTableProps, OfferRow, WorkspaceAction } from "./types";

interface OfferTableRowProps {
  offer: OfferRow;
  isSelected: boolean;
  onSelect: () => void;
  onAction: (action: WorkspaceAction) => void;
  activeRole: string;
}

function OfferTableRow({ offer, isSelected, onSelect, onAction, activeRole }: OfferTableRowProps) {
  // Determine which action to show based on role and status
  const getActionLabel = (): WorkspaceAction => {
    const status = offer.status.replace(/ /g, "_");
    const roleMap: Record<string, Record<string, WorkspaceAction>> = {
      business: {
        Draft: "Create Offer",
        Pending_Debtor_Acknowledgement: "Cancel Offer",
        Acknowledged: "List Offer",
        Active: "List Offer",
        Listed: "Create Offer",
        Funded: "Create Offer",
      },
      debtor: {
        Draft: "Acknowledge",
        Pending_Debtor_Acknowledgement: "Acknowledge",
        Acknowledged: "Open Dispute",
        Active: "Open Dispute",
        Listed: "Open Dispute",
        Funded: "Repay",
        Partially_Repaid: "Repay",
        Overdue: "Repay",
      },
      investor: {
        Draft: "Fund Offer",
        Acknowledged: "Fund Offer",
        Listed: "Fund Offer",
        Funded: "Fund Offer",
      },
      admin: {
        Draft: "Freeze Offer",
        Acknowledged: "Freeze Offer",
        Listed: "Freeze Offer",
        Funded: "Freeze Offer",
      },
    };
    return roleMap[activeRole]?.[status] || "View";
  };

  const action = getActionLabel();

  return (
    <tr
      onClick={onSelect}
      className={`
        border-b border-white/[0.04] transition-colors
        ${isSelected ? "bg-white/[0.04]" : "hover:bg-white/[0.02] cursor-pointer"}
      `}
    >
      <td className="py-4 pl-4 pr-2">
        <div className="flex items-center gap-3">
          <input
            type="radio"
            checked={isSelected}
            onChange={(e) => e.stopPropagation()}
            className="w-4 h-4 text-cyan-400 border-white/20 bg-transparent"
          />
          <div className="flex flex-col">
            <span className="font-medium text-white">{offer.id}</span>
            <span className="text-xs text-white/50">{offer.category}</span>
          </div>
        </div>
      </td>
      
      <td className="py-4 px-2">
        <span className="text-white/80">{offer.counterparty}</span>
      </td>
      
      <td className="py-4 px-2">
        <span className="font-medium text-white">{offer.amount}</span>
        <span className="text-xs text-white/50 ml-1">{offer.fundingPrice}</span>
      </td>
      
      <td className="py-4 px-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={offer.status} />
          <OnchainBadge onchainOfferId={offer.onchainOfferId} />
        </div>
      </td>
      
      <td className="py-4 pl-2 pr-4">
        {offer.onchainOfferId && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAction(action);
            }}
            className="
              px-3 py-1.5 text-xs font-medium bg-cyan-200 text-cyan-950 
              rounded-md hover:bg-cyan-100 transition-colors
            "
          >
            {action.replace(/ /g, "\n")}
          </button>
        )}
      </td>
    </tr>
  );
}

function EmptyState({ activeRole }: { activeRole: string }) {
  const messages: Record<string, string> = {
    business: "No offers yet. Create your first offer to get started.",
    debtor: "No offers assigned to you. Check back later for new obligations.",
    investor: "No offers available for funding. Check back later.",
    admin: "No offers to review. The platform is ready for use.",
  };

  return (
    <div className="py-12 text-center">
      <p className="text-white/60">{messages[activeRole] || messages.business}</p>
    </div>
  );
}

export function OfferTable({
  offers,
  selectedOfferId,
  onSelectOffer,
  onAction,
  activeRole,
  isLoading,
}: OfferTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (offers.length === 0) {
    return <EmptyState activeRole={activeRole} />;
  }

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.08]">
            <th className="text-left py-3 pl-4 pr-2">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Offer
              </span>
            </th>
            <th className="text-left py-3 px-2">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Counterparty
              </span>
            </th>
            <th className="text-left py-3 px-2">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Amount
              </span>
            </th>
            <th className="text-left py-3 px-2">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Status
              </span>
            </th>
            <th className="text-left py-3 pl-2 pr-4">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Actions
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <OfferTableRow
              key={offer.id}
              offer={offer}
              isSelected={offer.id === selectedOfferId}
              onSelect={() => onSelectOffer(offer.id)}
              onAction={(action) => onAction(action, offer.id)}
              activeRole={activeRole}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
