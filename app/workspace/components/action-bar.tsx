"use client";

import type { ActionBarProps, WorkspaceAction } from "./types";
import {
  getPrimaryActionsForRole,
  getActionLabel,
  getActionIcon,
  requiresWallet,
  requiresOfferSelection,
  requiresOnchainOfferId,
  getActionDisabledReason,
} from "@/lib/workspace/action-config";

interface ActionButtonProps {
  action: WorkspaceAction;
  label: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
  disabledReason?: string;
  isPrimary?: boolean;
}

function ActionButton({
  action,
  label,
  icon,
  onClick,
  disabled,
  disabledReason,
  isPrimary = false,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      className={`
        flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${isPrimary
          ? "bg-cyan-200 text-cyan-950 hover:bg-cyan-100"
          : "bg-white/[0.04] text-white/80 hover:bg-white/[0.08] border border-white/[0.08]"
        }
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

interface ReadinessIndicatorProps {
  checks: Array<{ label: string; status: "ready" | "blocked" | "unknown"; detail: string }>;
}

function ReadinessIndicator({ checks }: ReadinessIndicatorProps) {
  if (checks.length === 0) return null;

  const blocked = checks.filter((c) => c.status === "blocked");
  const unknown = checks.filter((c) => c.status === "unknown");
  const allReady = blocked.length === 0 && unknown.length === 0;

  if (allReady) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>Ready to proceed</span>
      </div>
    );
  }

  if (blocked.length > 0) {
    return (
      <div className="flex items-center gap-2 text-red-400 text-sm">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span>{blocked[0].detail}</span>
      </div>
    );
  }

  return null;
}

export function ActionBar({
  activeRole,
  selectedOffer,
  onAction,
  isPreparing,
  walletAddress,
  readinessChecks,
}: ActionBarProps) {
  const primaryActions = getPrimaryActionsForRole(activeRole);
  const hasSelection = !!selectedOffer;

  // Get context-aware actions
  const getContextActions = (): Array<{ action: WorkspaceAction; requiresSelection: boolean }> => {
    const allActions = [
      "Create Offer", "List Offer", "Acknowledge", "Fund Offer", 
      "Repay", "Repay Full", "Open Dispute", "Cancel Offer", 
      "Freeze Offer", "Verify Business", "Verify Debtor", 
      "Verify Investor", "Enable Asset"
    ] as WorkspaceAction[];

    return allActions
      .filter((action) => primaryActions.includes(action))
      .map((action) => ({
        action,
        requiresSelection: requiresOfferSelection(action),
      }));
  };

  const contextActions = getContextActions();

  // Check if action requires a selected offer with onchainOfferId
  const isActionDisabled = (action: WorkspaceAction): boolean => {
    const hasWallet = !!walletAddress;
    
    if (!hasWallet && requiresWallet(action)) {
      return true;
    }

    if (!hasSelection && requiresOfferSelection(action)) {
      return true;
    }

    if (hasSelection && !selectedOffer?.onchainOfferId && requiresOnchainOfferId(action)) {
      return true;
    }

    return false;
  };

  const getDisabledReason = (action: WorkspaceAction): string => {
    return getActionDisabledReason(action, {
      hasWallet: !!walletAddress,
      hasSelection: hasSelection,
      hasOnchainId: !!selectedOffer?.onchainOfferId,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Actions */}
      <div className="flex flex-wrap gap-3">
        {contextActions.map(({ action, requiresSelection }, index) => {
          const label = getActionLabel(action);
          const icon = getActionIcon(action);
          const disabled = isActionDisabled(action);
          const disabledReason = getDisabledReason(action);
          const isPrimary = index === 0; // First action is primary

          return (
            <ActionButton
              key={action}
              action={action}
              label={label}
              icon={icon}
              onClick={() => {
                if (requiresSelection && selectedOffer) {
                  onAction(action, selectedOffer.id);
                } else {
                  onAction(action);
                }
              }}
              disabled={disabled || isPreparing}
              disabledReason={disabledReason}
              isPrimary={isPrimary}
            />
          );
        })}
      </div>

      {/* Readiness Indicator */}
      <ReadinessIndicator checks={readinessChecks} />

      {/* Wallet Status */}
      {!walletAddress && (
        <div className="text-sm text-amber-400">
          Connect your wallet to perform actions
        </div>
      )}

      {isPreparing && (
        <div className="text-sm text-cyan-400">
          Preparing operation...
        </div>
      )}
    </div>
  );
}
