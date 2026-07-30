"use client";
// Register page — role selection (TENANT | LANDLORD) + Zod-validated form.
// Note: ADMIN role cannot be self-registered; it must be seeded in the DB.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState } from "react";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import type { Metadata } from "next";

// ── Zod schema mirrors backend auth.validation.ts ────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one digit"),
  role: z.enum(["TENANT", "LANDLORD"] as const),
});

type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "TENANT" },
  });

  const selectedRole = watch("role");

  async function onSubmit(values: FormData) {
    try {
      await api.post("/api/auth/register", values);
      toast.success("Account created! Please log in.");
      router.push("/auth/login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed. Try again.";
      toast.error(msg);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-violet-600/20 flex items-center justify-center">
            <UserPlus size={24} className="text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">
            Join RentNest as a Tenant or Landlord
          </p>
        </div>

        <div className="card p-8">
          {/* ── Role Selector ─────────────────────────────────────────────── */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
              I am a…
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["TENANT", "LANDLORD"] as const).map((role) => (
                <label
                  key={role}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedRole === role
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    value={role}
                    className="sr-only"
                    {...register("role")}
                  />
                  <span className="text-xl">{role === "TENANT" ? "🔑" : "🏘️"}</span>
                  <span className="text-sm font-medium text-slate-200">
                    {role === "TENANT" ? "Tenant" : "Landlord"}
                  </span>
                  <span className="text-xs text-slate-500 text-center">
                    {role === "TENANT"
                      ? "Browse & rent properties"
                      : "List & manage properties"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Form Fields ───────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Rahman"
                className={`form-input ${errors.name ? "error" : ""}`}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email Address *
              </label>
              <input
                id="email"
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
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Phone (optional)
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="017XXXXXXXX"
                className="form-input"
                {...register("phone")}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 chars, 1 uppercase, 1 digit"
                  className={`form-input pr-10 ${errors.password ? "error" : ""}`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3 mt-2"
              id="register-submit-btn"
            >
              <UserPlus size={17} />
              {isSubmitting ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-violet-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
