"use client";
// /help — FAQ + guided help topics.

import { useState } from "react";
import { ChevronDown, HelpCircle, Search, Home, UserPlus, CreditCard, Star, ShieldQuestion } from "lucide-react";
import Link from "next/link";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I search for a property?",
    a: "Browse the Properties page and use the filters to narrow by city, property type, rent range or bedrooms. You can also type a keyword search for titles, descriptions or locations, and sort results by price or bedroom count.",
  },
  {
    q: "How do I request a property?",
    a: "Sign in as a tenant, open any available property, and click 'Request to Rent'. Choose your desired move-in date and add a message to the landlord. Once the landlord approves, you can pay to confirm the rental.",
  },
  {
    q: "How does payment work?",
    a: "After a landlord approves your request, you'll see a 'Pay Now' button on your dashboard. Payments are processed securely by Stripe, and you'll receive a confirmation once the payment succeeds.",
  },
  {
    q: "How do I leave a review?",
    a: "Once you've paid for a rental, the 'Review' button appears next to that rental on your tenant dashboard. You can rate the property from 1 to 5 stars and add a comment.",
  },
  {
    q: "How do I list my property?",
    a: "Register as a landlord, then open your dashboard and click 'Add Property'. Fill in the title, description, location, rent, bedrooms, amenities and photos, and your listing goes live immediately.",
  },
  {
    q: "Can I reset or change my password?",
    a: "Open your dashboard, go to Settings → Profile, and use the 'Change Password' section. You'll need to provide your current password first.",
  },
  {
    q: "Is this a real rental service?",
    a: "RentNest is a demonstration project. Social logins are mocked and payments use Stripe in test mode, so no real money or personal data is exchanged.",
  },
];

const TOPICS = [
  { icon: Home, title: "Finding a Home", text: "Search, filters and property details.", href: "/properties" },
  { icon: UserPlus, title: "Creating an Account", text: "Register as a tenant or landlord.", href: "/auth/register" },
  { icon: CreditCard, title: "Payments", text: "How approvals and Stripe payments work.", href: "/dashboard/tenant" },
  { icon: Star, title: "Reviews & Ratings", text: "Leave feedback on rentals you've completed.", href: "/dashboard/tenant" },
  { icon: ShieldQuestion, title: "Safety & Trust", text: "How we verify listings and users.", href: "/about" },
  { icon: HelpCircle, title: "Still Stuck?", text: "Get in touch with our support team.", href: "/contact" },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [search, setSearch] = useState("");

  const filtered = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-text-primary">
          How can we <span className="gradient-text">help?</span>
        </h1>
        <p className="text-text-secondary mt-2">Search our help centre or browse the FAQ below.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg mx-auto mb-10">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search help articles…"
          className="form-input pl-10"
          id="help-search"
        />
      </div>

      {/* FAQ accordion */}
      <h2 className="text-xl font-bold text-text-primary mb-4">Frequently Asked Questions</h2>
      <div className="space-y-3 mb-12">
        {filtered.length === 0 && (
          <p className="text-text-muted text-sm text-center py-8">
            No results for &quot;{search}&quot;. Try another term.
          </p>
        )}
        {filtered.map((f, i) => (
          <div key={f.q} className="card overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 p-4 text-left"
              id={`faq-${i}`}
            >
              <span className="font-medium text-text-primary text-sm">{f.q}</span>
              <ChevronDown
                size={16}
                className={`text-text-muted shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            {open === i && (
              <p className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">{f.a}</p>
            )}
          </div>
        ))}
      </div>

      {/* Help topics */}
      <h2 className="text-xl font-bold text-text-primary mb-4">Browse by Topic</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOPICS.map(({ icon: Icon, title, text, href }) => (
          <Link key={title} href={href} className="card-interactive p-5">
            <Icon className="text-accent-primary mb-2" size={22} />
            <p className="font-semibold text-text-primary text-sm">{title}</p>
            <p className="text-xs text-text-muted mt-1">{text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
