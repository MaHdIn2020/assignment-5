"use client";
// Login page — email/password with demo one-click login + mock Google/Facebook.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState, Suspense } from "react";
import { LogIn, Eye, EyeOff, X } from "lucide-react";
import { GoogleIcon, FacebookIcon } from "@/components/SocialIcons";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@rentnest.com", password: "Admin@12345" },
  { role: "Landlord", email: "landlord@rentnest.com", password: "Landlord@12345" },
  { role: "Tenant", email: "tenant@rentnest.com", password: "Tenant@12345" },
];

function finishAuth(user: User, accessToken: string, refreshToken: string) {
  useAuthStore.getState().setAuth(user, accessToken, refreshToken);
}

function roleRedirect(user: User, redirect?: string | null) {
  if (redirect) return redirect;
  if (user.role === "ADMIN") return "/dashboard/admin";
  if (user.role === "LANDLORD") return "/dashboard/landlord";
  return "/dashboard/tenant";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [socialBusy, setSocialBusy] = useState<string | null>(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialProvider, setSocialProvider] = useState<"google" | "facebook">("google");
  const [socialName, setSocialName] = useState("");
  const [socialEmail, setSocialEmail] = useState("");

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(loginSchema) });

  async function login(values: FormData, redirect = searchParams.get("redirect")) {
    const { data } = await api.post<{
      success: boolean;
      data: { user: User; accessToken: string; refreshToken: string };
    }>("/api/auth/login", values);
    const { user, accessToken, refreshToken } = data.data;
    setAuth(user, accessToken, refreshToken);
    toast.success(`Welcome back, ${user.name}!`);
    router.push(roleRedirect(user, redirect));
  }

  async function onSubmit(values: FormData) {
    try {
      await login(values);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Invalid email or password.";
      toast.error(msg);
    }
  }

  // One-click demo login: fill the form (so it's visible) and submit
  async function demoLogin(demo: { email: string; password: string }) {
    setValue("email", demo.email, { shouldValidate: true });
    setValue("password", demo.password, { shouldValidate: true });
    try {
      await login({ email: demo.email, password: demo.password });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login failed.";
      toast.error(msg);
    }
  }

  function openSocial(provider: "google" | "facebook") {
    setSocialProvider(provider);
    setSocialName(provider === "google" ? "Google User" : "Facebook User");
    setSocialEmail(`${provider}-demo@rentnest.com`);
    setShowSocialModal(true);
  }

  async function submitSocial() {
    setSocialBusy(socialProvider);
    try {
      const { data } = await api.post<{
        success: boolean;
        data: { user: User; accessToken: string; refreshToken: string };
      }>("/api/auth/social", {
        provider: socialProvider,
        email: socialEmail || undefined,
        name: socialName || undefined,
        credential: `demo-${socialProvider}-token-123456`,
      });
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      finishAuth(user, accessToken, refreshToken);
      toast.success(`Signed in with ${socialProvider}!`);
      router.push(roleRedirect(user, searchParams.get("redirect")));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Social login failed.";
      toast.error(msg);
    } finally {
      setSocialBusy(null);
      setShowSocialModal(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <LogIn size={24} className="text-accent-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
          <p className="text-text-secondary text-sm mt-1">Sign in to your RentNest account</p>
        </div>

        <div className="card p-8">
          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              id="google-login-btn"
              onClick={() => openSocial("google")}
              disabled={!!socialBusy}
              className="btn-secondary justify-center text-sm"
            >
              {socialBusy === "google" ? (
                <span className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-slate-100 animate-spin" />
              ) : (
                <GoogleIcon size={16} />
              )}
              Google
            </button>
            <button
              id="facebook-login-btn"
              onClick={() => openSocial("facebook")}
              disabled={!!socialBusy}
              className="btn-secondary justify-center text-sm"
            >
              {socialBusy === "facebook" ? (
                <span className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-slate-100 animate-spin" />
              ) : (
                <FacebookIcon size={16} />
              )}
              Facebook
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-card-border" />
            <span className="text-xs text-text-muted">or sign in with email</span>
            <div className="h-px flex-1 bg-card-border" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                className={`form-input ${errors.email ? "error" : ""}`}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  className={`form-input pr-10 ${errors.password ? "error" : ""}`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary btn-lg w-full justify-center mt-1"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={17} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* One-click demo login */}
          <div className="mt-4 p-3 rounded-lg bg-surface-raised border border-card-border text-xs">
            <p className="font-medium text-text-secondary mb-2">One-click demo login:</p>
            <div className="flex flex-col gap-1.5">
              {DEMO_ACCOUNTS.map((d) => (
                <button
                  key={d.email}
                  onClick={() => demoLogin(d)}
                  className="text-left px-2 py-1.5 rounded-md hover:bg-hover-bg text-text-secondary transition-colors"
                >
                  <span className="font-semibold text-accent-primary">{d.role}:</span>{" "}
                  {d.email}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-text-muted mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-accent-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* ── Social login modal (mock OAuth handshake) ────────────────────── */}
      {showSocialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="card-elevated p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-text-primary">
                Continue with {socialProvider === "google" ? "Google" : "Facebook"}
              </h2>
              <button
                onClick={() => setShowSocialModal(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-text-muted mb-4">
              Demo mode — no real OAuth flow. Accounts are created as tenants when the
              email is new.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your name"
                className="form-input"
                value={socialName}
                onChange={(e) => setSocialName(e.target.value)}
                id="social-name"
              />
              <input
                type="email"
                placeholder="Your email"
                className="form-input"
                value={socialEmail}
                onChange={(e) => setSocialEmail(e.target.value)}
                id="social-email"
              />
              <button
                onClick={submitSocial}
                disabled={socialBusy === socialProvider}
                className="btn-primary w-full justify-center"
                id="social-submit-btn"
              >
                {socialBusy === socialProvider ? "Signing in…" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh]" />}>
      <LoginForm />
    </Suspense>
  );
}
