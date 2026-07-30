"use client";
// Payment page — uses Stripe.js Elements to collect card details.
//
// FLOW:
// 1. On mount, call POST /api/payments/create-intent → get clientSecret
// 2. Render Stripe CardElement inside an Elements provider
// 3. On "Pay" click → stripe.confirmCardPayment(clientSecret)
// 4. If succeeded → call POST /api/payments/confirm → redirect to /payment/success
// 5. If failed → show error, redirect to /payment/cancel

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { api } from "@/lib/axios";
import toast from "react-hot-toast";
import { Lock, CreditCard } from "lucide-react";

// Load Stripe outside render to avoid re-creating the object on each render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// ── Inner payment form (must be inside <Elements>) ────────────────────────────
function PaymentForm({
  clientSecret,
  rentalRequestId,
  amount,
}: {
  clientSecret: string;
  rentalRequestId: string;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  async function handlePay() {
    if (!stripe || !elements) return;
    const cardEl = elements.getElement(CardElement);
    if (!cardEl) return;

    setLoading(true);
    setCardError(null);

    // Step 1: Confirm the payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: { card: cardEl } }
    );

    if (error) {
      setCardError(error.message ?? "Payment failed.");
      setLoading(false);
      router.push("/payment/cancel");
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // Step 2: Tell our backend to record the success
      try {
        await api.post("/api/payments/confirm", {
          rentalRequestId,
          paymentIntentId: paymentIntent.id,
        });
        toast.success("Payment successful! 🎉");
        router.push(`/payment/success?requestId=${rentalRequestId}`);
      } catch {
        toast.error("Payment succeeded but confirmation failed. Contact support.");
        router.push("/payment/success?requestId=" + rentalRequestId);
      }
    }
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      {/* Stripe Card Element */}
      <div>
        <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">
          Card Details
        </label>
        <div className="form-input">
          <CardElement
            options={{
              style: {
                base: {
                  color: "#f1f5f9",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  "::placeholder": { color: "#64748b" },
                },
                invalid: { color: "#ef4444" },
              },
            }}
            onChange={(e) => setCardError(e.error?.message ?? null)}
          />
        </div>
        {cardError && (
          <p className="text-red-400 text-xs mt-1">{cardError}</p>
        )}
      </div>

      {/* Test card hint */}
      <div className="text-xs text-slate-500 bg-slate-800/60 border border-slate-700/50 rounded-lg p-3">
        <p className="font-medium text-slate-400 mb-1">Test card:</p>
        <p>Card: 4242 4242 4242 4242</p>
        <p>Expiry: any future date · CVC: any 3 digits</p>
      </div>

      <button
        id="pay-now-btn"
        onClick={handlePay}
        disabled={loading || !stripe}
        className="btn-primary w-full justify-center py-3 text-base"
      >
        <Lock size={16} />
        {loading
          ? "Processing…"
          : `Pay ৳${amount.toLocaleString()}`}
      </button>

      <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
        <Lock size={11} /> Secured by Stripe — we never store your card details.
      </p>
    </div>
  );
}

// ── Page wrapper — fetches clientSecret, then mounts Elements ────────────────
function PayPageContent() {
  const { requestId } = useParams<{ requestId: string }>();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const { data } = await api.post("/api/payments/create-intent", {
          rentalRequestId: requestId,
        });
        setClientSecret(data.data.clientSecret);
        setAmount(data.data.amount);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Could not initialise payment.";
        setInitError(msg);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [requestId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-t-violet-500 animate-spin" />
          <p className="text-slate-400 text-sm">Initialising payment…</p>
        </div>
      </div>
    );
  }

  if (initError || !clientSecret) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="card-elevated p-8 max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-slate-300 font-medium">{initError ?? "Payment unavailable."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <CreditCard size={40} className="text-violet-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-100">Secure Payment</h1>
          <p className="text-slate-400 text-sm mt-1">
            Amount due:{" "}
            <span className="text-violet-400 font-semibold">
              ৳{amount.toLocaleString()}
            </span>
          </p>
        </div>

        <div className="card p-8">
          {/* Elements requires clientSecret to know which PaymentIntent to use */}
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm
              clientSecret={clientSecret}
              rentalRequestId={requestId}
              amount={amount}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <PayPageContent />
    </Suspense>
  );
}
