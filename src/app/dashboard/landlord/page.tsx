"use client";
// Landlord Dashboard — overview stats + my property listings.

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse, Property } from "@/types";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { Plus, Pencil, Building2, Users, BanknoteIcon, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchMyListings(): Promise<Property[]> {
  const { data } = await api.get<ApiResponse<Property[]>>(
    "/api/properties/my-listings"
  );
  return data.data;
}

export default function LandlordDashboard() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: listings, isLoading } = useQuery({
    queryKey: ["myListings"],
    queryFn: fetchMyListings,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/properties/${id}`),
    onSuccess: () => {
      toast.success("Property deleted.");
      qc.invalidateQueries({ queryKey: ["myListings"] });
    },
    onError: () => toast.error("Failed to delete property."),
  });

  const totalListings = listings?.length ?? 0;
  const availableListings = listings?.filter((p) => p.isAvailable).length ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Landlord Dashboard —{" "}
            <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your properties and rental requests
          </p>
        </div>
        <Link
          href="/dashboard/landlord/properties/new"
          className="btn-gradient text-sm"
          id="add-property-btn"
        >
          <Plus size={16} /> Add Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Listings", val: totalListings, icon: Building2, color: "text-violet-400" },
          { label: "Available", val: availableListings, icon: Eye, color: "text-emerald-400" },
          { label: "Requests", val: "—", icon: Users, color: "text-blue-400" },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3">
            <Icon size={22} className={color} />
            <div>
              <p className="text-lg font-bold text-slate-100">{val}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/dashboard/landlord/requests"
          className="glass-card p-5 hover:border-violet-500/40 transition-all"
          id="view-requests-link"
        >
          <Users size={22} className="text-blue-400 mb-2" />
          <p className="font-semibold text-slate-100">Incoming Requests</p>
          <p className="text-sm text-slate-400 mt-1">
            Review and approve tenant rental requests
          </p>
        </Link>
        <Link
          href="/dashboard/landlord/properties/new"
          className="glass-card p-5 hover:border-violet-500/40 transition-all"
        >
          <Plus size={22} className="text-violet-400 mb-2" />
          <p className="font-semibold text-slate-100">Add New Property</p>
          <p className="text-sm text-slate-400 mt-1">
            List a new property for tenants to discover
          </p>
        </Link>
      </div>

      {/* Properties table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-slate-200">My Listings</h2>
          <span className="text-xs text-slate-500">{totalListings} properties</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  <th className="text-left p-4">Title</th>
                  <th className="text-left p-4">City</th>
                  <th className="text-left p-4">Rent</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4 text-sm font-medium text-slate-200">
                      {p.title}
                    </td>
                    <td className="p-4 text-sm text-slate-400">{p.city}</td>
                    <td className="p-4 text-sm text-violet-400">
                      ৳{p.rentAmount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      {p.isAvailable ? (
                        <span className="badge badge-active">Available</span>
                      ) : (
                        <span className="badge badge-rejected">Unavailable</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/landlord/properties/${p.id}/edit`}
                          className="btn-outline text-xs py-1.5 px-3"
                          id={`edit-property-${p.id}`}
                        >
                          <Pencil size={11} /> Edit
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm("Delete this property?")) {
                              deleteMutation.mutate(p.id);
                            }
                          }}
                          className="text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                          id={`delete-property-${p.id}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-3xl mb-3">🏘️</p>
            <p className="text-slate-400">No properties listed yet.</p>
            <Link
              href="/dashboard/landlord/properties/new"
              className="btn-gradient mt-4 inline-flex text-sm"
            >
              <Plus size={15} /> Add Your First Property
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
