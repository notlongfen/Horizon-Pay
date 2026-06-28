"use client";

import { type HTMLAttributes, type ReactNode } from "react";
import { BorderGlow } from "../border-glow";

/**
 * Card padding options
 */
export type CardPadding = "none" | "sm" | "md" | "lg";

/**
 * Card variant options
 */
export type CardVariant = "glass" | "solid";

/**
 * Card props
 */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  padding?: CardPadding;
  variant?: CardVariant;
  centered?: boolean;
  overflowHidden?: boolean;
}

/**
 * Padding scale mapping
 */
const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4 sm:p-5",
  md: "p-6 sm:p-8",
  lg: "p-6 sm:p-8 lg:p-10",
};

/**
 * Variant class mapping
 */
const variantClasses: Record<CardVariant, string> = {
  glass: "glass-panel",
  solid: "",
};

/**
 * Card component - Reusable wrapper for panels/cards
 * Replaces the repeated BorderGlow + glass-panel pattern
 */
export function Card({
  children,
  padding = "md",
  variant = "glass",
  centered = false,
  overflowHidden = false,
  className = "",
  ...props
}: CardProps) {
  const paddingClass = paddingClasses[padding];
  const variantClass = variantClasses[variant];

  return (
    <BorderGlow
      className={`{
        ${variantClass}
        ${paddingClass}
        ${centered ? "text-center" : ""}
        ${overflowHidden ? "overflow-hidden" : ""}
        ${className}
      }`}
      {...props}
    >
      {children}
    </BorderGlow>
  );
}

Card.displayName = "Card";

/**
 * Pre-configured Card variants for common use cases
 */

export function GlassCard(props: Omit<CardProps, "variant">) {
  return <Card variant="glass" {...props} />;
}

GlassCard.displayName = "GlassCard";


export function SolidCard(props: Omit<CardProps, "variant">) {
  return <Card variant="solid" {...props} />;
}

SolidCard.displayName = "SolidCard";
