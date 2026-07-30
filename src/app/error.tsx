"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

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
      <div className="card-elevated p-10 max-w-md text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-900/30 flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Something went wrong</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="text-xs text-slate-600">Error ID: {error.digest}</p>
        )}
        <button onClick={reset} className="btn-primary">
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    </div>
  );
}
