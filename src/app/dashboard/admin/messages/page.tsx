"use client";
// /dashboard/admin/messages — contact form submissions (view, mark replied).

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ContactMessage } from "@/types";
import { DataTable, type Column } from "@/components/DataTable";
import { useState } from "react";
import toast from "react-hot-toast";
import { MessageSquare, MailCheck, X } from "lucide-react";

async function fetchMessages(): Promise<{ messages: ContactMessage[]; total: number }> {
  const { data } = await api.get<{
    data: ContactMessage[];
    meta: { page: number; limit: number; total: number };
  }>("/api/contact?limit=50");
  return { messages: data.data, total: data.meta!.total };
}

export default function AdminMessagesPage() {
  const qc = useQueryClient();
  const [viewing, setViewing] = useState<ContactMessage | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["contactMessages"],
    queryFn: fetchMessages,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => api.patch(`/api/contact/${id}/status`, { status: "REPLIED" }),
    onSuccess: () => {
      toast.success("Marked as replied.");
      qc.invalidateQueries({ queryKey: ["contactMessages"] });
    },
    onError: () => toast.error("Failed to update status."),
  });

  const columns: Column<ContactMessage>[] = [
    {
      key: "name",
      header: "From",
      render: (m) => (
        <div>
          <p className="text-sm font-medium text-text-primary">{m.name}</p>
          <p className="text-xs text-text-muted">{m.email}</p>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (m) => (
        <span className="text-sm text-text-secondary line-clamp-1">{m.subject}</span>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (m) => (
        <span className="text-sm text-text-muted line-clamp-1">{m.message}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (m) =>
        m.status === "NEW" ? (
          <span className="badge badge-pending">New</span>
        ) : (
          <span className="badge badge-approved">Replied</span>
        ),
    },
    {
      key: "createdAt",
      header: "Received",
      render: (m) => (
        <span className="text-sm text-text-muted">
          {new Date(m.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (m) => (
        <div className="flex gap-2">
          <button
            onClick={() => setViewing(m)}
            className="btn-secondary btn-sm"
            id={`view-message-${m.id}`}
          >
            View
          </button>
          {m.status === "NEW" && (
            <button
              onClick={() => statusMutation.mutate({ id: m.id })}
              disabled={statusMutation.isPending}
              className="btn-secondary btn-sm"
              id={`reply-message-${m.id}`}
            >
              <MailCheck size={11} /> Mark Replied
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Contact <span className="gradient-text">Messages</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {data?.total ?? 0} submissions from the contact page
        </p>
      </div>

      <div className="card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.messages ?? []}
          keyField="id"
          loading={isLoading}
          empty={
            <div className="p-12 text-center">
              <MessageSquare size={36} className="text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No messages yet.</p>
            </div>
          }
        />
      </div>

      {/* ── View modal ────────────────────────────────────────────────────── */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="card-elevated p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-text-primary">{viewing.subject}</h2>
              <button
                onClick={() => setViewing(null)}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              From <span className="text-text-primary font-medium">{viewing.name}</span>{" "}
              &lt;{viewing.email}&gt;
            </p>
            <p className="text-sm text-text-secondary whitespace-pre-wrap bg-surface-raised rounded-lg p-4 border border-card-border">
              {viewing.message}
            </p>
            <div className="flex justify-end mt-5">
              {viewing.status === "NEW" ? (
                <button
                  onClick={() => {
                    statusMutation.mutate({ id: viewing.id });
                    setViewing(null);
                  }}
                  className="btn-primary"
                  id="mark-replied-modal-btn"
                >
                  <MailCheck size={14} /> Mark as Replied
                </button>
              ) : (
                <span className="badge badge-approved">Already replied</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
