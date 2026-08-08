"use client";
// /dashboard/admin — platform overview stats + content moderation
// (all listings, all rental requests). User management lives on /users.

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type {
  ApiResponse,
  Property,
  RentalRequest,
  AdminStats,
} from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable, type Column } from "@/components/DataTable";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Users, Building2, FileText, CreditCard,
  BanknoteIcon, Home as HomeIcon, ClipboardList, ExternalLink,
} from "lucide-react";

// ── Data fetchers ─────────────────────────────────────────────────────────────
async function fetchStats(): Promise<AdminStats> {
  const { data } = await api.get<ApiResponse<AdminStats>>("/api/admin/stats");
  return data.data;
}

async function fetchAllProperties(
  page: number
): Promise<{ properties: Property[]; total: number }> {
  const { data } = await api.get<{
    data: Property[];
    meta: { page: number; limit: number; total: number };
  }>(`/api/properties?page=${page}&limit=8`);
  return { properties: data.data, total: data.meta!.total };
}

async function fetchAllRequests(
  page: number
): Promise<{ requests: RentalRequest[]; total: number }> {
  const { data } = await api.get<{
    data: RentalRequest[];
    meta: { page: number; limit: number; total: number };
  }>(`/api/rental-requests?page=${page}&limit=8`);
  return { requests: data.data, total: data.meta!.total };
}

function AdminContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = searchParams.get("tab") ?? "properties";
  const page = Number(searchParams.get("page") ?? 1);

  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: fetchStats,
  });

  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ["adminProperties", activeTab, page],
    queryFn: () => fetchAllProperties(page),
    enabled: activeTab === "properties",
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["adminRequests", activeTab, page],
    queryFn: () => fetchAllRequests(page),
    enabled: activeTab === "requests",
  });

  function switchTab(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  const statCards = [
    { label: "Total Users", val: stats?.overview.totalUsers ?? "—", icon: Users, color: "text-violet-400" },
    { label: "Properties", val: stats?.overview.totalProperties ?? "—", icon: Building2, color: "text-blue-400" },
    { label: "Requests", val: stats?.overview.totalRentalRequests ?? "—", icon: FileText, color: "text-yellow-400" },
    { label: "Payments", val: stats?.overview.totalPayments ?? "—", icon: CreditCard, color: "text-emerald-400" },
    { label: "Revenue (৳)", val: stats?.overview.totalRevenue ? `৳${Number(stats.overview.totalRevenue).toLocaleString()}` : "—", icon: BanknoteIcon, color: "text-pink-400" },
    { label: "Active Listings", val: stats?.overview.availableProperties ?? "—", icon: Building2, color: "text-cyan-400" },
  ];

  const propertyColumns: Column<Property>[] = [
    {
      key: "title",
      header: "Title",
      render: (p) => (
        <div>
          <p className="text-sm font-medium text-text-primary">{p.title}</p>
          <p className="text-xs text-text-muted line-clamp-1">{p.location}</p>
        </div>
      ),
    },
    {
      key: "landlord",
      header: "Landlord",
      render: (p) => (
        <span className="text-sm text-text-secondary">{p.landlord?.name ?? "—"}</span>
      ),
    },
    {
      key: "city",
      header: "City",
      render: (p) => <span className="text-sm text-text-secondary">{p.city}</span>,
    },
    {
      key: "rent",
      header: "Rent",
      render: (p) => (
        <span className="text-sm font-medium text-accent-primary">
          ৳{p.rentAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) =>
        p.isAvailable ? (
          <span className="badge badge-active">Available</span>
        ) : (
          <span className="badge badge-rejected">Unavailable</span>
        ),
    },
    {
      key: "action",
      header: "Action",
      render: (p) => (
        <Link
          href={`/properties/${p.id}`}
          className="flex items-center gap-1.5 text-xs text-accent-primary hover:underline transition-colors"
          id={`view-property-${p.id}`}
        >
          <ExternalLink size={12} /> View
        </Link>
      ),
    },
  ];

  const requestColumns: Column<RentalRequest>[] = [
    {
      key: "tenant",
      header: "Tenant",
      render: (req) => (
        <div>
          <p className="text-sm font-medium text-text-primary">
            {req.tenant?.name ?? "—"}
          </p>
          <p className="text-xs text-text-muted">{req.tenant?.email}</p>
        </div>
      ),
    },
    {
      key: "property",
      header: "Property",
      render: (req) => (
        <div>
          <p className="text-sm text-text-primary">{req.property?.title ?? "—"}</p>
          <p className="text-xs text-text-muted">{req.property?.city}</p>
        </div>
      ),
    },
    {
      key: "landlord",
      header: "Landlord",
      render: (req) => (
        <span className="text-sm text-text-secondary">
          {req.property?.landlord?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "movein",
      header: "Move-in",
      render: (req) => (
        <span className="text-sm text-text-secondary">
          {new Date(req.moveInDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "request",
      header: "Request",
      render: (req) => <StatusBadge status={req.status} />,
    },
    {
      key: "payment",
      header: "Payment",
      render: (req) =>
        req.payment ? (
          <StatusBadge status={req.payment.status} />
        ) : (
          <span className="text-xs text-text-muted">—</span>
        ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Platform-wide overview and content moderation
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="card p-4 text-center">
            <Icon size={20} className={`${color} mx-auto mb-1`} />
            <p className="text-xl font-bold text-text-primary">{val}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Users shortcut card */}
      <Link
        href="/dashboard/admin/users"
        className="card-interactive p-4 mb-6 flex items-center gap-3"
        id="manage-users-link"
      >
        <Users size={20} className="text-accent-primary" />
        <div>
          <p className="font-semibold text-text-primary text-sm">Manage Users</p>
          <p className="text-xs text-text-muted">Search, ban and unban accounts</p>
        </div>
      </Link>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-raised rounded-xl mb-6 w-fit">
        {[
          { key: "properties", label: "All Listings", icon: HomeIcon },
          { key: "requests", label: "Rental Requests", icon: ClipboardList },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? "bg-accent-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
            id={`admin-tab-${key}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── All Listings tab ─────────────────────────────────────────────── */}
      {activeTab === "properties" && (
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-card-border flex items-center justify-between">
            <h2 className="font-semibold text-text-secondary">All Listings</h2>
            <span className="text-xs text-text-muted">
              {listingsData?.total ?? 0} properties platform-wide
            </span>
          </div>
          <DataTable
            columns={propertyColumns}
            data={listingsData?.properties ?? []}
            keyField="id"
            loading={listingsLoading}
            empty={
              <div className="p-12 text-center">
                <HomeIcon size={36} className="text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary">No properties listed yet.</p>
              </div>
            }
            page={page}
            totalPages={Math.ceil((listingsData?.total ?? 0) / 8)}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* ── Rental Requests tab ──────────────────────────────────────────── */}
      {activeTab === "requests" && (
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-card-border flex items-center justify-between">
            <h2 className="font-semibold text-text-secondary">All Rental Requests</h2>
            <span className="text-xs text-text-muted">
              {requestsData?.total ?? 0} requests platform-wide
            </span>
          </div>
          <DataTable
            columns={requestColumns}
            data={requestsData?.requests ?? []}
            keyField="id"
            loading={requestsLoading}
            empty={
              <div className="p-12 text-center">
                <ClipboardList size={36} className="text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary">No rental requests yet.</p>
              </div>
            }
            page={page}
            totalPages={Math.ceil((requestsData?.total ?? 0) / 8)}
            onPageChange={setPage}
          />
        </div>
      )}
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
