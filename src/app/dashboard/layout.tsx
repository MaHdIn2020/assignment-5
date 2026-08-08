"use client";
// Dashboard layout — role-aware sidebar + auth guard. Wraps all /dashboard/* pages.

import { useAuthStore } from "@/store/authStore";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import {
  LayoutDashboard, Building2, ClipboardList, BarChart3,
  FileText, MessageSquare, Users, UserCircle, Settings, Home,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV: Record<string, NavItem[]> = {
  ADMIN: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/admin/users", label: "User Management", icon: Users },
    { href: "/dashboard/admin/blog", label: "Blog Posts", icon: FileText },
    { href: "/dashboard/admin/messages", label: "Contact Messages", icon: MessageSquare },
  ],
  LANDLORD: [
    { href: "/dashboard/landlord", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/landlord/requests", label: "Rental Requests", icon: ClipboardList },
    { href: "/dashboard/landlord/properties/new", label: "Add Property", icon: Building2 },
  ],
  TENANT: [
    { href: "/dashboard/tenant", label: "Overview", icon: LayoutDashboard },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, hydrated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // Redirect logged-out users to login (preserve where they wanted to go)
  useEffect(() => {
    if (hydrated && !user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, user, pathname, router]);

  // Not yet hydrated → brief loading state
  if (!hydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-400/30 border-t-violet-400 animate-spin" />
      </div>
    );
  }

  // Logged out after hydration — will redirect via the effect above
  if (!user) return null;

  const items = NAV[user.role] ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="md:w-60 shrink-0">
          <div className="card p-4 md:sticky md:top-20 space-y-1">
            <div className="px-3 pb-3 mb-2 border-b border-card-border">
              <p className="font-semibold text-text-primary text-sm truncate">
                {user.name}
              </p>
              <p className="text-xs text-text-muted">
                {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
              </p>
            </div>

            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-hover-bg transition-colors"
            >
              <Home size={16} /> Browse Site
            </Link>

            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-accent-primary text-white font-medium"
                      : "text-text-secondary hover:bg-hover-bg"
                  }`}
                >
                  <Icon size={16} /> {item.label}
                </Link>
              );
            })}

            <div className="pt-3 mt-2 border-t border-card-border space-y-1">
              <Link
                href="/dashboard/profile"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === "/dashboard/profile"
                    ? "bg-accent-primary text-white font-medium"
                    : "text-text-secondary hover:bg-hover-bg"
                }`}
              >
                <UserCircle size={16} /> Profile
              </Link>
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === "/dashboard/settings"
                    ? "bg-accent-primary text-white font-medium"
                    : "text-text-secondary hover:bg-hover-bg"
                }`}
              >
                <Settings size={16} /> Settings
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
