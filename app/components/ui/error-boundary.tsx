"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card } from "./index";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    // Log error to error reporting service
    if (process.env.NODE_ENV === "production") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      const defaultFallback = (
        <Card padding="lg" centered>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Something went wrong
            </h3>
            <p className="text-white/64 mb-4">
              {this.state.error?.message || "An error occurred"}
            </p>
            {this.props.onReset && (
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onReset?.();
                }}
                className="star-button inline-flex min-h-10 items-center rounded-full bg-cyan-200 px-5 text-sm font-semibold text-cyan-950"
              >
                Try Again
              </button>
            )}
            {!this.props.onReset && (
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="star-button inline-flex min-h-10 items-center rounded-full bg-cyan-200 px-5 text-sm font-semibold text-cyan-950"
              >
                Reload
              </button>
            )}
          </div>
        </Card>
      );

      return this.props.fallback || defaultFallback;
    }

    return this.props.children;
  }
}

// Higher-order component version
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return class WithErrorBoundary extends React.Component<P> {
    render() {
      return (
        <ErrorBoundary fallback={fallback} onError={onError}>
          <Component {...this.props} />
        </ErrorBoundary>
      );
    }
  };
}
