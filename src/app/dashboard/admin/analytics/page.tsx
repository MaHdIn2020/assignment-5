"use client";
// /dashboard/admin/analytics — visual analytics with Recharts.

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { AdminAnalytics, ApiResponse } from "@/types";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";

const CHART_COLORS = ["#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

async function fetchAnalytics(): Promise<AdminAnalytics> {
  const { data } = await api.get<ApiResponse<AdminAnalytics>>("/api/admin/analytics");
  return data.data;
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-text-secondary mb-4">{title}</h3>
      <div className="h-72">{children}</div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: fetchAnalytics,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "12px",
  };

  const pieLabel = (props: {
    name?: string | number;
    value?: string | number;
  }) => `${String(props.name)}: ${String(props.value)}`;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <BarChart3 className="text-accent-primary" size={24} />
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Platform <span className="gradient-text">Analytics</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Revenue, listings and user distribution
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue by month */}
        <ChartCard title="Revenue by Month (৳)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.revenueByMonth ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(139,92,246,0.1)" }} />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Users by role */}
        <ChartCard title="Users by Role">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data?.usersByRole ?? []}
                dataKey="count"
                nameKey="role"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={pieLabel}
              >
                {data?.usersByRole.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Properties by category */}
        <ChartCard title="Properties by Category">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.propertiesByCategory ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(139,92,246,0.1)" }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Properties by city */}
        <ChartCard title="Listings by City">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.propertiesByCity ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="city" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(139,92,246,0.1)" }} />
              <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Avg rent by city */}
        <ChartCard title="Average Rent by City (৳/mo)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.avgRentByCity ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="city" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(139,92,246,0.1)" }} />
              <Bar dataKey="avgRent" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Requests by status */}
        <ChartCard title="Rental Requests by Status">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data?.requestsByStatus ?? []}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={pieLabel}
              >
                {data?.requestsByStatus.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <div className="card p-5">
          <h3 className="font-semibold text-text-secondary mb-4">Recent Users</h3>
          <div className="space-y-3">
            {(data?.recentUsers ?? []).map((u) => (
              <div key={u.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-primary/30 flex items-center justify-center text-accent-primary text-xs font-bold">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-text-primary">{u.name}</p>
                    <p className="text-xs text-text-muted">{u.email}</p>
                  </div>
                </div>
                <span className="text-xs text-text-muted">{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-text-secondary mb-4">Recent Properties</h3>
          <div className="space-y-3">
            {(data?.recentProperties ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary">{p.title}</p>
                  <p className="text-xs text-text-muted">{p.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-accent-primary">
                    ৳{p.rentAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-text-muted">
                    {p.isAvailable ? "Available" : "Unavailable"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
