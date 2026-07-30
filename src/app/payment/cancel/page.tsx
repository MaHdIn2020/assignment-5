import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass-card p-12 max-w-md text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
          <XCircle size={40} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Payment Cancelled</h1>
          <p className="text-slate-400 text-sm mt-2">
            Your payment was not completed. No charges have been made. You can try again from your dashboard.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard/tenant" className="btn-gradient inline-flex">
            Back to Dashboard
          </Link>
          <Link href="/properties" className="btn-outline inline-flex">
            Browse More
          </Link>
        </div>
      </div>
    </div>
  );
}
