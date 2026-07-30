"use client";
// error.tsx — rendered by Next.js when an unhandled error bubbles up from a route.
// Must be a Client Component ("use client") so it can use the reset() function.

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md text-center space-y-5">
        <div className="text-5xl">🚨</div>
        <h1 className="text-2xl font-bold text-slate-100">Oops! Something broke</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="text-xs text-slate-600">Error ID: {error.digest}</p>
        )}
        <button onClick={reset} className="btn-gradient">
          Try Again
        </button>
      </div>
    </div>
  );
}
