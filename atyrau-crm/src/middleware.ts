import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define allowed paths by role
const publicPaths = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
];

const clientPaths = ["/bookings", "/profile", ...publicPaths];

const businessPaths = [
  "/dashboard",
  "/appointments",
  "/services",
  "/clients",
  "/settings",
  ...clientPaths,
];

const adminPaths = ["/admin", ...businessPaths];

const pathsByRole: Record<string, string[]> = {
  client: clientPaths,
  business: businessPaths,
  admin: adminPaths,
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Always allow public assets
  if (pathname.startsWith("/_next/") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token = await getToken({ req: request });

  // Allow access to public paths regardless of authentication
  if (
    publicPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    )
  ) {
    // Redirect authenticated users away from auth pages
    if (
      token &&
      (pathname === "/auth/signin" ||
        pathname === "/auth/signup" ||
        pathname === "/auth/forgot-password" ||
        pathname === "/auth/reset-password")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // No token means user is not authenticated
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  const userRole = (token.role as string) || "client";
  const allowedPaths = pathsByRole[userRole] || clientPaths;

  // Check if the user is allowed to access the current path
  if (
    !allowedPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    )
  ) {
    // Redirect to appropriate landing page based on role
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else if (userRole === "business") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

