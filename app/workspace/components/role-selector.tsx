"use client";

import type { RoleSelectorProps } from "./types";

const roleConfig = {
  business: {
    label: "Business",
    description: "Create and manage offers",
    icon: "🏢",
  },
  debtor: {
    label: "Debtor",
    description: "Acknowledge and repay",
    icon: "👤",
  },
  investor: {
    label: "Investor",
    description: "Fund offers",
    icon: "💰",
  },
  admin: {
    label: "Admin",
    description: "Verify and manage",
    icon: "🔒",
  },
} as const;

export function RoleSelector({ roles, activeRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-white/[0.04] p-1 border border-white/[0.08]">
      {roles.map((role) => {
        const config = roleConfig[role];
        const isActive = role === activeRole;

        return (
          <button
            key={role}
            type="button"
            onClick={() => onRoleChange(role)}
            className={`
              flex-1 flex items-center gap-2 px-4 py-2.5 text-sm font-medium 
              rounded-md transition-all duration-200
              ${isActive
                ? "bg-cyan-200 text-cyan-950"
                : "text-white/60 hover:text-white hover:bg-white/[0.06]"
              }
            `}
            aria-selected={isActive}
            aria-label={config.description}
          >
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
