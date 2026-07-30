// Reusable PropertyCard — shown on home page, /properties listing, and dashboards.
// Accepts a Property object and renders a compact card with key details.

import Link from "next/link";
import type { Property } from "@/types";
import { MapPin, Bed, Bath, BanknoteIcon } from "lucide-react";

interface Props {
  property: Property;
}

export function PropertyCard({ property }: Props) {
  const {
    id,
    title,
    city,
    location,
    rentAmount,
    bedrooms,
    bathrooms,
    images,
    category,
    isAvailable,
  } = property;

  // Fallback image when the property has no images uploaded
  const imgSrc =
    images && images.length > 0
      ? images[0]
      : `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop`;

  return (
    <Link href={`/properties/${id}`} className="group block">
      <div className="glass-card overflow-hidden transition-all duration-300 hover:border-violet-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop";
            }}
          />
          {/* Availability overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
              <span className="text-slate-300 font-semibold text-sm bg-slate-800/90 px-3 py-1 rounded-full">
                Not Available
              </span>
            </div>
          )}
          {/* Category badge */}
          {category && (
            <span className="absolute top-3 left-3 text-xs font-semibold bg-violet-600/90 text-white px-2.5 py-1 rounded-full">
              {category.name}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">
              {title}
            </h3>
            <p className="flex items-center gap-1 text-xs text-slate-400 mt-1">
              <MapPin size={11} />
              {location}, {city}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Bed size={12} /> {bedrooms} Bed
            </span>
            <span className="flex items-center gap-1">
              <Bath size={12} /> {bathrooms} Bath
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
            <div className="flex items-center gap-1 text-violet-400 font-bold">
              <BanknoteIcon size={14} />
              ৳ {rentAmount.toLocaleString()}
              <span className="text-slate-500 font-normal text-xs">/mo</span>
            </div>
            <span className="text-xs text-violet-400 font-medium group-hover:underline">
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton version for loading states
export function PropertyCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="skeleton h-48 rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex gap-4">
          <div className="skeleton h-3 w-16" />
          <div className="skeleton h-3 w-16" />
        </div>
        <div className="skeleton h-4 w-1/3" />
      </div>
    </div>
  );
}
