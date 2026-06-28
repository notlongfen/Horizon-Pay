"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

/**
 * Button variants
 */
export type ButtonVariant = "primary" | "secondary" | "glass" | "star" | "ghost";

/**
 * Button sizes
 */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Button props
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * Base button component with consistent styling
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Variant classes
    const variantClasses = {
      primary:
        "bg-cyan-200 text-cyan-950 hover:bg-cyan-100 focus:ring-cyan-200",
      secondary:
        "bg-white/[0.04] text-white/80 hover:bg-white/[0.08] border border-white/[0.08] focus:ring-white/20",
      glass: "glass-button inline-flex items-center justify-center rounded-full px-6 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#020504]",
      star: "star-button inline-flex items-center justify-center rounded-full bg-cyan-200 px-6 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#020504]",
      ghost:
        "text-white/64 hover:text-white hover:bg-white/5 transition-colors",
    };

    // Size classes
    const sizeClasses = {
      sm: "min-h-8 px-3 text-xs",
      md: "min-h-10 px-4 text-sm",
      lg: "min-h-12 px-6 text-base",
    };

    // For glass and star variants, use predefined classes
    if (variant === "glass" || variant === "star") {
      return (
        <button
          ref={ref}
          className={`${variantClasses[variant]} ${isLoading ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
          disabled={disabled || isLoading}
          {...props}
        >
          {isLoading ? "Loading..." : (
            <>
              {leftIcon && <span className="mr-2">{leftIcon}</span>}
              {children}
              {rightIcon && <span className="ml-2">{rightIcon}</span>}
            </>
          )}
        </button>
      );
    }

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center rounded-lg
          font-medium transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Loading...
          </span>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

/**
 * Primary button (Cyan background)
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="primary" {...props} />
);

PrimaryButton.displayName = "PrimaryButton";

/**
 * Secondary button (Transparent/glass effect)
 */
export const SecondaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />
);

SecondaryButton.displayName = "SecondaryButton";

/**
 * Glass button variant (for dark backgrounds)
 */
export const GlassButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="glass" {...props} />
);

GlassButton.displayName = "GlassButton";

/**
 * Star button variant (light background, dark text)
 */
export const StarButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="star" {...props} />
);

StarButton.displayName = "StarButton";

/**
 * Ghost button (minimal styling, for icons or subtle actions)
 */
export const GhostButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="ghost" {...props} />
);

GhostButton.displayName = "GhostButton";

/**
 * Mini button for compact spaces (e.g., workspace action lists)
 */
export const MiniButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`
        workspace-mini-button inline-flex items-center justify-center
        rounded-full px-3 py-1.5 text-xs font-medium
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  )
);

MiniButton.displayName = "MiniButton";

/**
 * Action button for workspace operations
 */
export const ActionButton = forwardRef<HTMLButtonElement, ButtonProps & { isPrimary?: boolean }>(
  ({ isPrimary = false, className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`
        flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${isPrimary
          ? "bg-cyan-200 text-cyan-950 hover:bg-cyan-100"
          : "bg-white/[0.04] text-white/80 hover:bg-white/[0.08] border border-white/[0.08]"
        }
        ${className}
      `}
      {...props}
    />
  )
);

ActionButton.displayName = "ActionButton";
