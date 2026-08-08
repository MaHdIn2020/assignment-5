// Reusable PropertyCard — shown on home page, /properties listing, and dashboards.
// Accepts a Property object and renders a compact card with key details.

import Link from "next/link";
import type { Property } from "@/types";
import { MapPin, Bed, Bath, BanknoteIcon, Star } from "lucide-react";

interface Props {
  property: Property;
}

export function PropertyCard({ property }: Props) {
  const {
    id,
    title,
    description,
    city,
    location,
    rentAmount,
    bedrooms,
    bathrooms,
    images,
    category,
    isAvailable,
    averageRating,
    reviewCount,
  } = property;

  // Fallback image when the property has no images uploaded
  const imgSrc =
    images && images.length > 0
      ? images[0]
      : `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop`;

  return (
    <Link href={`/properties/${id}`} className="group block">
      <div className="card-interactive overflow-hidden flex flex-col h-full">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-surface-raised">
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
            <div className="absolute inset-0 bg-surface-raised/70 flex items-center justify-center">
              <span className="text-text-primary font-semibold text-sm bg-surface-raised/90 px-3 py-1 rounded-full">
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
          {/* Rating badge */}
          {(reviewCount ?? 0) > 0 && (
            <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold bg-surface-raised/90 text-text-primary px-2 py-1 rounded-full">
              <Star size={12} className="text-yellow-400" fill="currentColor" />
              {averageRating}
              <span className="text-text-muted font-normal">
                ({reviewCount})
              </span>
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 flex flex-col flex-1">
          <div>
            <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2 group-hover:text-accent-primary transition-colors">
              {title}
            </h3>
            <p className="flex items-center gap-1 text-xs text-text-secondary mt-1">
              <MapPin size={11} />
              {location}, {city}
            </p>
          </div>

          {description && (
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              {description}
            </p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Bed size={12} /> {bedrooms} Bed
            </span>
            <span className="flex items-center gap-1">
              <Bath size={12} /> {bathrooms} Bath
            </span>
          </div>

          {/* Price + action */}
          <div className="flex items-center justify-between pt-3 mt-auto border-t border-card-border">
            <div className="flex items-center gap-1 text-accent-primary font-bold">
              <BanknoteIcon size={14} />
              ৳ {rentAmount.toLocaleString()}
              <span className="text-text-muted font-normal text-xs">/mo</span>
            </div>
            <span className="btn-primary btn-sm pointer-events-none">
              View Details
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
    <div className="card overflow-hidden">
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
