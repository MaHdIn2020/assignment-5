"use client";
// /properties/[id] — property detail with gallery, rating summary, landlord info,
// reviews, related properties, and a "Request to Rent" modal (TENANT only).

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse, Property, RentalRequest } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  MapPin, Bed, Bath, BanknoteIcon, Star, Phone, Mail, Ruler,
  Calendar, MessageSquare, CheckCircle, X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { PropertyCard } from "@/components/PropertyCard";
import Link from "next/link";

// ── Request to Rent schema (mirrors backend rentalRequest.validation.ts) ─────
const requestSchema = z.object({
  moveInDate: z.string().min(1, "Move-in date is required"),
  message: z.string().optional(),
});
type RequestForm = z.infer<typeof requestSchema>;

async function fetchProperty(id: string) {
  try {
    const { data } = await api.get<ApiResponse<Property>>(`/api/properties/${id}`);
    return data.data;
  } catch {
    return null;
  }
}

// Reusable 5-star row
function StarRow({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < value ? "text-yellow-400 fill-yellow-400" : "text-text-muted"}
        />
      ))}
    </div>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchProperty(id),
  });

  // Related properties: same category, exclude current
  const relatedCategoryId = property?.category?.id;
  const { data: relatedData } = useQuery({
    queryKey: ["related-properties", relatedCategoryId, id],
    enabled: !!relatedCategoryId,
    queryFn: () =>
      api
        .get<ApiResponse<Property[]>>(
          `/api/properties?categoryId=${relatedCategoryId!}&limit=3`
        )
        .then((r) => r.data.data),
  });
  const related = (relatedData ?? []).filter((p) => p.id !== id).slice(0, 3);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestForm>({ resolver: zodResolver(requestSchema) });

  const requestMutation = useMutation({
    mutationFn: (values: RequestForm & { propertyId: string }) =>
      api.post<ApiResponse<RentalRequest>>("/api/rental-requests", values),
    onSuccess: () => {
      toast.success("Rental request submitted! The landlord will review it.");
      setShowRequestModal(false);
      reset();
      qc.invalidateQueries({ queryKey: ["myRequests"] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to submit request.";
      toast.error(msg);
    },
  });

  function onSubmitRequest(values: RequestForm) {
    if (!user) {
      router.push("/auth/login?redirect=/properties/" + id);
      return;
    }
    requestMutation.mutate({ ...values, propertyId: id });
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="skeleton h-80 rounded-2xl" />
        <div className="skeleton h-8 w-2/3" />
        <div className="skeleton h-4 w-1/2" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!property) return notFound();

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop"];

  const reviewCount = property.reviewCount ?? property._count?.reviews ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* ── Image Gallery ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-surface-raised">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeImg]}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop";
            }}
          />
          {!property.isAvailable && (
            <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
              <span className="text-white text-xl font-bold bg-slate-800/90 px-4 py-2 rounded-full">
                Not Available
              </span>
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 mt-3">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === activeImg ? "border-accent-primary" : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main content ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & badges */}
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {property.category && (
                <span className="text-xs font-semibold bg-accent-primary text-white px-2.5 py-1 rounded-full">
                  {property.category.name}
                </span>
              )}
              {property.isAvailable ? (
                <span className="badge badge-active">Available</span>
              ) : (
                <span className="badge badge-rejected">Unavailable</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              {property.title}
            </h1>
            <p className="flex items-center gap-1.5 text-text-secondary mt-2">
              <MapPin size={14} />
              {property.location}, {property.city}
            </p>

            {/* Rating summary */}
            {property.averageRating != null && (
              <div className="flex items-center gap-2 mt-3">
                <StarRow value={Math.round(property.averageRating)} />
                <span className="text-text-primary font-semibold text-sm">
                  {property.averageRating.toFixed(1)}
                </span>
                <span className="text-text-muted text-sm">
                  ({reviewCount} review{reviewCount === 1 ? "" : "s"})
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: Bed, label: "Bedrooms", val: property.bedrooms },
              { icon: Bath, label: "Bathrooms", val: property.bathrooms },
              { icon: BanknoteIcon, label: "Rent/mo", val: `৳${property.rentAmount.toLocaleString()}` },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="card p-4 text-center">
                <Icon size={20} className="text-accent-primary mx-auto mb-1" />
                <p className="text-text-primary font-bold text-sm">{val}</p>
                <p className="text-text-muted text-xs">{label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="card p-5">
            <h2 className="font-semibold text-text-secondary mb-3">Description</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-text-secondary mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span
                    key={a}
                    className="text-xs bg-surface-raised border border-card-border text-text-secondary px-3 py-1.5 rounded-full flex items-center gap-1"
                  >
                    <CheckCircle size={11} className="text-emerald-400" /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key info */}
          {property.landlord && (
            <div className="card p-5">
              <h2 className="font-semibold text-text-secondary mb-3 flex items-center gap-2">
                <Ruler size={15} /> Key Information
              </h2>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-text-muted text-xs">City</dt>
                  <dd className="text-text-primary font-medium mt-0.5">{property.city}</dd>
                </div>
                <div>
                  <dt className="text-text-muted text-xs">Type</dt>
                  <dd className="text-text-primary font-medium mt-0.5">
                    {property.category?.name ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-muted text-xs">Listing Date</dt>
                  <dd className="text-text-primary font-medium mt-0.5">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Reviews */}
          <div className="card p-5">
            <h2 className="font-semibold text-text-secondary mb-3 flex items-center gap-2">
              <Star size={16} className="text-yellow-400" />
              Reviews ({reviewCount})
            </h2>
            {property.reviews && property.reviews.length > 0 ? (
              <div className="space-y-3">
                {property.reviews.map((r) => (
                  <div key={r.id} className="border-b border-card-border pb-3 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StarRow value={r.rating} size={12} />
                      <span className="text-xs text-text-muted">
                        {r.tenant?.name ?? "Tenant"}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-text-secondary text-sm">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm">No reviews yet.</p>
            )}
          </div>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="card p-5 sticky top-20">
            <p className="text-3xl font-black text-accent-primary">
              ৳{property.rentAmount.toLocaleString()}
              <span className="text-text-muted text-base font-normal">/mo</span>
            </p>

            {user?.role === "TENANT" && property.isAvailable && (
              <button
                className="btn-primary w-full justify-center mt-4"
                onClick={() => setShowRequestModal(true)}
                id="request-to-rent-btn"
              >
                Request to Rent
              </button>
            )}

            {!user && (
              <Link
                href={`/auth/login?redirect=/properties/${id}`}
                className="btn-primary w-full justify-center mt-4 block text-center"
              >
                Login to Request
              </Link>
            )}

            {user?.role === "LANDLORD" && (
              <p className="text-text-muted text-xs mt-3 text-center">
                Landlords cannot request properties.
              </p>
            )}
          </div>

          {/* Landlord card */}
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-text-secondary text-sm">Listed by</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-primary/30 flex items-center justify-center text-accent-primary font-bold text-sm">
                {property.landlord.name.charAt(0)}
              </div>
              <div>
                <p className="text-text-primary font-medium text-sm">
                  {property.landlord.name}
                </p>
                <p className="text-text-muted text-xs">Landlord</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-text-secondary">
              <p className="flex items-center gap-2">
                <Mail size={13} className="text-accent-primary" />
                {property.landlord.email}
              </p>
              {property.landlord.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={13} className="text-accent-primary" />
                  {property.landlord.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Related properties ───────────────────────────────────────────── */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-text-primary mb-5">
            Similar Properties
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}

      {/* ── Request Modal ────────────────────────────────────────────────────── */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="card-elevated p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-text-primary text-lg">Request to Rent</h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmitRequest)}
              noValidate
              className="space-y-4"
            >
              <div>
                <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                  Desired Move-in Date *
                </label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="move-in-date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    className={`form-input pl-8 ${errors.moveInDate ? "error" : ""}`}
                    {...register("moveInDate")}
                  />
                </div>
                {errors.moveInDate && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.moveInDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                  Message to Landlord (optional)
                </label>
                <div className="relative">
                  <MessageSquare size={13} className="absolute left-3 top-3 text-text-muted" />
                  <textarea
                    id="request-message"
                    rows={3}
                    placeholder="Introduce yourself, mention family size, etc."
                    className="form-input pl-8 resize-none"
                    {...register("message")}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || requestMutation.isPending}
                  className="btn-primary flex-1 justify-center"
                  id="submit-request-btn"
                >
                  {requestMutation.isPending ? "Submitting…" : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
