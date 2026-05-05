import { supabaseAdmin } from "@/lib/supebase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
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
        { step: "fetch_application", error: fetchError?.message || "Application not found" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("brand_applications")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { step: "update_application", error: updateError.message },
        { status: 500 }
      );
    }

    if (status !== "approved") {
      return NextResponse.json({ success: true });
    }

    const { data: brand, error: brandError } = await supabaseAdmin
      .from("brands")
      .upsert(
        {
          application_id: application.id,
          name: application.brand_name,
          owner_name: application.owner_name,
          email: application.email,
          phone: application.phone,
          instagram: application.instagram,
          plan: application.plan,
          status: "active",
        },
        { onConflict: "application_id" }
      )
      .select()
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { step: "upsert_brand", error: brandError?.message || "Brand could not be created" },
        { status: 500 }
      );
    }

    let userId: string | null = null;

    const { data: createdUser, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email: application.email,
        email_confirm: true,
        user_metadata: {
          role: "brand",
          brand_id: brand.id,
          brand_name: brand.name,
        },
      });

    if (createUserError) {
      const alreadyExists =
        createUserError.message.toLowerCase().includes("already") ||
        createUserError.message.toLowerCase().includes("registered");

      if (!alreadyExists) {
        return NextResponse.json(
          { step: "create_user", error: createUserError.message },
          { status: 500 }
        );
      }

      const { data: usersData, error: listUsersError } =
        await supabaseAdmin.auth.admin.listUsers();
      
      if (listUsersError) {
        return NextResponse.json(
          { step: "list_users", error: listUsersError.message },
          { status: 500 }
        );
      }

      const existingUser = usersData.users.find(
        (user) =>
          user.email?.toLowerCase() === application.email.toLowerCase()
      );

      if (!existingUser) {
        return NextResponse.json(
          {
            step: "find_existing_user",
            error: "User already exists but could not be found",
          },
          { status: 500 }
        );
      }

      userId = existingUser.id;
    } else {
      userId = createdUser.user.id;
    }

    const { error: updateUserError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          role: "brand",
          brand_id: brand.id,
          brand_name: brand.name,
        },
      });

    if (updateUserError) {
      return NextResponse.json(
        { step: "update_user_metadata", error: updateUserError.message },
        { status: 500 }
      );
    }

    const { error: brandUserError } = await supabaseAdmin
      .from("brands")
      .update({ user_id: userId })
      .eq("id", brand.id);

    if (brandUserError) {
      return NextResponse.json(
        { step: "update_brand_user_id", error: brandUserError.message },
        { status: 500 }
      );
    }

    const { error: resetError } =
      await supabaseAdmin.auth.resetPasswordForEmail(application.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
      });

    if (resetError) {
      return NextResponse.json(
        { step: "send_reset_email", error: resetError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      brand_id: brand.id,
      user_id: userId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        step: "catch",
        error: error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 }
    );
  }
}