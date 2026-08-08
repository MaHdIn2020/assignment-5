"use client";
// /dashboard/settings — appearance (theme) + notification preferences.

import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Moon, Sun, Bell, LogOut } from "lucide-react";

interface NotificationPrefs {
  requestUpdates: boolean;
  paymentReceipts: boolean;
  newsletter: boolean;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const [prefs, setPrefs] = useState<NotificationPrefs>({
    requestUpdates: true,
    paymentReceipts: true,
    newsletter: false,
  });

  // Persist notification prefs locally (mock — no backend store for this)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rentnest-notifications");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setPrefs(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  function togglePref(key: keyof NotificationPrefs) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("rentnest-notifications", JSON.stringify(next));
      toast.success("Preferences saved.");
      return next;
    });
  }

  function handleLogout() {
    clearAuth();
    toast.success("Logged out.");
    router.push("/");
  }

  if (!user) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          Account <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Appearance, notifications and account actions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Appearance ─────────────────────────────────────────────────── */}
        <div className="card p-6">
          <h3 className="font-semibold text-text-secondary mb-4">Appearance</h3>
          <p className="text-sm text-text-muted mb-4">
            Choose how RentNest looks for you.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                theme === "dark"
                  ? "border-accent-primary bg-accent-primary/10 text-text-primary"
                  : "border-card-border text-text-muted hover:border-text-muted"
              }`}
              id="theme-dark"
            >
              <Moon size={16} /> Dark
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                theme === "light"
                  ? "border-accent-primary bg-accent-primary/10 text-text-primary"
                  : "border-card-border text-text-muted hover:border-text-muted"
              }`}
              id="theme-light"
            >
              <Sun size={16} /> Light
            </button>
          </div>
        </div>

        {/* ── Notifications ─────────────────────────────────────────────── */}
        <div className="card p-6">
          <h3 className="font-semibold text-text-secondary mb-4 flex items-center gap-2">
            <Bell size={15} /> Notifications
          </h3>
          <div className="space-y-4">
            {(
              [
                ["requestUpdates", "Rental request updates"],
                ["paymentReceipts", "Payment receipts"],
                ["newsletter", "Newsletter & promotions"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between text-sm text-text-primary cursor-pointer"
              >
                {label}
                <input
                  type="checkbox"
                  className="accent-violet-600 h-4 w-4"
                  checked={prefs[key]}
                  onChange={() => togglePref(key)}
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Account actions ─────────────────────────────────────────────── */}
      <div className="card p-6 mt-6">
        <h3 className="font-semibold text-text-secondary mb-4">Account</h3>
        <button
          onClick={handleLogout}
          className="btn-danger justify-center flex items-center gap-2"
          id="logout-settings-btn"
        >
          <LogOut size={15} /> Log Out
        </button>
        <p className="text-xs text-text-muted mt-3">
          Logged in as {user.email} ({user.role})
        </p>
      </div>
    </div>
  );
}
