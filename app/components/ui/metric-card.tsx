"use client";

import { type HTMLAttributes, type ReactNode } from "react";

/**
 * Metric card color options
 */
export type MetricColor = "cyan" | "lime" | "white" | "red";

/**
 * Metric card props
 */
export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  /** The label text (e.g., "Total Invested") */
  label: string;
  /** The main value to display */
  value: string | number | ReactNode;
  /** Optional description text */
  description?: string | ReactNode;
  /** Color theme for the value */
  color?: MetricColor;
  /** Custom className for the value */
  valueClassName?: string;
  /** Custom className for the description */
  descriptionClassName?: string;
}

/**
 * Color classes for different metric themes
 */
const colorClasses: Record<MetricColor, { value: string; description: string }> = {
  cyan: {
    value: "text-cyan-100",
    description: "text-cyan-100/60",
  },
  lime: {
    value: "text-lime-100",
    description: "text-lime-100/60",
  },
  white: {
    value: "text-white",
    description: "text-white/46",
  },
  red: {
    value: "text-red-400",
    description: "text-red-400/60",
  },
};

/**
 * MetricCard component - Standardized metric display
 * Used for dashboard statistics, portfolio metrics, etc.
 */
export function MetricCard({
  label,
  value,
  description,
  color = "white",
  valueClassName = "",
  descriptionClassName = "",
  className = "",
  ...props
}: MetricCardProps) {
  const { value: valueColor, description: descColor } = colorClasses[color];

  return (
    <div className={className} {...props}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
        {label}
      </p>
      <p className={`mt-4 text-3xl font-semibold tracking-tight ${valueColor} ${valueClassName}`}>
        {value}
      </p>
      {description && (
        <p className={`mt-2 text-xs ${descColor} ${descriptionClassName}`}>
          {description}
        </p>
      )}
    </div>
  );
}
