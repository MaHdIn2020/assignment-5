// Zustand auth store — global state for the logged-in user.
//
// WHY ZUSTAND over Context?
//   - No Provider wrapper required (simpler tree)
//   - State updates don't re-render unrelated components
//   - Works seamlessly with SSR (initialised client-side)
//
// WHY BOTH localStorage AND a cookie?
//   - Zustand state lives in memory — survives within the session.
//   - localStorage persists across page reloads (hydrated in `init()`).
//   - Cookie is read by `src/middleware.ts` which runs on the Edge and has
//     NO access to localStorage. The cookie lets middleware gate routes.

"use client";

import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  // Hydrate store from localStorage on first client render
  init: () => void;
  // Called after a successful login
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  // Called on logout
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  init: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken");
    const raw = localStorage.getItem("user");
    const user: User | null = raw ? JSON.parse(raw) : null;
    set({ user, accessToken: token, refreshToken: refresh });
  },

  setAuth: (user, accessToken, refreshToken) => {
    // Persist to localStorage for cross-reload survival
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    // Write the token into a cookie so Next.js middleware can read it
    // max-age = 7 days (matching the backend's refresh token lifetime)
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`;

    set({ user, accessToken, refreshToken });
  },

  clearAuth: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    // Expire the cookie immediately
    document.cookie = "accessToken=; max-age=0; path=/";
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
