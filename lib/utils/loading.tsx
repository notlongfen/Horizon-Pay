import React from "react";
import { Card } from "@/app/components/ui";

// Skeleton loading components
interface SkeletonProps {
  className?: string;
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4, className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-white/10 rounded mb-4 w-1/4"></div>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="h-10 bg-white/5 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <Card padding="md" className={className}>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-white/10 rounded w-1/3"></div>
        <div className="h-8 bg-white/5 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-white/10 rounded w-full"></div>
          <div className="h-3 bg-white/10 rounded w-2/3"></div>
        </div>
      </div>
    </Card>
  );
}

export function MetricCardSkeleton() {
  return (
    <Card padding="sm" className="animate-pulse">
      <div className="h-3 bg-white/10 rounded w-1/2 mb-3"></div>
      <div className="h-8 bg-white/5 rounded w-1/3 mb-2"></div>
      <div className="h-2 bg-white/10 rounded w-1/4"></div>
    </Card>
  );
}

export function MetricCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Card padding="sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    </Card>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <Card padding="md">
      <div className="animate-pulse space-y-4">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="h-12 bg-white/5 rounded"></div>
        ))}
      </div>
    </Card>
  );
}

export function ButtonSkeleton() {
  return (
    <div className="animate-pulse h-10 w-32 bg-cyan-200/20 rounded-full"></div>
  );
}

// Suspense boundaries with built-in fallbacks
export function SuspenseCard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <Card padding="md">
      <React.Suspense fallback={fallback || <CardSkeleton />}>
        {children}
      </React.Suspense>
    </Card>
  );
}

export function SuspenseSection({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <React.Suspense fallback={fallback || <CardSkeleton />}>
      {children}
    </React.Suspense>
  );
}

// Loading overlay component
export function LoadingOverlay({
  isLoading,
  message = "Loading...",
}: {
  isLoading: boolean;
  message?: string;
}) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card padding="lg" className="max-w-sm">
        <div className="flex items-center gap-4">
          <div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
          <p className="text-white/80">{message}</p>
        </div>
      </Card>
    </div>
  );
}

// Full page loading component
export function FullPageLoading() {
  return (
    <div className="fixed inset-0 bg-[#020504] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-12 w-12 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
        <p className="text-white/64 text-lg">Loading HorizonPay...</p>
      </div>
    </div>
  );
}
