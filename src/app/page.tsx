"use client";
// Home page — Hero slider + 10 more real-data sections.
// All data is fetched live from the RentNest API.

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse, Property, Category } from "@/types";
import { PropertyCard, PropertyCardSkeleton } from "@/components/PropertyCard";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  Zap,
  Star,
  Building2,
  Home,
  KeyRound,
  CheckCircle2,
  ChevronDown,
  Mail,
  ArrowRight,
  MapPin,
  Quote,
} from "lucide-react";
import toast from "react-hot-toast";

interface PublicStats {
  totalUsers: number;
  totalProperties: number;
  availableProperties: number;
  totalCities: number;
  totalReviews: number;
  totalBlogPosts: number;
  averageRating: number;
  categories: (Category & { _count?: { properties: number } })[];
  topReviews: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    tenant: { id: string; name: string; profilePhoto?: string | null };
    property: { id: string; title: string; city: string };
  }[];
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  publishedAt: string;
  author: { id: string; name: string };
}

async function fetchStats(): Promise<PublicStats> {
  const { data } = await api.get<ApiResponse<PublicStats>>("/api/stats");
  return data.data;
}

async function fetchFeaturedProperties(): Promise<Property[]> {
  const { data } = await api.get<ApiResponse<Property[]>>("/api/properties?limit=6");
  return data.data;
}

async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiResponse<Category[]>>("/api/categories");
  return data.data;
}

async function fetchLatestPosts(): Promise<BlogPost[]> {
  const { data } = await api.get<ApiResponse<BlogPost[]>>("/api/blog/latest?limit=3");
  return data.data;
}

function Counter({
  target,
  label,
  suffix = "",
}: {
  target: number;
  label: string;
  suffix?: string;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1200;
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl font-black gradient-text">
        {value.toLocaleString()}
        {suffix}
      </p>
      <p className="text-text-muted text-sm mt-1">{label}</p>
    </div>
  );
}

