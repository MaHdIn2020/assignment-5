"use client";
// /blog — public blog listing with tag filter + pagination.

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse, BlogPost } from "@/types";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { FileText, Calendar, Tag } from "lucide-react";

async function fetchPosts(params: URLSearchParams) {
  const { data } = await api.get<ApiResponse<BlogPost[]>>(
    `/api/blog?${params.toString()}`
  );
  return data;
}

function BlogContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const page = Number(searchParams.get("page") ?? 1);
  const activeTag = searchParams.get("tag") ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["blog", searchParams.toString()],
    queryFn: () => fetchPosts(searchParams),
  });

  const posts = data?.data ?? [];
  const meta = data?.meta;

  // All distinct tags across the current page
  const tags = [...new Set(posts.flatMap((p) => p.tags ?? []))];

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-text-primary">
          The <span className="gradient-text">RentNest</span> Blog
        </h1>
        <p className="text-text-secondary mt-2 max-w-xl mx-auto">
          Tips, guides and news about renting in Bangladesh
        </p>
      </div>

      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setParam("tag", "")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !activeTag
                ? "bg-accent-primary text-white"
                : "bg-surface-raised text-text-secondary hover:bg-hover-bg"
            }`}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setParam("tag", activeTag === t ? "" : t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTag === t
                  ? "bg-accent-primary text-white"
                  : "bg-surface-raised text-text-secondary hover:bg-hover-bg"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-72 rounded-2xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={36} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-primary font-medium">No articles found</p>
          <p className="text-text-muted text-sm mt-1">Check back soon.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="card-interactive overflow-hidden group"
                id={`blog-post-${post.slug}`}
              >
                <div className="relative h-44 overflow-hidden bg-surface-raised">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      post.coverImage ??
                      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop"
                    }
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-text-muted mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                    <span>{post.author?.name ?? "RentNest Team"}</span>
                  </div>
                  <h2 className="font-bold text-text-primary group-hover:text-accent-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-text-secondary text-sm mt-2 line-clamp-2">
                    {post.excerpt}
                  </p>
                  {(post.tags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags!.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1 text-[11px] bg-surface-raised text-text-secondary px-2 py-0.5 rounded-full"
                        >
                          <Tag size={9} /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: meta.totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setParam("page", String(p))}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-accent-primary text-white"
                        : "bg-surface-raised text-text-secondary hover:bg-hover-bg"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <BlogContent />
    </Suspense>
  );
}
