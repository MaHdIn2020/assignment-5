"use client";
// /dashboard/admin/users — user management (search, ban/unban).

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { User } from "@/types";
import { DataTable, type Column } from "@/components/DataTable";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { Users, Search, ShieldOff, ShieldCheck } from "lucide-react";

async function fetchUsers(
  params: URLSearchParams
): Promise<{ users: User[]; total: number }> {
  const { data } = await api.get<{
    data: User[];
    meta: { page: number; limit: number; total: number };
  }>(`/api/users?${params.toString()}`);
  return { users: data.data, total: data.meta!.total };
}

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState(searchParams.get("name") ?? "");
  const page = Number(searchParams.get("page") ?? 1);

  const { data, isLoading } = useQuery({
    queryKey: ["adminUsers", searchParams.toString()],
    queryFn: () => fetchUsers(searchParams),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/api/users/${id}/status`, { isActive }),
    onSuccess: () => {
      toast.success("User status updated.");
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: () => toast.error("Failed to update user status."),
  });

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      render: (u) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent-primary/30 flex items-center justify-center text-accent-primary text-xs font-bold shrink-0">
            {u.name.charAt(0)}
          </div>
          <span className="text-sm font-medium text-text-primary">{u.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (u) => <span className="text-sm text-text-secondary">{u.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            u.role === "ADMIN"
              ? "bg-violet-500/20 text-violet-300"
              : u.role === "LANDLORD"
              ? "bg-blue-500/20 text-blue-300"
              : "bg-surface-raised text-text-secondary"
          }`}
        >
          {u.role}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) =>
        u.isActive ? (
          <span className="badge badge-active">Active</span>
        ) : (
          <span className="badge badge-rejected">Banned</span>
        ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (u) => (
        <span className="text-sm text-text-muted">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (u) =>
        u.role !== "ADMIN" && (
          <button
            onClick={() =>
              toggleStatusMutation.mutate({ id: u.id, isActive: !u.isActive })
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
              <>
                <ShieldOff size={12} /> Ban
              </>
            ) : (
              <>
                <ShieldCheck size={12} /> Unban
              </>
            )}
          </button>
        ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          User <span className="gradient-text">Management</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Search, ban and unban platform users
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-semibold text-text-secondary">
            {data?.total ?? 0} users
          </h2>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
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

        <DataTable
          columns={columns}
          data={data?.users ?? []}
          keyField="id"
          loading={isLoading}
          empty={
            <div className="p-12 text-center">
              <Users size={36} className="text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No users found.</p>
            </div>
          }
          page={page}
          totalPages={Math.ceil((data?.total ?? 0) / 10)}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AdminUsersContent />
    </Suspense>
  );
}
