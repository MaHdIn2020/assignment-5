"use client";
// /dashboard/admin/blog — manage blog posts (create, publish/unpublish, delete).

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { BlogPost } from "@/types";
import { DataTable, type Column } from "@/components/DataTable";
import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

async function fetchPosts(): Promise<{ posts: BlogPost[] }> {
  const { data } = await api.get<{ data: BlogPost[] }>("/api/blog/admin/all?limit=50");
  return { posts: data.data };
}

const postSchema = z.object({
  title: z.string().min(3, "Title is required (min 3 chars)"),
  excerpt: z.string().min(10, "Excerpt is required (min 10 chars)"),
  content: z.string().min(20, "Content is required (min 20 chars)"),
  coverImage: z.string().url("Enter a valid image URL").or(z.literal("")),
  tags: z.string().optional(),
  isPublished: z.boolean(),
});
type PostForm = z.infer<typeof postSchema>;

const emptyForm: PostForm = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  tags: "",
  isPublished: true,
};

export default function AdminBlogPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["adminBlogPosts"],
    queryFn: fetchPosts,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostForm>({ resolver: zodResolver(postSchema), defaultValues: emptyForm });

  const saveMutation = useMutation({
    mutationFn: (vals: PostForm) => {
      const payload = {
        ...vals,
        tags: vals.tags
          ? vals.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };
      return editing
        ? api.patch(`/api/blog/${editing.id}`, payload)
        : api.post("/api/blog", payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Blog post updated." : "Blog post created.");
      setShowCreate(false);
      setEditing(null);
      reset(emptyForm);
      qc.invalidateQueries({ queryKey: ["adminBlogPosts"] });
      qc.invalidateQueries({ queryKey: ["latestBlog"] });
    },
    onError: () => toast.error("Failed to save blog post."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/blog/${id}`),
    onSuccess: () => {
      toast.success("Blog post deleted.");
      qc.invalidateQueries({ queryKey: ["adminBlogPosts"] });
      qc.invalidateQueries({ queryKey: ["latestBlog"] });
    },
    onError: () => toast.error("Failed to delete blog post."),
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      api.patch(`/api/blog/${id}`, { isPublished }),
    onSuccess: () => {
      toast.success("Publish status updated.");
      qc.invalidateQueries({ queryKey: ["adminBlogPosts"] });
      qc.invalidateQueries({ queryKey: ["latestBlog"] });
    },
    onError: () => toast.error("Failed to update publish status."),
  });

  function openCreate() {
    setEditing(null);
    reset(emptyForm);
    setShowCreate(true);
  }

  function openEdit(post: BlogPost) {
    setEditing(post);
    reset({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content ?? "",
      coverImage: post.coverImage ?? "",
      tags: (post.tags ?? []).join(", "),
      isPublished: post.isPublished ?? true,
    });
    setShowCreate(true);
  }

  function onSave(vals: PostForm) {
    saveMutation.mutate(vals);
  }

  const columns: Column<BlogPost>[] = [
    {
      key: "title",
      header: "Title",
      render: (p) => (
        <div>
          <p className="text-sm font-medium text-text-primary line-clamp-1">{p.title}</p>
          <p className="text-xs text-text-muted">/{p.slug}</p>
        </div>
      ),
    },
    {
      key: "author",
      header: "Author",
      render: (p) => (
        <span className="text-sm text-text-secondary">{p.author?.name ?? "—"}</span>
      ),
    },
    {
      key: "publishedAt",
      header: "Date",
      render: (p) => (
        <span className="text-sm text-text-muted">
          {new Date(p.publishedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) =>
        p.isPublished ? (
          <span className="badge badge-active">Published</span>
        ) : (
          <span className="badge badge-pending">Draft</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div className="flex gap-2">
          <Link
            href={`/blog/${p.slug}`}
            className="btn-secondary btn-sm"
            id={`view-post-${p.id}`}
          >
            <Eye size={11} /> View
          </Link>
          <button
            onClick={() => togglePublishMutation.mutate({ id: p.id, isPublished: !p.isPublished })}
            className="btn-secondary btn-sm"
            id={`toggle-post-${p.id}`}
          >
            {p.isPublished ? <EyeOff size={11} /> : <Eye size={11} />}
            {p.isPublished ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={() => openEdit(p)}
            className="btn-secondary btn-sm"
            id={`edit-post-${p.id}`}
          >
            <Pencil size={11} /> Edit
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this blog post?")) deleteMutation.mutate(p.id);
            }}
            className="btn-danger btn-sm"
            id={`delete-post-${p.id}`}
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Blog <span className="gradient-text">Posts</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Create, edit and publish articles
          </p>
        </div>
        <button className="btn-primary btn-sm" onClick={openCreate} id="create-post-btn">
          <Plus size={16} /> New Post
        </button>
      </div>

      <div className="card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.posts ?? []}
          keyField="id"
          loading={isLoading}
          empty={
            <div className="p-12 text-center">
              <FileText size={36} className="text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No blog posts yet.</p>
            </div>
          }
        />
      </div>

      {/* ── Create / Edit modal ──────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="card-elevated p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-text-primary text-lg">
                {editing ? "Edit Blog Post" : "Create Blog Post"}
              </h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSave)} noValidate className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                  Title *
                </label>
                <input className="form-input" {...register("title")} id="post-title" />
                {errors.title && (
                  <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                  Excerpt *
                </label>
                <input className="form-input" {...register("excerpt")} id="post-excerpt" />
                {errors.excerpt && (
                  <p className="text-red-400 text-xs mt-1">{errors.excerpt.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                  Content *
                </label>
                <textarea
                  rows={8}
                  className="form-input resize-y font-mono text-sm"
                  placeholder={"Write your article in Markdown…"}
                  {...register("content")}
                  id="post-content"
                />
                {errors.content && (
                  <p className="text-red-400 text-xs mt-1">{errors.content.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                    Cover Image URL
                  </label>
                  <input
                    className="form-input"
                    placeholder="https://…"
                    {...register("coverImage")}
                    id="post-cover"
                  />
                  {errors.coverImage && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.coverImage.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                    Tags (comma separated)
                  </label>
                  <input
                    className="form-input"
                    placeholder="tips, dhaka, budget"
                    {...register("tags")}
                    id="post-tags"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  className="accent-violet-600 h-4 w-4"
                  {...register("isPublished")}
                  id="post-published"
                />
                Publish immediately
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="btn-primary flex-1 justify-center"
                  id="save-post-btn"
                >
                  {saveMutation.isPending ? "Saving…" : editing ? "Save Changes" : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
