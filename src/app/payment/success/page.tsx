"use client";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass-card p-12 max-w-md text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Payment Successful! 🎉</h1>
          <p className="text-slate-400 text-sm mt-2">
            Your payment has been processed. The landlord will confirm your move-in shortly.
          </p>
        </div>
        {requestId && (
          <p className="text-xs text-slate-600">Request ID: {requestId}</p>
        )}
        <Link href="/dashboard/tenant" className="btn-gradient inline-flex">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <SuccessContent />
    </Suspense>
  );
}
