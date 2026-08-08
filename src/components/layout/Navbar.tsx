"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Home,
  Building2,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  Newspaper,
  Info,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  LANDLORD: "Landlord",
  TENANT: "Tenant",
};

export function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleLogout() {
    clearAuth();
    toast.success("Logged out successfully");
    router.push("/");
    setMobileOpen(false);
    setMenuOpen(false);
  }

  const dashboardPath =
    user?.role === "ADMIN"
      ? "/dashboard/admin"
      : user?.role === "LANDLORD"
      ? "/dashboard/landlord"
      : "/dashboard/tenant";

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/properties", label: "Properties", icon: Building2 },
    { href: "/about", label: "About", icon: Info },
    { href: "/blog", label: "Blog", icon: Newspaper },
    ...(user
      ? [{ href: dashboardPath, label: "Dashboard", icon: LayoutDashboard }]
      : []),
  ];

  const profileLinks = [
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-card-border backdrop-blur-md bg-surface/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Home size={22} className="text-accent-primary" />
            <span className="gradient-text">RentNest</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  pathname === href || pathname.startsWith(href + "/")
                    ? "text-accent-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth area */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-card-border bg-card-default px-2 py-1.5 pr-3 hover:border-card-border-hover transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm text-text-primary font-medium max-w-[7rem] truncate hidden md:block">
                    {user.name}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-accent-primary/15 text-accent-primary hidden xl:inline">
                    {roleLabel[user.role] || user.role}
                  </span>
                  <ChevronDown size={14} className="text-text-secondary" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-card-border bg-surface-raised shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-card-border">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {user.email}
                      </p>
                    </div>
                    {profileLinks.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-hover-bg hover:text-text-primary transition-colors"
                      >
                        <Icon size={15} />
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-card-border">
                      <Link
                        href={dashboardPath}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-hover-bg hover:text-text-primary transition-colors"
                      >
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={15} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
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

          {/* Mobile controls */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              className="text-text-secondary hover:text-text-primary"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-card-border bg-surface px-4 py-4 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 text-sm font-medium py-2 ${
                pathname === href ? "text-accent-primary" : "text-text-secondary"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          {user && (
            <>
              {profileLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium py-2 text-text-secondary"
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </>
          )}
          <div className="pt-2 border-t border-card-border space-y-2">
            {user ? (
              <>
                <div className="text-sm text-text-secondary">
                  Signed in as{" "}
                  <span className="text-text-primary font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary btn-sm w-full justify-center"
                >
                  <LogOut size={14} /> Logout
                </button>
              </>
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
