"use client";
// /about — company story, mission, values and team.

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse, PublicStats } from "@/types";
import Link from "next/link";
import {
  Shield, Handshake, Globe, Sparkles, Target, HeartHandshake,
} from "lucide-react";

export default function AboutPage() {
  const { data } = useQuery({
    queryKey: ["publicStats"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PublicStats>>("/api/stats");
      return data.data;
    },
  });

  const stats = [
    { label: "Properties Listed", val: data?.totalProperties ?? 8 },
    { label: "Happy Tenants", val: data?.totalUsers ?? 0 },
    { label: "Cities Covered", val: data?.totalCities ?? 0 },
    { label: "Property Reviews", val: data?.totalReviews ?? 0 },
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Safety",
      text: "Every listing is moderated and every landlord is verified, so you can rent with confidence.",
    },
    {
      icon: Handshake,
      title: "Fair Deals",
      text: "Transparent pricing with no hidden brokerage fees — what you see is what you pay.",
    },
    {
      icon: Globe,
      title: "Coverage",
      text: "From Dhaka to Chattogram, find quality rentals in the cities you care about.",
    },
    {
      icon: Sparkles,
      title: "Modern Experience",
      text: "Search, request, pay and review — the entire rental journey in one place.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-text-primary">
          About <span className="gradient-text">RentNest</span>
        </h1>
        <p className="text-text-secondary mt-3 max-w-2xl mx-auto leading-relaxed">
          RentNest is a rental marketplace for Bangladesh that connects tenants
          with trusted landlords. We exist to make finding a home simple,
          transparent and stress-free.
        </p>
      </div>

      {/* Mission */}
      <div className="card p-8 mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-accent-primary" size={22} />
          <h2 className="text-xl font-bold text-text-primary">Our Mission</h2>
        </div>
        <p className="text-text-secondary leading-relaxed">
          Renting a home should be exciting, not exhausting. Our mission is to
          replace painful brokerages, fragmented listings and endless phone calls
          with a single, trustworthy platform where tenants can discover verified
          properties, landlords can fill vacancies quickly, and every step — from
          request to payment to review — happens online.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map(({ label, val }) => (
          <div key={label} className="card p-5 text-center">
            <p className="text-2xl font-black text-accent-primary">{val}</p>
            <p className="text-xs text-text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Values */}
      <h2 className="text-2xl font-bold text-text-primary mb-6">What We Stand For</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
        {values.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-6">
            <Icon className="text-accent-primary mb-3" size={24} />
            <h3 className="font-semibold text-text-primary mb-1.5">{title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      {/* Team / closing CTA */}
      <div className="card p-8 text-center bg-gradient-to-br from-violet-600/20 to-blue-600/10 border-card-border">
        <HeartHandshake className="text-accent-primary mx-auto mb-3" size={28} />
        <h2 className="text-xl font-bold text-text-primary mb-2">
          Join the RentNest community
        </h2>
        <p className="text-text-secondary text-sm mb-5 max-w-xl mx-auto">
          Whether you&apos;re hunting for your next home or listing your property,
          we&apos;d love to have you on board.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/properties" className="btn-primary">
            Browse Properties
          </Link>
          <Link href="/auth/register" className="btn-secondary">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
