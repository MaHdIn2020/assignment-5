"use client";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { PropertyForm, type PropertyFormData } from "@/components/PropertyForm";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewPropertyPage() {
  const router = useRouter();

  async function handleCreate(data: PropertyFormData) {
    try {
      await api.post("/api/properties", data);
      toast.success("Property listed successfully!");
      router.push("/dashboard/landlord");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create property.";
      toast.error(msg);
      throw err; // re-throw so the form stays in submitting=false
    }
  }

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
          Add New <span className="gradient-text">Property</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Fill in the details below to list your property.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8">
        <PropertyForm onSubmit={handleCreate} submitLabel="Publish Property" />
      </div>
    </div>
  );
}
