"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Home, Building2, LayoutDashboard, LogIn, UserPlus, LogOut, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

export function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    clearAuth();
    toast.success("Logged out successfully");
    router.push("/");
    setMobileOpen(false);
  }

  // Map role → correct dashboard path
  const dashboardPath =
    user?.role === "ADMIN"
      ? "/dashboard/admin"
      : user?.role === "LANDLORD"
      ? "/dashboard/landlord"
      : "/dashboard/tenant";

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/properties", label: "Properties", icon: Building2 },
    ...(user
      ? [{ href: dashboardPath, label: "Dashboard", icon: LayoutDashboard }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 backdrop-blur-md bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Home size={22} className="text-violet-400" />
            <span className="gradient-text">RentNest</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  pathname === href || pathname.startsWith(href + "/")
                    ? "text-violet-400"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">
                  {user.name}{" "}
                  <span className="text-xs px-1.5 py-0.5 rounded bg-violet-900/40 text-violet-300 ml-1">
                    {user.role}
                  </span>
                </span>
                <button onClick={handleLogout} className="btn-secondary btn-sm">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary btn-sm">
                  <LogIn size={14} /> Login
                </Link>
                <Link href="/auth/register" className="btn-primary btn-sm">
                  <UserPlus size={14} /> Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-400 hover:text-slate-100"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-3">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 text-sm font-medium py-2 ${
                pathname === href ? "text-violet-400" : "text-slate-300"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            {user ? (
              <button onClick={handleLogout} className="btn-secondary btn-sm w-full justify-center">
                <LogOut size={14} /> Logout
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary btn-sm w-full justify-center block text-center"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary btn-sm w-full justify-center block text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
