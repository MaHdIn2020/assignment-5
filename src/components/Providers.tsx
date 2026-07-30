"use client";

// Providers wraps the whole app with:
// 1. TanStack Query client — for all server state / API calls
// 2. React Hot Toast — for global toast notifications
// 3. Auth hydration — reads localStorage on mount to restore the Zustand store
//
// This must be a Client Component ("use client") because QueryClient and
// useEffect both require client-side execution.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";

function AuthHydrator() {
  // Restore auth state from localStorage once the client mounts.
  // We use a ref to ensure this only fires once even in StrictMode.
  const { init } = useAuthStore();
  const called = useRef(false);

  useEffect(() => {
    if (!called.current) {
      init();
      called.current = true;
    }
  }, [init]);

  return null;
}

// Create the QueryClient outside the component so it isn't recreated on re-render.
// Default options: retry once, stale after 60s.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            borderRadius: "10px",
            border: "1px solid #334155",
          },
          success: { iconTheme: { primary: "#22c55e", secondary: "#1e293b" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#1e293b" } },
        }}
      />
      {/* DevTools only visible in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