function HeroSlider({ properties }: { properties: Property[] }) {
  const [index, setIndex] = useState(0);
  const slides = useMemo(
    () => (properties?.length ? properties.slice(0, 4) : []),
    [properties]
  );

  useEffect(() => {
    if (!slides.length) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const current = slides[index];

  return (
    <div className="relative h-72 sm:h-80 w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border border-card-border card-elevated">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&q=80"}
        alt={current.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-violet-300 mb-2">
          Featured Property · {current.city}
        </p>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 line-clamp-1">
          {current.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-sm text-slate-200 flex items-center gap-1">
            <MapPin size={13} /> {current.location}
          </span>
          <span className="text-sm font-semibold text-white">
            ৳ {current.rentAmount.toLocaleString()}
            <span className="text-slate-300 font-normal text-xs">/mo</span>
          </span>
        </div>
        <Link
          href={`/properties/${current.id}`}
          className="inline-flex items-center gap-1.5 mt-3 text-sm text-white bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition-colors"
        >
          View Details <ArrowRight size={14} />
        </Link>
      </div>
      <div className="absolute top-4 right-4 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-violet-400" : "w-3 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const faqs = [
  {
    q: "How do I book a property?",
    a: "Browse the listings, open a property you like, and send a rental request with your preferred move-in date. The landlord reviews it from their dashboard and either approves or rejects it.",
  },
  {
    q: "Is it safe to pay rent online?",
    a: "Yes. Payments are processed securely through Stripe after your rental request is approved. Every transaction is recorded and visible in your dashboard with a receipt.",
  },
  {
    q: "Are the landlords verified?",
    a: "Every landlord registers with a valid email and is reviewed before their listings go live. You can also read tenant reviews on each property before you commit.",
  },
  {
    q: "Can I cancel a rental request?",
    a: "Yes — as long as the request is still pending. Open your tenant dashboard, find the request, and cancel it in one click.",
  },
  {
    q: "Do you charge any commission?",
    a: "No. Creating an account, browsing properties, and sending rental requests are completely free for tenants.",
  },
];

export default function HomePage() {
  const { data: stats } = useQuery({ queryKey: ["public-stats"], queryFn: fetchStats });
  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", "featured"],
    queryFn: fetchFeaturedProperties,
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const { data: posts } = useQuery({
    queryKey: ["blog", "latest"],
    queryFn: fetchLatestPosts,
  });

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterState("loading");
    try {
      await api.post("/api/newsletter/subscribe", { email: newsletterEmail });
      setNewsletterState("done");
      setNewsletterEmail("");
      toast.success("You're subscribed! Watch your inbox.");
    } catch (err) {
      setNewsletterState("error");
      const status = (err as { response?: { status?: number } }).response?.status;
      toast.error(
        status === 409 ? "This email is already subscribed." : "Subscription failed. Try again."
      );
    }
  }

  const statData = stats
    ? [
        { target: stats.totalProperties, label: "Active Listings" },
        { target: stats.totalUsers, label: "Registered Users" },
        { target: stats.totalCities, label: "Cities Covered" },
        { target: stats.averageRating, label: "Average Rating", suffix: "★" },
      ]
    : [];

  return (
    <div>
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 sm:py-20 px-4">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-sm text-accent-primary bg-accent-primary/15 border border-accent-primary/40 px-4 py-1.5 rounded-full">
            <Star size={13} fill="currentColor" /> Bangladesh&apos;s #1 Rental Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-black leading-tight">
            Find Your <span className="gradient-text">Perfect Rental</span> Home
          </h1>

          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            Browse verified properties across Dhaka, Chattogram, Khulna and
            beyond. Instant rental requests, secure payments, real reviews.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/properties" className="btn-primary btn-lg">
              <Search size={17} /> Browse Properties
            </Link>
            <Link href="/auth/register" className="btn-secondary btn-lg">
              List Your Property
            </Link>
          </div>

          <div className="flex justify-center gap-8 pt-6 text-sm">
            {statData.map(({ target, label, suffix }) => (
              <Counter key={label} target={target} label={label} suffix={suffix || ""} />
            ))}
          </div>
        </div>

        <div className="relative mt-10">
          {properties ? (
            <HeroSlider properties={properties} />
          ) : (
            <div className="skeleton h-72 sm:h-80 max-w-4xl mx-auto rounded-2xl" />
          )}
        </div>
      </section>

      {/* ── 2. Value Props ─────────────────────────────────────────────── */}
      <section className="py-14 px-4 border-y border-card-border/60">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: "Verified Landlords",
              desc: "Every landlord is registered and verified through our platform.",
              color: "text-accent-primary",
            },
            {
              icon: Zap,
              title: "Instant Requests",
              desc: "Submit a rental request in seconds — landlords respond fast.",
              color: "text-pink-500",
            },
            {
              icon: Star,
              title: "Real Reviews",
              desc: "Honest tenant reviews help you make the right choice.",
              color: "text-emerald-500",
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card-interactive p-6 space-y-3">
              <Icon size={28} className={color} />
              <h3 className="font-semibold text-text-primary">{title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Categories ──────────────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-text-primary">
              Browse by <span className="gradient-text">Category</span>
            </h2>
            <p className="text-text-secondary text-sm mt-2">
              Find the right property type for your lifestyle
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(categories || []).map((category) => (
              <Link
                key={category.id}
                href={`/properties?category=${category.id}`}
                className="card-interactive p-6 flex flex-col gap-2"
              >
                <Building2 size={26} className="text-accent-primary" />
                <h3 className="font-semibold text-text-primary">{category.name}</h3>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {category.description}
                </p>
                <span className="text-xs text-accent-primary font-medium mt-auto pt-2">
                  {category._count?.properties ?? 0} listings
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. How it works ────────────────────────────────────────────── */}
      <section className="py-14 px-4 border-y border-card-border/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-text-primary">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-text-secondary text-sm mt-2">
              From searching to signing — three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                step: "01",
                title: "Search & Shortlist",
                desc: "Use filters for city, budget and bedrooms to find listings that match your needs.",
              },
              {
                icon: KeyRound,
                step: "02",
                title: "Send a Request",
                desc: "Submit a rental request with your move-in date and let the landlord approve it.",
              },
              {
                icon: CheckCircle2,
                step: "03",
                title: "Pay & Move In",
                desc: "Complete a secure online payment and move into your new home with a receipt in hand.",
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="card p-6 space-y-3 relative">
                <span className="absolute top-4 right-4 text-4xl font-black text-card-border/60">
                  {step}
                </span>
                <Icon size={26} className="text-accent-primary" />
                <h3 className="font-semibold text-text-primary">{title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Featured Properties ─────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-text-primary">
                Featured <span className="gradient-text">Properties</span>
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                Hand-picked listings across Bangladesh
              </p>
            </div>
            <Link href="/properties" className="text-sm text-accent-primary hover:underline">
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

      {/* ── 6. Statistics ──────────────────────────────────────────────── */}
      {stats && (
        <section className="py-14 px-4 border-y border-card-border/60">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-10">
              RentNest by the <span className="gradient-text">Numbers</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statData.map(({ target, label, suffix }) => (
                <Counter key={label} target={target} label={label} suffix={suffix || ""} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. Testimonials ────────────────────────────────────────────── */}
      {stats?.topReviews?.length ? (
        <section className="py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-text-primary">
                What Tenants <span className="gradient-text">Say</span>
              </h2>
              <p className="text-text-secondary text-sm mt-2">
                Real reviews from verified renters
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {stats.topReviews.map((review) => (
                <figure key={review.id} className="card p-6 flex flex-col gap-3">
                  <Quote size={22} className="text-accent-primary/60" />
                  <blockquote className="text-sm text-text-secondary leading-relaxed flex-1 line-clamp-5">
                    {review.comment}
                  </blockquote>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        fill={i < review.rating ? "currentColor" : "none"}
                        className={i < review.rating ? "" : "text-card-border"}
                      />
                    ))}
                  </div>
                  <figcaption>
                    <p className="text-sm font-semibold text-text-primary">
                      {review.tenant.name}
                    </p>
                    <p className="text-xs text-text-muted line-clamp-1">
                      {review.property.title}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── 8. Latest Blog ─────────────────────────────────────────────── */}
      <section className="py-14 px-4 border-y border-card-border/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-text-primary">
                From the <span className="gradient-text">Blog</span>
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                Tips, guides and trends for renters and landlords
              </p>
            </div>
            <Link href="/blog" className="text-sm text-accent-primary hover:underline">
              All posts →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(posts || []).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="card-interactive overflow-hidden group"
              >
                <div className="h-40 overflow-hidden bg-surface-raised">
                  {post.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home size={32} className="text-card-border" />
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-accent-primary/15 text-accent-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2 group-hover:text-accent-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    · {post.author.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ─────────────────────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-text-primary">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-text-secondary text-sm mt-2">
              Everything you need to know before renting
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-medium text-text-primary text-sm">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-text-secondary shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <p className="px-5 pb-4 text-sm text-text-secondary leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. Newsletter ─────────────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto card-elevated p-10 text-center space-y-5">
          <h2 className="text-3xl font-bold text-text-primary">
            Stay in the <span className="gradient-text">Loop</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Subscribe to our newsletter for new listings, rental guides, and
            neighbourhood insights — straight to your inbox.
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <div className="relative flex-1">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input pl-9"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={newsletterState === "loading"}>
              {newsletterState === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
          {newsletterState === "done" && (
            <p className="text-sm text-emerald-500">Thanks! Please check your inbox.</p>
          )}
          {newsletterState === "error" && (
            <p className="text-sm text-red-400">That didn&apos;t work — please try again.</p>
          )}
        </div>
      </section>

      {/* ── 11. CTA Banner ─────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center card-elevated p-12 space-y-5">
          <h2 className="text-3xl font-bold text-text-primary">
            Are you a <span className="gradient-text">Landlord?</span>
          </h2>
          <p className="text-text-secondary">
            List your property for free and reach hundreds of qualified tenants.
          </p>
          <Link href="/auth/register" className="btn-gradient btn-lg">
            Start Listing Today
          </Link>
        </div>
      </section>
    </div>
  );
}
