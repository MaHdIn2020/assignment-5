"use client";
// /properties — browse all properties with filter sidebar.
// Filters are stored in URL search params so they're shareable/bookmarkable.

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse, Property, Category } from "@/types";
import { PropertyCard, PropertyCardSkeleton } from "@/components/PropertyCard";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, Suspense } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

// ── Data fetchers ─────────────────────────────────────────────────────────────
async function fetchProperties(params: URLSearchParams) {
  const { data } = await api.get<ApiResponse<Property[]>>(
    `/api/properties?${params.toString()}`
  );
  return data;
}

async function fetchCategories() {
  const { data } = await api.get<ApiResponse<Category[]>>("/api/categories");
  return data.data;
}

function PropertiesContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Helper to update a single filter param while keeping others
  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when filters change
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  function clearFilters() {
    router.push(pathname);
  }

  const { data, isLoading } = useQuery({
    queryKey: ["properties", searchParams.toString()],
    queryFn: () => fetchProperties(searchParams),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: Infinity, // categories rarely change
  });

  const properties = data?.data ?? [];
  const meta = data?.meta;
  const hasFilters =
    searchParams.has("city") ||
    searchParams.has("categoryId") ||
    searchParams.has("minRent") ||
    searchParams.has("maxRent") ||
    searchParams.has("bedrooms");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">
          Browse <span className="gradient-text">Properties</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {meta ? `${meta.total} listings found` : "Searching…"}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Filter Sidebar ────────────────────────────────────────────── */}
        <aside className="lg:w-64 shrink-0">
          <div className="card p-5 space-y-5 sticky top-20">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                <SlidersHorizontal size={16} /> Filters
              </h2>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-violet-400 hover:underline flex items-center gap-1"
                >
                  <X size={11} /> Clear all
                </button>
              )}
            </div>

            {/* Search by city */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
                City
              </label>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Dhaka, Chattogram…"
                  defaultValue={searchParams.get("city") ?? ""}
                  className="form-input pl-8 text-sm"
                  onChange={(e) => setParam("city", e.target.value)}
                  id="filter-city"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
                Property Type
              </label>
              <select
                className="form-input text-sm"
                value={searchParams.get("categoryId") ?? ""}
                onChange={(e) => setParam("categoryId", e.target.value)}
                id="filter-category"
              >
                <option value="">All Types</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
                Rent Range (৳/mo)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  defaultValue={searchParams.get("minRent") ?? ""}
                  className="form-input text-sm"
                  onChange={(e) => setParam("minRent", e.target.value)}
                  id="filter-min-rent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  defaultValue={searchParams.get("maxRent") ?? ""}
                  className="form-input text-sm"
                  onChange={(e) => setParam("maxRent", e.target.value)}
                  id="filter-max-rent"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
                Bedrooms
              </label>
              <select
                className="form-input text-sm"
                value={searchParams.get("bedrooms") ?? ""}
                onChange={(e) => setParam("bedrooms", e.target.value)}
                id="filter-bedrooms"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* ── Properties Grid ───────────────────────────────────────────── */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="card p-12 text-center">
              <Search size={36} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">No properties found</p>
              <p className="text-slate-500 text-sm mt-1">
                Try adjusting or clearing your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.total > meta.limit && (
                <div className="flex justify-center gap-3 mt-8">
                  {Array.from({
                    length: Math.ceil(meta.total / meta.limit),
                  }).map((_, i) => {
                    const page = i + 1;
                    const current = Number(searchParams.get("page") ?? 1);
                    return (
                      <button
                        key={page}
                        onClick={() => setParam("page", String(page))}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          page === current
                            ? "bg-violet-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PropertiesContent />
    </Suspense>
  );
}
