"use client";

import { type HTMLAttributes, type ReactNode, useEffect } from "react";

/**
 * Modal props
 */
export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClose"> {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string | ReactNode;
  /** Modal content */
  children?: ReactNode;
  /** Size of the modal */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Whether to show the close button */
  showCloseButton?: boolean;
}

/**
 * Modal size classes
 */
const sizeClasses: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

/**
 * Modal component - Accessible modal dialog with blurred backdrop
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  className = "",
  ...props
}: ModalProps) {
  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[101] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      {...props}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal wrapper */}
      <div
        className={`relative w-full ${sizeClasses[size] || sizeClasses.md} bg-[#120F17] rounded-2xl border border-white/15 shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-white/8">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-white"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white transition-colors text-2xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`p-6 ${className}`}>{children}</div>
      </div>
    </div>
  );
}

Modal.displayName = "Modal";
