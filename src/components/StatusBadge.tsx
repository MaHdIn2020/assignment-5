// StatusBadge — maps RequestStatus / PaymentStatus strings to styled pills.
// Add new statuses here and they'll be reflected everywhere automatically.

import type { RequestStatus, PaymentStatus } from "@/types";

type Status = RequestStatus | PaymentStatus;

const MAP: Record<Status, string> = {
  PENDING: "badge badge-pending",
  APPROVED: "badge badge-approved",
  REJECTED: "badge badge-rejected",
  ACTIVE: "badge badge-active",      // not in Prisma enum but useful as UI label
  COMPLETED: "badge badge-completed", // same — for future use
  SUCCEEDED: "badge badge-succeeded",
  FAILED: "badge badge-failed",
  REFUNDED: "badge badge-refunded",
};

interface Props {
  status: Status;
}

export function StatusBadge({ status }: Props) {
  return <span className={MAP[status] ?? "badge badge-completed"}>{status}</span>;
}
