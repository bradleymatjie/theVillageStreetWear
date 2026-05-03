import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
    pathname.startsWith("/protected") || pathname.startsWith("/profile");

  const isBrandRoute = pathname.startsWith("/protected/brand-dashboard");
  const isCustomerRoute = pathname.startsWith("/protected/profile");
  const isAdminRoute = pathname.startsWith("/protected/admin");

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/brands/login"

  if (user && role === "super_admin" && !pathname.startsWith("/protected/admin")) {
    if (pathname.startsWith("/protected")) {
      return NextResponse.redirect(
        new URL("/protected/admin", request.url)
      );
    }
  }

  if (isProtectedRoute && (!user || error)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && role === "brand" && isCustomerRoute) {
    return NextResponse.redirect(
      new URL("/protected/brand-dashboard", request.url)
    );
  }

  if (user && role !== "brand" && isBrandRoute) {
    return NextResponse.redirect(new URL("/protected/profile", request.url));
  }

  if (user && isAdminRoute && role !== "super_admin") {
    return NextResponse.redirect(new URL("/protected/profile", request.url));
  }

  if (user && isAuthRoute) {
    if (role === "brand") {
      return NextResponse.redirect(
        new URL("/protected/brand-dashboard", request.url)
      );
    }

    if (role === "super_admin") {
      return NextResponse.redirect(new URL("/protected/admin", request.url));
    }

    return NextResponse.redirect(new URL("/protected/profile", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/protected/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
    "/brands/login",
    "/api/webhook-yoco",
  ],
};