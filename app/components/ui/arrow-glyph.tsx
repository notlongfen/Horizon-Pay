import { type HTMLAttributes } from "react";

/**
 * ArrowGlyph component - Standardized arrow glyph used for CTAs and navigation
 * Used consistently across the application for action buttons and links
 */
export function ArrowGlyph({ className = "" }: HTMLAttributes<HTMLElement>) {
  return (
    <span aria-hidden="true" className={`ml-2 inline-block text-cyan-950 ${className}`}>
      -&gt;
    </span>
  );
}