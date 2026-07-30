"use client";
// Landlord Requests page — incoming rental requests with optimistic approve/reject.
//
// OPTIMISTIC UPDATE PATTERN:
// When the landlord clicks Approve/Reject, we immediately update the UI to show
// the new status (optimistic) before the API responds. If the API fails, we
// rollback to the previous state. This makes the UI feel instant.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse, RentalRequest } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

async function fetchIncomingRequests(): Promise<RentalRequest[]> {
  const { data } = await api.get<ApiResponse<RentalRequest[]>>(
    "/api/rental-requests/incoming"
  );
  return data.data;
}

export default function LandlordRequestsPage() {
  const qc = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["incomingRequests"],
    queryFn: fetchIncomingRequests,
  });

  // Optimistic update: patch status immediately, rollback on error
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => api.patch(`/api/rental-requests/${id}/status`, { status }),

    // Called before the mutation fires — snapshots current data
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["incomingRequests"] });
      const previous = qc.getQueryData<RentalRequest[]>(["incomingRequests"]);

      // Apply optimistic update
      qc.setQueryData<RentalRequest[]>(["incomingRequests"], (old) =>
        old?.map((r) => (r.id === id ? { ...r, status } : r)) ?? []
      );

      return { previous }; // returned as `context` in onError
    },

    onError: (_err, _vars, context) => {
      // Rollback
      if (context?.previous) {
        qc.setQueryData(["incomingRequests"], context.previous);
      }
      toast.error("Failed to update status. Please try again.");
    },

    onSuccess: (_data, { status }) => {
      toast.success(`Request ${status.toLowerCase()}.`);
      // Refetch to sync with server after optimistic update
      qc.invalidateQueries({ queryKey: ["incomingRequests"] });
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <Link
          href="/dashboard/landlord"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-violet-400 transition-colors mb-4"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">
          Incoming <span className="gradient-text">Requests</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Review and approve tenant rental requests
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  <th className="text-left p-4">Tenant</th>
                  <th className="text-left p-4">Property</th>
                  <th className="text-left p-4">Move-in</th>
                  <th className="text-left p-4">Message</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="p-4">
                      <p className="text-sm font-medium text-slate-200">
                        {req.tenant?.name ?? "—"}
                      </p>
                      <p className="text-xs text-slate-500">{req.tenant?.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-300">
                        {req.property?.title ?? "—"}
                      </p>
                      <p className="text-xs text-slate-500">{req.property?.city}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {new Date(req.moveInDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {req.message ?? "—"}
                      </p>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="p-4">
                      {req.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              statusMutation.mutate({
                                id: req.id,
                                status: "APPROVED",
                              })
                            }
                            disabled={statusMutation.isPending}
                            className="flex items-center gap-1 text-xs text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg transition-colors"
                            id={`approve-${req.id}`}
                          >
                            <CheckCircle2 size={12} /> Approve
                          </button>
                          <button
                            onClick={() =>
                              statusMutation.mutate({
                                id: req.id,
                                status: "REJECTED",
                              })
                            }
                            disabled={statusMutation.isPending}
                            className="flex items-center gap-1 text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-colors"
                            id={`reject-${req.id}`}
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      )}
                      {req.status !== "PENDING" && (
                        <span className="text-xs text-slate-600">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-slate-400">No incoming requests yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
