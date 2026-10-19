import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getUserProfileBase } from "@/app/lib/profileRoutes";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  function redirect(url: URL) {
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

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
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // Forward refreshed cookies to both server rendering and the browser.
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
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
      return redirect(
        new URL("/admin", request.url)
      );
    }
  }

  if (isProtectedRoute && (!user || error)) {
    return redirect(new URL("/login", request.url));
  }

  if (user && pathname.startsWith("/protected/profile")) {
    const suffix = pathname.replace(/^\/protected\/profile/, "");
    return redirect(
      new URL(`${getUserProfileBase(user)}${suffix}`, request.url)
    );
  }

  if (user && pathname.startsWith("/protected/brand-dashboard")) {
    const suffix = pathname.replace(/^\/protected\/brand-dashboard/, "");
    return redirect(new URL(`/brand-dashboard${suffix}`, request.url));
  }

  if (user && pathname.startsWith("/protected/admin")) {
    const suffix = pathname.replace(/^\/protected\/admin/, "");
    return redirect(new URL(`/admin${suffix}`, request.url));
  }

  if (user && role === "brand" && isCustomerRoute) {
    return redirect(
      new URL("/brand-dashboard", request.url)
    );
  }

  if (user && role !== "brand" && isBrandRoute) {
    return redirect(new URL(getUserProfileBase(user), request.url));
  }

  if (user && isAdminRoute && role !== "super_admin") {
    return redirect(new URL(getUserProfileBase(user), request.url));
  }

  if (user && !error && (pathname === "/" || isAuthRoute)) {
    if (role === "brand") {
      return redirect(
        new URL("/brand-dashboard", request.url)
      );
    }

    if (role === "super_admin") {
      return redirect(new URL("/admin", request.url));
    }

    return redirect(new URL(getUserProfileBase(user), request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
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
