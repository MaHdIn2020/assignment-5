"use client";
// Shared property form component used by both the New and Edit pages.
// Accepts `defaultValues` (undefined for new, property data for edit)
// and an `onSubmit` callback so the calling page handles the API call.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse, Category } from "@/types";
import { Plus, X } from "lucide-react";
import { useState } from "react";

// ── Schema mirrors backend property.validation.ts ─────────────────────────────
export const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(1, "Location is required"),
  city: z.string().min(1, "City is required"),
  rentAmount: z.number({ invalid_type_error: "Must be a positive number" }).positive("Must be a positive number"),
  bedrooms: z.number({ invalid_type_error: "At least 1 bedroom" }).int().min(1, "At least 1 bedroom"),
  bathrooms: z.number({ invalid_type_error: "At least 1 bathroom" }).int().min(1, "At least 1 bathroom"),
  categoryId: z.string().uuid("Select a category").optional(),
  images: z.array(z.string().url("Must be a valid URL")).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
  isAvailable: z.boolean().optional().default(true),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

interface Props {
  defaultValues?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => Promise<void>;
  submitLabel: string;
}

const AMENITY_PRESETS = [
  "Parking", "Generator", "Elevator", "Security", "Garden",
  "Gas Connection", "Rooftop", "WiFi Ready", "Furnished", "CCTV",
];

export function PropertyForm({ defaultValues, onSubmit, submitLabel }: Props) {
  const [imageInput, setImageInput] = useState("");
  const [amenityInput, setAmenityInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      isAvailable: true,
      images: [],
      amenities: [],
      ...defaultValues,
    },
  });

  const images = watch("images") ?? [];
  const amenities = watch("amenities") ?? [];

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Category[]>>("/api/categories");
      return data.data;
    },
    staleTime: Infinity,
  });

  function addImage() {
    const url = imageInput.trim();
    if (url && !images.includes(url)) {
      setValue("images", [...images, url]);
      setImageInput("");
    }
  }

  function removeImage(url: string) {
    setValue("images", images.filter((u) => u !== url));
  }

  function toggleAmenity(a: string) {
    if (amenities.includes(a)) {
      setValue("amenities", amenities.filter((x) => x !== a));
    } else {
      setValue("amenities", [...amenities, a]);
    }
  }

  function addCustomAmenity() {
    const val = amenityInput.trim();
    if (val && !amenities.includes(val)) {
      setValue("amenities", [...amenities, val]);
      setAmenityInput("");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Title */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
          Title *
        </label>
        <input
          id="prop-title"
          type="text"
          placeholder="Spacious 3-Bedroom Apartment in Gulshan"
          className={`form-input ${errors.title ? "error" : ""}`}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
          Description *
        </label>
        <textarea
          id="prop-description"
          rows={4}
          placeholder="Describe the property in detail…"
          className={`form-input resize-none ${errors.description ? "error" : ""}`}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Location + City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
            Location / Street *
          </label>
          <input
            id="prop-location"
            type="text"
            placeholder="Road 12, Block C, Gulshan 2"
            className={`form-input ${errors.location ? "error" : ""}`}
            {...register("location")}
          />
          {errors.location && (
            <p className="text-red-400 text-xs mt-1">{errors.location.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
            City *
          </label>
          <input
            id="prop-city"
            type="text"
            placeholder="Dhaka"
            className={`form-input ${errors.city ? "error" : ""}`}
            {...register("city")}
          />
          {errors.city && (
            <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>
          )}
        </div>
      </div>

      {/* Rent + Bedrooms + Bathrooms */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
            Rent (৳/mo) *
          </label>
          <input
            id="prop-rent"
            type="number"
            placeholder="25000"
            className={`form-input ${errors.rentAmount ? "error" : ""}`}
            {...register("rentAmount", { valueAsNumber: true })}
          />
          {errors.rentAmount && (
            <p className="text-red-400 text-xs mt-1">{errors.rentAmount.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
            Bedrooms *
          </label>
          <input
            id="prop-bedrooms"
            type="number"
            min={1}
            className={`form-input ${errors.bedrooms ? "error" : ""}`}
            {...register("bedrooms", { valueAsNumber: true })}
          />
          {errors.bedrooms && (
            <p className="text-red-400 text-xs mt-1">{errors.bedrooms.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
            Bathrooms *
          </label>
          <input
            id="prop-bathrooms"
            type="number"
            min={1}
            className={`form-input ${errors.bathrooms ? "error" : ""}`}
            {...register("bathrooms", { valueAsNumber: true })}
          />
          {errors.bathrooms && (
            <p className="text-red-400 text-xs mt-1">{errors.bathrooms.message}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
          Category
        </label>
        <select id="prop-category" className="form-input" {...register("categoryId")}>
          <option value="">Select category</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Images */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
          Images (URLs)
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/photo.jpg"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            className="form-input"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
          />
          <button
            type="button"
            onClick={addImage}
            className="btn-outline px-3 py-2 shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
        {images.length > 0 && (
          <div className="mt-2 space-y-1">
            {images.map((url) => (
              <div
                key={url}
                className="flex items-center gap-2 text-xs bg-slate-800 rounded-lg px-3 py-1.5"
              >
                <span className="flex-1 truncate text-slate-300">{url}</span>
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Amenities */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
          Amenities
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {AMENITY_PRESETS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmenity(a)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                amenities.includes(a)
                  ? "bg-violet-600/30 border-violet-500 text-violet-300"
                  : "border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Custom amenity…"
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            className="form-input text-sm"
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addCustomAmenity())
            }
          />
          <button
            type="button"
            onClick={addCustomAmenity}
            className="btn-outline px-3 py-2 shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
        {amenities.filter((a) => !AMENITY_PRESETS.includes(a)).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {amenities
              .filter((a) => !AMENITY_PRESETS.includes(a))
              .map((a) => (
                <span
                  key={a}
                  className="text-xs bg-slate-800 border border-slate-700 px-2 py-1 rounded-full text-slate-300 flex items-center gap-1"
                >
                  {a}
                  <button type="button" onClick={() => toggleAmenity(a)}>
                    <X size={10} />
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Availability toggle (edit only) */}
      {defaultValues !== undefined && (
        <div className="flex items-center gap-3">
          <input
            id="prop-available"
            type="checkbox"
            className="w-4 h-4 accent-violet-500"
            {...register("isAvailable")}
          />
          <label htmlFor="prop-available" className="text-sm text-slate-300">
            Mark as Available
          </label>
        </div>
      )}

      <button
        id="property-form-submit"
        type="submit"
        disabled={isSubmitting}
        className="btn-gradient w-full justify-center py-3"
      >
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
