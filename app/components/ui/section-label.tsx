"use client";

import { type HTMLAttributes, type ReactNode } from "react";

/**
 * Section label props
 */
export interface SectionLabelProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  /** Opacity level for the label */
  opacity?: "default" | "muted";
}

/**
 * SectionLabel component - Standardized section label
 * Used for section headers across the application
 */
export function SectionLabel({
  children,
  opacity = "default",
  className = "",
  ...props
}: SectionLabelProps) {
  const opacityClass = opacity === "muted" ? "text-cyan-100/60" : "text-cyan-100";

  return (
    <p
      className={`section-label mb-5 w-fit rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] ${opacityClass} ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}
