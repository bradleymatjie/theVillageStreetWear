"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Clock3, Loader2, XCircle } from "lucide-react";
import { useCartStore } from "@/app/lib/cartStore";
import { useUser } from "@/app/lib/user";
import { getUserProfileBase, joinProfilePath } from "@/app/lib/profileRoutes";
import { paymentState, purchasedCartItems } from "@/app/lib/payment-status";

type Order = { id: string; order_id: string; total: number; payment_status: string; order_status: string; status: string; shipping_method: string; shipping_address: string; pickup_location: string; metadata?: { cartItems?: unknown } };
type Result = { reference: string | null; order: Order | null; error: string | null; loading: boolean; timedOut: boolean; needsSignIn: boolean };
const action = "inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-theme-ink/20 px-5 text-sm font-bold transition hover:bg-theme-ink/5";

function SuccessContent() {
  const params = useSearchParams();
  const reference = params.get("order_id") || params.get("orderNumber");
  const { user } = useUser();
  const profileBase = getUserProfileBase(user);
  const reconcilePaidOrder = useCartStore(state => state.reconcilePaidOrder);
  const hydrated = useCartStore(state => state.hasHydrated);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<Result>({ reference: null, order: null, error: null, loading: true, timedOut: false, needsSignIn: false });

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    let attempts = 0;
    async function checkPayment() {
      try {
        const response = await fetch(`/api/yoco/orders/${encodeURIComponent(reference!)}`, { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setResult({ reference, order: null, error: response.status === 401 ? "Sign in to view your payment status." : response.status === 404 ? "We could not find this order in your account." : "Could not check payment status. Please try again.", loading: false, timedOut: false, needsSignIn: response.status === 401 });
          return;
        }
        attempts += 1;
        const pending = paymentState(data.payment_status) === "pending";
        setResult({ reference, order: data, error: null, loading: false, timedOut: pending && attempts >= 40, needsSignIn: false });
        if (pending && attempts < 40) timer = setTimeout(checkPayment, 3000);
      } catch {
        if (!cancelled) setResult({ reference, order: null, error: "Could not connect to check your payment. Your cart has been kept.", loading: false, timedOut: false, needsSignIn: false });
      }
    }
    void checkPayment();
    return () => { cancelled = true; controller.abort(); if (timer) clearTimeout(timer); };
  }, [reference, retry]);

  const current = result.reference === reference;
  const order = current ? result.order : null;
  const state = paymentState(order?.payment_status);
  useEffect(() => {
    if (hydrated && order && paymentState(order.payment_status) === "paid") {
      reconcilePaidOrder(order.id, purchasedCartItems(order.metadata?.cartItems));
    }
  }, [hydrated, order, reconcilePaidOrder]);

  const loading = Boolean(reference && (!current || result.loading));
  const error = !reference ? "No order reference was found. Return to checkout or open your orders." : current ? result.error : null;
  const title = !reference ? "Missing order reference" : loading ? "Checking your payment" : error ? "Payment status unavailable" : state === "paid" ? "Payment successful" : state === "failed" ? "Payment not completed" : "Confirming your payment";
  const Icon = loading ? Loader2 : error || state === "failed" ? XCircle : state === "paid" ? CheckCircle : Clock3;
  const message = loading ? "Please wait while we check your order." : error || (state === "paid" ? "Your payment is confirmed. Thank you for shopping with The Village." : state === "failed" ? "Your payment was unsuccessful or cancelled. Your cart is ready when you want to try again." : result.timedOut ? "Confirmation is taking longer than expected. Your cart is safe. Check again or contact support before making another payment." : "We are waiting for payment confirmation. This page updates automatically. Your cart will stay intact until payment is confirmed.");

  return <main className="flex min-h-[70vh] items-center justify-center bg-theme-base px-4 py-10 text-theme-ink">
    <div className="w-full max-w-xl rounded-2xl border border-theme-ink/10 bg-theme-ink/[0.03] p-6 text-center sm:p-8">
      <Icon aria-hidden="true" className={`mx-auto mb-5 h-12 w-12 ${loading ? "animate-spin" : ""}`} />
      <h1 className="text-3xl font-black">{title}</h1>
      <p role={error ? "alert" : "status"} className="mt-3 text-sm leading-6 text-theme-muted">{message}</p>
      {order && <dl className="mt-6 space-y-3 rounded-xl border border-theme-ink/10 bg-theme-base p-4 text-left text-sm">
        <div className="flex flex-wrap justify-between gap-2"><dt className="text-theme-muted">Order number</dt><dd className="break-all font-semibold">{order.order_id}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-theme-muted">Total</dt><dd className="font-semibold">R{Number(order.total).toFixed(2)}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-theme-muted">Payment</dt><dd className="font-semibold capitalize">{order.payment_status}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-theme-muted">Fulfilment</dt><dd className="font-semibold capitalize">{order.shipping_method}</dd></div>
        <div><dt className="text-theme-muted">{order.shipping_method === "pickup" ? "Pickup location" : "Delivery address"}</dt><dd className="mt-1 break-words font-medium">{order.shipping_method === "pickup" ? order.pickup_location : order.shipping_address}</dd></div>
      </dl>}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {current && result.needsSignIn ? <Link href="/login" className={action}>Sign in</Link> : order && state === "paid" ? <Link href={user ? joinProfilePath(profileBase, "orders") : "/login"} className={`${action} bg-theme-ink text-theme-base hover:bg-theme-ink/85`}>View my orders</Link> : reference && !loading && <button type="button" onClick={() => { setResult(previous => ({ ...previous, loading: true })); setRetry(value => value + 1); }} className={action}>Check payment again</button>}
        {(!order || state === "failed") && <Link href="/checkout" className={action}>Back to checkout</Link>}
        {order && state === "paid" && <Link href="/products" className={action}>Continue shopping</Link>}
      </div>
      <Link href="/contact" className="mt-5 inline-block text-xs font-semibold text-theme-muted underline underline-offset-4">Need help? Contact support</Link>
    </div>
  </main>;
}

export default function SuccessPage() {
  return <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center bg-theme-base text-theme-ink"><Loader2 className="h-5 w-5 animate-spin" aria-label="Checking payment" /></div>}><SuccessContent /></Suspense>;
}
