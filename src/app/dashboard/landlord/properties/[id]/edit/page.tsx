"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse, Property } from "@/types";
import { PropertyForm, type PropertyFormData } from "@/components/PropertyForm";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Property>>(
        `/api/properties/${id}`
      );
      return data.data;
    },
  });

  async function handleUpdate(data: PropertyFormData) {
    try {
      await api.patch(`/api/properties/${id}`, data);
      toast.success("Property updated!");
      router.push("/dashboard/landlord");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Update failed.";
      toast.error(msg);
      throw err;
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-slate-400">Property not found.</p>
      </div>
    );
  }

  // Map the Property shape to the form default values
  const defaults: Partial<PropertyFormData> = {
    title: property.title,
    description: property.description,
    location: property.location,
    city: property.city,
    rentAmount: property.rentAmount,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    categoryId: property.category?.id,
    images: property.images,
    amenities: property.amenities,
    isAvailable: property.isAvailable,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <Link
          href="/dashboard/landlord"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-violet-400 transition-colors mb-4"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">
          Edit <span className="gradient-text">Property</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1 truncate">{property.title}</p>
      </div>

      <div className="glass-card p-6 sm:p-8">
        <PropertyForm
          defaultValues={defaults}
          onSubmit={handleUpdate}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
