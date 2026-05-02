import { supabaseAdmin } from "@/lib/supebase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, status } = await req.json();

  if (!id || !status) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const { data: application, error: fetchError } = await supabaseAdmin
    .from("brand_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !application) {
    return NextResponse.json(
      { error: fetchError?.message || "Application not found" },
      { status: 404 }
    );
  }

  const { error: updateError } = await supabaseAdmin
    .from("brand_applications")
    .update({ status })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (status === "approved") {
    const { data: brand, error: brandError } = await supabaseAdmin
      .from("brands")
      .insert({
        application_id: application.id,
        name: application.brand_name,
        owner_name: application.owner_name,
        email: application.email,
        phone: application.phone,
        instagram: application.instagram,
        plan: application.plan,
        status: "active",
      })
      .select()
      .single();

    if (brandError) {
      return NextResponse.json({ error: brandError.message }, { status: 500 });
    }

    const { data: createdUser, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email: application.email,
        email_confirm: true,
        user_metadata: {
          role: "brand",
          brand_id: brand.id,
          brand_name: application.brand_name,
        },
      });

    if (userError && !userError.message.includes("already registered")) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    const { error: resetError } =
      await supabaseAdmin.auth.resetPasswordForEmail(application.email, {
       redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
      });

    if (resetError) {
      return NextResponse.json({ error: resetError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}