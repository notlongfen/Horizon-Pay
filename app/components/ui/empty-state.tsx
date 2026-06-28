"use client";

import { type HTMLAttributes, type ReactNode } from "react";

/**
 * Empty state props
 */
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Icon to display (emoji or component) */
  icon?: string | ReactNode;
  /** Main title/heading */
  title: string | ReactNode;
  /** Optional description text */
  description?: string | ReactNode;
  /** Optional action button/component */
  action?: ReactNode;
  /** Size of the empty state */
  size?: "sm" | "md" | "lg";
}

/**
 * EmptyState component - Standardized empty state display
 * Used when there's no data to show (no offers, no investments, etc.)
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  size = "md",
  className = "",
  ...props
}: EmptyStateProps) {
  // Size classes
  const sizeClasses = {
    sm: "p-4",
    md: "p-6 sm:p-8",
    lg: "p-8 sm:p-10 lg:p-12",
  };

  return (
    <div
      className={`text-center ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && (
        <div className="mb-4 text-4xl sm:text-5xl" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="text-lg font-semibold text-white/64 sm:text-xl">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-white/46 sm:text-base">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
