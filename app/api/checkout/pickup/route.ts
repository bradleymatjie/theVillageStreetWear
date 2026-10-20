import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supebase/admin";

/** Only the brand's public collection details are exposed, never contact/account data. */
export async function GET(request: Request) {
  const productId = new URL(request.url).searchParams.get("productId");
  if (!productId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)) return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  const headers = { "Cache-Control": "no-store" };
  const { data: product, error: productError } = await supabaseAdmin.from("thevillageproducts").select("brand_id").eq("id", productId).maybeSingle();
  if (productError) return NextResponse.json({ error: "Could not check pickup availability." }, { status: 503 });
  if (!product) return NextResponse.json({ error: "Product no longer available." }, { status: 404 });
  if (!product.brand_id) return NextResponse.json({ pickup: null }, { headers });
  const { data: brand, error } = await supabaseAdmin.from("brands").select("name,street_address,location_city,location_province,location_country").eq("id", product.brand_id).maybeSingle();
  if (error) return NextResponse.json({ error: "Could not load the brand's pickup address." }, { status: 503 });
  if (!brand?.street_address?.trim() || !brand.location_city?.trim() || !brand.location_province?.trim()) return NextResponse.json({ pickup: null }, { headers });
  return NextResponse.json({ pickup: { brandName: brand.name, address: brand.street_address.trim(), city: brand.location_city.trim(), province: brand.location_province.trim(), country: brand.location_country?.trim() || null } }, { headers });
}
