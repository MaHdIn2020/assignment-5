"use client";
// Admin Dashboard — platform stats + full user table with ban/unban + pagination + search.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse, User, AdminStats } from "@/types";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  Users, Building2, FileText, CreditCard,
  BanknoteIcon, Search, ShieldOff, ShieldCheck,
} from "lucide-react";

// ── Data fetchers ─────────────────────────────────────────────────────────────
async function fetchStats(): Promise<AdminStats> {
  const { data } = await api.get<ApiResponse<AdminStats>>("/api/admin/stats");
  return data.data;
}

async function fetchUsers(params: URLSearchParams): Promise<{ users: User[]; meta: { page: number; limit: number; total: number } }> {
  const { data } = await api.get<{ data: User[]; meta: { page: number; limit: number; total: number } }>(
    `/api/users?${params.toString()}`
  );
  return { users: data.data, meta: data.meta! };
}

function AdminContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState(searchParams.get("name") ?? "");

  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: fetchStats,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers", searchParams.toString()],
    queryFn: () => fetchUsers(searchParams),
  });

  const users = usersData?.users ?? [];
  const meta = usersData?.meta;

  // Ban / unban mutation with optimistic update
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/api/users/${id}/status`, { isActive }),

    onMutate: async ({ id, isActive }) => {
      await qc.cancelQueries({ queryKey: ["adminUsers"] });
      const prev = qc.getQueryData(["adminUsers", searchParams.toString()]);
      qc.setQueryData(
        ["adminUsers", searchParams.toString()],
        (old: typeof usersData) => ({
          ...old!,
          users: old!.users.map((u) =>
            u.id === id ? { ...u, isActive } : u
          ),
        })
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(["adminUsers", searchParams.toString()], ctx?.prev);
      toast.error("Failed to update user status.");
    },
    onSuccess: (_data, { isActive }) => {
      toast.success(isActive ? "User activated." : "User banned.");
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const statCards = [
    { label: "Total Users", val: stats?.totalUsers ?? "—", icon: Users, color: "text-violet-400" },
    { label: "Properties", val: stats?.totalProperties ?? "—", icon: Building2, color: "text-blue-400" },
    { label: "Requests", val: stats?.totalRentalRequests ?? "—", icon: FileText, color: "text-yellow-400" },
    { label: "Payments", val: stats?.totalPayments ?? "—", icon: CreditCard, color: "text-emerald-400" },
    { label: "Revenue (৳)", val: stats?.totalRevenue ? `৳${Number(stats.totalRevenue).toLocaleString()}` : "—", icon: BanknoteIcon, color: "text-pink-400" },
    { label: "Active Listings", val: stats?.activeListings ?? "—", icon: Building2, color: "text-cyan-400" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Platform-wide overview and user management</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="card p-4 text-center">
            <Icon size={20} className={`${color} mx-auto mb-1`} />
            <p className="text-xl font-bold text-slate-100">{val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* User management */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-200">User Management</h2>
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setParam("name", search)}
              className="form-input pl-8 text-sm w-64"
              id="user-search"
            />
          </div>
        </div>

        {usersLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Joined</th>
                    <th className="text-left p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-300 text-xs font-bold shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-200">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-400">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            u.role === "ADMIN"
                              ? "bg-violet-500/20 text-violet-300"
                              : u.role === "LANDLORD"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.isActive ? (
                          <span className="badge badge-active">Active</span>
                        ) : (
                          <span className="badge badge-rejected">Banned</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: u.id,
                                isActive: !u.isActive,
                              })
                            }
                            disabled={toggleStatusMutation.isPending}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                              u.isActive
                                ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                            id={`toggle-user-${u.id}`}
                          >
                            {u.isActive ? (
                              <><ShieldOff size={12} /> Ban</>
                            ) : (
                              <><ShieldCheck size={12} /> Unban</>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.total > meta.limit && (
              <div className="flex justify-center gap-2 p-4 border-t border-slate-800">
                {Array.from({ length: Math.ceil(meta.total / meta.limit) }).map(
                  (_, i) => {
                    const page = i + 1;
                    const current = Number(searchParams.get("page") ?? 1);
                    return (
                      <button
                        key={page}
                        onClick={() => setParam("page", String(page))}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === current
                            ? "bg-violet-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <Users size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AdminContent />
    </Suspense>
  );
}
