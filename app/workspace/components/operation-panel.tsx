"use client";

import { useState } from "react";
import { WalletAddress } from "./status-badge";
import { truncateAddress } from "./types";
import type { OperationPanelProps } from "./types";

// Format operation args for display (remove raw JSON)
function formatArgs(args: Record<string, unknown>): string {
  if (!args) return "No arguments";

  const formatted: string[] = [];
  
  for (const [key, value] of Object.entries(args)) {
    if (value === null || value === undefined) continue;
    
    let displayValue: string;
    
    switch (typeof value) {
      case "string":
        if (value.startsWith("G") && value.length === 56) {
          displayValue = truncateAddress(value, 8);
        } else if (value.length > 20) {
          displayValue = `${value.slice(0, 20)}...`;
        } else {
          displayValue = value;
        }
        break;
      case "number":
      case "bigint":
        displayValue = String(value);
        break;
      case "boolean":
        displayValue = value ? "Yes" : "No";
        break;
      case "object":
        displayValue = "[Object]";
        break;
      default:
        displayValue = String(value);
    }
    
    formatted.push(`${key}: ${displayValue}`);
  }
  
  return formatted.join(", ");
}

// Get status color
function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    Ready: "text-cyan-300",
    DRAFT: "text-white/60",
    PENDING_SIGNATURE: "text-blue-400",
    SUBMITTED: "text-cyan-400",
    CONFIRMED: "text-emerald-400",
    FAILED: "text-red-400",
  };
  return statusColors[status] || "text-white/60";
}

export function OperationPanel({
  operation,
  onExecute,
  onDismiss,
  isPending,
}: OperationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!operation) return null;

  const explorerUrl = operation.txHash
    ? `https://stellar.expert/explorer/testnet/tx/${operation.txHash}`
    : null;

  const formattedArgs = formatArgs(operation.args as Record<string, unknown>);
  const statusColor = getStatusColor(operation.status);

  // Check if operation is in a state that can be executed
  const canExecute = operation.status !== "Confirmed" && operation.status !== "Failed";

  return (
    <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/10 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5" />
            {operation.operation}
          </h3>
          <p className="text-sm text-white/60 mt-1">
            {operation.method}
          </p>
        </div>
        
        <button
          type="button"
          onClick={onDismiss}
          className="text-white/40 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>

      {/* Status and Wallet */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <span className={`rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
          {operation.status}
        </span>
        {operation.walletAddress && (
          <WalletAddress address={operation.walletAddress} truncate={true} />
        )}
      </div>

      {/* Contract Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Contract</p>
          <p className="font-mono text-sm text-white/80">
            {truncateAddress(operation.contractId, 10)}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Arguments</p>
          <p className="text-sm text-white/80">{formattedArgs}</p>
        </div>
      </div>

      {/* Transaction Hash */}
      {operation.txHash && (
        <div className="mb-4">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Transaction</p>
          <p className="text-sm text-white/80">
            {explorerUrl ? (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-300 hover:text-cyan-200 font-mono"
              >
                {truncateAddress(operation.txHash, 12)}
              </a>
            ) : (
              truncateAddress(operation.txHash, 12)
            )}
          </p>
        </div>
      )}

      {/* Error Message */}
      {operation.errorMessage && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700/20 rounded">
          <p className="text-sm text-red-400">{operation.errorMessage}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {canExecute && (
          <button
            type="button"
            onClick={() => onExecute(operation)}
            disabled={isPending}
            className="
              px-4 py-2 text-sm font-medium bg-cyan-200 text-cyan-950 
              rounded-lg hover:bg-cyan-100 transition-colors disabled:opacity-50
            "
          >
            {isPending ? "Processing..." : "Sign & Submit"}
          </button>
        )}

        {operation.txHash && explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="
              px-4 py-2 text-sm font-medium bg-white/[0.04] text-white/80 
              rounded-lg hover:bg-white/[0.08] transition-colors border border-white/[0.08]
            "
          >
            View on Explorer
          </a>
        )}

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="
            px-4 py-2 text-sm font-medium bg-white/[0.04] text-white/80 
            rounded-lg hover:bg-white/[0.08] transition-colors border border-white/[0.08]
          "
        >
          {isExpanded ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-5 pt-4 border-t border-white/[0.06]">
          <pre className="text-xs text-white/60 overflow-x-auto">
            {JSON.stringify(operation.args, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
