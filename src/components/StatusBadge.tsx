import type { RequestStatus, PaymentStatus } from "@/types";

type Status = RequestStatus | PaymentStatus;

// Use a Partial record so we can add extra UI-only keys without TS complaining
const MAP: Partial<Record<string, string>> = {
  PENDING:   "badge badge-pending",
  APPROVED:  "badge badge-approved",
  REJECTED:  "badge badge-rejected",
  SUCCEEDED: "badge badge-succeeded",
  FAILED:    "badge badge-failed",
  REFUNDED:  "badge badge-refunded",
};

interface Props {
  status: Status;
}

export function StatusBadge({ status }: Props) {
  return (
    <span className={MAP[status] ?? "badge badge-completed"}>{status}</span>
  );
}
