"use client";
// /blog/[slug] — full blog article with markdown content.

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse, BlogPost } from "@/types";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Calendar, User, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";

async function fetchPost(slug: string) {
  try {
    const { data } = await api.get<ApiResponse<BlogPost>>(`/api/blog/${slug}`);
    return data.data;
  } catch {
    return null;
  }
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchPost(slug),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-4">
        <div className="skeleton h-10 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-72 rounded-2xl" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    );
  }

  if (!post) return notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-primary transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Back to Blog
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight">
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mt-4 mb-8">
        <span className="flex items-center gap-1.5">
          <User size={13} /> {post.author?.name ?? "RentNest Team"}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar size={13} /> {new Date(post.publishedAt).toLocaleDateString()}
        </span>
      </div>

      {(post.coverImage ?? "") !== "" && (
        <div className="rounded-2xl overflow-hidden mb-8 bg-surface-raised">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage} alt={post.title} className="w-full h-auto object-cover" />
        </div>
      )}

      <div className="prose-article card p-6 sm:p-8">
        <ReactMarkdown
          components={{
            h1: (props) => <h1 className="text-2xl font-bold mt-6 mb-3 text-text-primary" {...props} />,
            h2: (props) => <h2 className="text-xl font-bold mt-6 mb-3 text-text-primary" {...props} />,
            h3: (props) => <h3 className="text-lg font-bold mt-5 mb-2 text-text-primary" {...props} />,
            p: (props) => <p className="text-text-secondary leading-relaxed my-3" {...props} />,
            ul: (props) => <ul className="list-disc pl-6 my-3 text-text-secondary space-y-1" {...props} />,
            ol: (props) => <ol className="list-decimal pl-6 my-3 text-text-secondary space-y-1" {...props} />,
            li: (props) => <li className="text-text-secondary" {...props} />,
            blockquote: (props) => (
              <blockquote className="border-l-4 border-accent-primary bg-surface-raised px-4 py-2 my-4 text-text-secondary italic" {...props} />
            ),
            code: (props) => (
              <code className="bg-surface-raised border border-card-border text-accent-primary px-1.5 py-0.5 rounded text-sm" {...props} />
            ),
            pre: (props) => (
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto my-4 text-sm" {...props} />
            ),
            a: (props) => <a className="text-accent-primary hover:underline" target="_blank" rel="noreferrer" {...props} />,
          }}
        >
          {post.content ?? ""}
        </ReactMarkdown>
      </div>

      {(post.tags?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {post.tags!.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 text-xs bg-surface-raised border border-card-border text-text-secondary px-3 py-1 rounded-full"
            >
              <Tag size={10} /> {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
