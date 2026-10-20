import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supebase/server";
import { supabaseAdmin } from "@/lib/supebase/admin";

export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const auth = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await auth.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Sign in to view your payment." }, { status: 401 });
  const { orderId } = await params;
  const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
  if (!isId && !/^(VIL|ORD)-[a-zA-Z0-9-]{1,80}$/.test(orderId)) return NextResponse.json({ error: "Invalid order reference." }, { status: 400 });
  const { data: order, error } = await supabaseAdmin.from("orders")
    .select("id,order_id,total,payment_status,order_status,status,shipping_method,shipping_address,pickup_location,metadata")
    .eq(isId ? "id" : "order_id", orderId).eq("customer_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "Could not load payment status." }, { status: 500 });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json(order, { headers: { "Cache-Control": "private, no-store" } });
}
