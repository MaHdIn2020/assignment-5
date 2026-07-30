"use client";
// Home page — Hero section + Featured properties (first 6 from live API).
// This is a Client Component so we can use TanStack Query for data fetching.

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse, Property } from "@/types";
import { PropertyCard, PropertyCardSkeleton } from "@/components/PropertyCard";
import Link from "next/link";
import { Search, ShieldCheck, Zap, Star } from "lucide-react";

async function fetchFeaturedProperties() {
  const { data } = await api.get<ApiResponse<Property[]>>(
    "/api/properties?limit=6"
  );
  return data.data;
}

export default function HomePage() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", "featured"],
    queryFn: fetchFeaturedProperties,
  });

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28 px-4">
        {/* Background gradient blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-sm text-violet-300 bg-violet-900/30 border border-violet-700/40 px-4 py-1.5 rounded-full">
            <Star size={13} fill="currentColor" /> Bangladesh&apos;s #1 Rental Platform
          </div>

          <h1 className="text-5xl sm:text-6xl font-black leading-tight">
            Find Your{" "}
            <span className="gradient-text">Perfect Rental</span>{" "}
            Home
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Browse verified properties across Dhaka, Chattogram, Khulna and
            beyond. Instant rental requests, secure payments, real reviews.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/properties" className="btn-gradient text-base px-8 py-3">
              <Search size={17} /> Browse Properties
            </Link>
            <Link href="/auth/register" className="btn-outline text-base px-8 py-3">
              List Your Property
            </Link>
          </div>

          {/* Stats bar */}
          <div className="flex justify-center gap-8 pt-6 text-sm">
            {[
              { val: "8+", label: "Listings" },
              { val: "3", label: "Cities" },
              { val: "4", label: "Categories" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold gradient-text">{val}</p>
                <p className="text-slate-500 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value Props ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-y border-slate-800/60">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: "Verified Landlords",
              desc: "Every landlord is registered and verified through our platform.",
              color: "text-violet-400",
            },
            {
              icon: Zap,
              title: "Instant Requests",
              desc: "Submit a rental request in seconds — landlords respond fast.",
              color: "text-pink-400",
            },
            {
              icon: Star,
              title: "Real Reviews",
              desc: "Honest tenant reviews help you make the right choice.",
              color: "text-emerald-400",
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="glass-card p-6 space-y-3">
              <Icon size={28} className={color} />
              <h3 className="font-semibold text-slate-100">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Properties ─────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-100">
                Featured <span className="gradient-text">Properties</span>
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Hand-picked listings across Bangladesh
              </p>
            </div>
            <Link
              href="/properties"
              className="text-sm text-violet-400 hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))
              : properties?.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center glass-card p-12 space-y-5">
          <h2 className="text-3xl font-bold text-slate-100">
            Are you a <span className="gradient-text">Landlord?</span>
          </h2>
          <p className="text-slate-400">
            List your property for free and reach hundreds of qualified tenants.
          </p>
          <Link href="/auth/register" className="btn-gradient text-base px-8 py-3">
            Start Listing Today
          </Link>
        </div>
      </section>
    </div>
  );
}
