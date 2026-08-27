import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supebase/admin";

const PROFILE_FIELDS = [
  "tagline",
  "story",
  "street_address",
  "location_city",
  "location_province",
  "location_country",
  "instagram",
  "tiktok",
  "founded_year",
  "style_category",
  "logo_url",
  "cover_image_url",
] as const;

type ProfileField = (typeof PROFILE_FIELDS)[number];
type ProfilePayload = Partial<Record<ProfileField, string | null>>;

function normalizePayload(body: unknown): ProfilePayload {
  if (!body || typeof body !== "object") return {};

  return PROFILE_FIELDS.reduce<ProfilePayload>((payload, field) => {
    const value = (body as Record<string, unknown>)[field];

    if (value === null) {
      payload[field] = null;
    } else if (typeof value === "string") {
      payload[field] = value.trim() || null;
    }

    return payload;
  }, {});
}

export async function PATCH(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json(
      { error: userError?.message || "Not authenticated" },
      { status: 401 }
    );
  }

  if (user.user_metadata?.role !== "brand") {
    return NextResponse.json(
      { error: "Only brand accounts can update brand profiles." },
      { status: 403 }
    );
  }

  const { data: brand, error: brandError } = await supabaseAdmin
    .from("brands")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (brandError || !brand) {
    return NextResponse.json(
      { error: brandError?.message || "Brand profile could not be found." },
      { status: 404 }
    );
  }

  const payload = normalizePayload(await req.json());

  const { data: updatedBrand, error: updateError } = await supabaseAdmin
    .from("brands")
    .update(payload)
    .eq("id", brand.id)
    .select("*")
    .single();

  if (updateError || !updatedBrand) {
    return NextResponse.json(
      { error: updateError?.message || "Brand profile could not be saved." },
      { status: 500 }
    );
  }

  return NextResponse.json({ brand: updatedBrand });
}
