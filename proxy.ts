import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function slugifyUserName(value?: string | null) {
  return (
    value
      ?.normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/@.*$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "user"
  );
}

function getUserProfileBase(user: {
  email?: string | null;
  user_metadata?: Record<string, string | null | undefined>;
}) {
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    user?.user_metadata?.email;

  return `/profile/${slugifyUserName(displayName)}`;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  if (pathname === "/api/webhook-yoco") {
    const response = NextResponse.next();
    response.headers.set("X-Middleware-Skip", "webhook");
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role;
  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/brand-dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/protected");

  const isBrandRoute =
    pathname.startsWith("/brand-dashboard") ||
    pathname.startsWith("/protected/brand-dashboard");
  const isCustomerRoute =
    pathname.startsWith("/protected/profile") || pathname.startsWith("/profile");
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/protected/admin");

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/brands/login"

  if (
    user &&
    role === "super_admin" &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/protected/admin")
  ) {
    if (isProtectedRoute) {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }
  }

  if (isProtectedRoute && (!user || error)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && pathname.startsWith("/protected/profile")) {
    const suffix = pathname.replace(/^\/protected\/profile/, "");
    return NextResponse.redirect(
      new URL(`${getUserProfileBase(user)}${suffix}`, request.url)
    );
  }

  if (user && pathname.startsWith("/protected/brand-dashboard")) {
    const suffix = pathname.replace(/^\/protected\/brand-dashboard/, "");
    return NextResponse.redirect(new URL(`/brand-dashboard${suffix}`, request.url));
  }

  if (user && pathname.startsWith("/protected/admin")) {
    const suffix = pathname.replace(/^\/protected\/admin/, "");
    return NextResponse.redirect(new URL(`/admin${suffix}`, request.url));
  }

  if (user && role === "brand" && isCustomerRoute) {
    return NextResponse.redirect(
      new URL("/brand-dashboard", request.url)
    );
  }

  if (user && role !== "brand" && isBrandRoute) {
    return NextResponse.redirect(new URL(getUserProfileBase(user), request.url));
  }

  if (user && isAdminRoute && role !== "super_admin") {
    return NextResponse.redirect(new URL(getUserProfileBase(user), request.url));
  }

  if (user && isAuthRoute) {
    if (role === "brand") {
      return NextResponse.redirect(
        new URL("/brand-dashboard", request.url)
      );
    }

    if (role === "super_admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.redirect(new URL(getUserProfileBase(user), request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/protected/:path*",
    "/admin/:path*",
    "/brand-dashboard/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
    "/brands/login",
    "/api/webhook-yoco",
  ],
};
