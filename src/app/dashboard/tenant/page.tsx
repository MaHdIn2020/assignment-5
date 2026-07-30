"use client";
// Tenant Dashboard — rental request history with status badges,
// payment history, and a Review modal for active/completed rentals.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse, RentalRequest, Payment } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import {
  Home, CreditCard, Star, X, Clock,
  CheckCircle2, BanknoteIcon, FileText,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

// ── Review schema ─────────────────────────────────────────────────────────────
const reviewSchema = z.object({
  rating: z.number().int().min(1, "Rating is required").max(5),
  comment: z.string().max(1000).optional(),
});
type ReviewForm = z.infer<typeof reviewSchema>;

async function fetchMyRequests(): Promise<RentalRequest[]> {
  const { data } = await api.get<ApiResponse<RentalRequest[]>>(
    "/api/rental-requests/my-requests"
  );
  return data.data;
}

async function fetchMyPayments(): Promise<Payment[]> {
  const { data } = await api.get<ApiResponse<Payment[]>>(
    "/api/payments/my-payments"
  );
  return data.data;
}

export default function TenantDashboard() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"requests" | "payments">(
    "requests"
  );
  const [reviewTarget, setReviewTarget] = useState<{
    requestId: string;
    propertyId: string;
    propertyTitle: string;
  } | null>(null);
  const [hoverRating, setHoverRating] = useState(0);

  const { data: requests, isLoading: reqLoading } = useQuery({
    queryKey: ["myRequests"],
    queryFn: fetchMyRequests,
  });

  const { data: payments, isLoading: payLoading } = useQuery({
    queryKey: ["myPayments"],
    queryFn: fetchMyPayments,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewForm>({ resolver: zodResolver(reviewSchema) });

  const ratingValue = watch("rating");

  const reviewMutation = useMutation({
    mutationFn: (vals: ReviewForm & { propertyId: string }) =>
      api.post("/api/reviews", vals),
    onSuccess: () => {
      toast.success("Review submitted! Thank you.");
      setReviewTarget(null);
      reset();
      qc.invalidateQueries({ queryKey: ["myRequests"] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to submit review.";
      toast.error(msg);
    },
  });

  function submitReview(vals: ReviewForm) {
    if (!reviewTarget) return;
    reviewMutation.mutate({ ...vals, propertyId: reviewTarget.propertyId });
  }

  // Stats
  const total = requests?.length ?? 0;
  const pending = requests?.filter((r) => r.status === "PENDING").length ?? 0;
  const approved = requests?.filter((r) => r.status === "APPROVED").length ?? 0;
  const totalPaid = payments?.reduce((s, p) => s + (p.status === "SUCCEEDED" ? p.amount : 0), 0) ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">
            Welcome, <span className="gradient-text">{user?.name}</span>
          </h1>
        <p className="text-slate-400 text-sm mt-1">Manage your rental requests and payments</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Requests", val: total, icon: Home, color: "text-violet-400" },
          { label: "Pending", val: pending, icon: Clock, color: "text-yellow-400" },
          { label: "Approved", val: approved, icon: CheckCircle2, color: "text-blue-400" },
          { label: "Total Paid", val: `৳${totalPaid.toLocaleString()}`, icon: BanknoteIcon, color: "text-emerald-400" },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <Icon size={22} className={color} />
            <div>
              <p className="text-lg font-bold text-slate-100">{val}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-900 rounded-xl mb-6 w-fit">
        {(["requests", "payments"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            id={`tab-${tab}`}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab === "requests" ? "My Requests" : "My Payments"}
          </button>
        ))}
      </div>

      {/* ── Requests Tab ─────────────────────────────────────────────────── */}
      {activeTab === "requests" && (
        <div className="card overflow-hidden">
          {reqLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : requests && requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="text-left p-4">Property</th>
                    <th className="text-left p-4">Move-in</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Rent</th>
                    <th className="text-left p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <Link
                          href={`/properties/${req.propertyId}`}
                          className="text-sm font-medium text-slate-200 hover:text-violet-400 transition-colors"
                        >
                          {req.property?.title ?? "Property"}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {req.property?.city}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {new Date(req.moveInDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        ৳{req.property?.rentAmount?.toLocaleString()}
                      </td>
                      <td className="p-4">
                        {req.status === "APPROVED" &&
                          req.payment?.status !== "SUCCEEDED" && (
                            <Link
                              href={`/dashboard/tenant/pay/${req.id}`}
              className="btn-primary btn-sm"
              id={`pay-btn-${req.id}`}
                            >
                              <CreditCard size={12} /> Pay Now
                            </Link>
                          )}
                        {req.payment?.status === "SUCCEEDED" && (
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() =>
                              setReviewTarget({
                                requestId: req.id,
                                propertyId: req.propertyId,
                                propertyTitle: req.property?.title ?? "Property",
                              })
                            }
                            id={`review-btn-${req.id}`}
                          >
                            <Star size={12} /> Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText size={36} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">No rental requests yet.</p>
              <Link
                href="/properties"
                className="btn-primary mt-4 inline-flex btn-sm"
              >
                Browse Properties
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Payments Tab ─────────────────────────────────────────────────── */}
      {activeTab === "payments" && (
        <div className="card overflow-hidden">
          {payLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : payments && payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="text-left p-4">Property</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((pay) => (
                    <tr
                      key={pay.id}
                      className="border-b border-slate-800/60 hover:bg-slate-800/30"
                    >
                      <td className="p-4 text-sm text-slate-200">
                        {pay.rentalRequest?.property?.title ?? "—"}
                      </td>
                      <td className="p-4 text-sm font-medium text-violet-400">
                        ৳{pay.amount.toLocaleString()} {pay.currency.toUpperCase()}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={pay.status} />
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {new Date(pay.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <CreditCard size={36} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">No payments yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Review Modal ─────────────────────────────────────────────────── */}
      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="card-elevated p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-100">Leave a Review</h2>
              <button
                onClick={() => { setReviewTarget(null); reset(); }}
                className="text-slate-400 hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Reviewing: <span className="text-slate-200">{reviewTarget.propertyTitle}</span>
            </p>

            <form onSubmit={handleSubmit(submitReview)} noValidate className="space-y-4">
              {/* Star rating */}
              <div>
                <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">
                  Rating *
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setValue("rating", n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      id={`star-${n}`}
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${
                          n <= (hoverRating || ratingValue || 0)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register("rating", { valueAsNumber: true })} />
                {errors.rating && (
                  <p className="text-red-400 text-xs mt-1">{errors.rating.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
                  Comment (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share your experience…"
                  className="form-input resize-none"
                  {...register("comment")}
                />
              </div>

              <button
                type="submit"
                disabled={reviewMutation.isPending}
                className="btn-primary w-full justify-center"
                id="submit-review-btn"
              >
                {reviewMutation.isPending ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
