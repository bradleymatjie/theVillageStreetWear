import { NextResponse } from "next/server";

// Legacy callers must use the authenticated checkout flow. Payment cannot be
// marked successful by creating an order from a browser-supplied payload.
export async function POST() {
  return NextResponse.json({ error: "Use /api/yoco/create-checkout to create a pending order and start payment." }, { status: 410 });
}
