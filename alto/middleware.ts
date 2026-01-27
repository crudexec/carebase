import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const access_token = cookies().get("auth")?.value;
  const refresh_token = cookies().get("refresh")?.value;
  const pathname = request.nextUrl.pathname;

  // List of public paths that don't require authentication
  const publicPaths = ["/login", "/select-provider"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // List of API routes that should be excluded from middleware
  const isApiRoute = pathname.startsWith("/api/");
  const isStaticAsset =
    pathname.startsWith("/_next/") || pathname.startsWith("/favicon.ico");

  // Skip middleware for API routes and static assets
  if (isApiRoute || isStaticAsset) {
    return response;
  }

  // Allow access to testing homepage and protected routes for performance testing
  const isTestingHomepage = pathname === "/";

  // Redirect to login if no tokens and trying to access protected route (except testing homepage)
  if (!access_token && !refresh_token && !isPublicPath && !isTestingHomepage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Don't redirect authenticated users away from login if they have the action param
  const hasActionParam = request.nextUrl.searchParams.has("action");
  if (
    (access_token || refresh_token) &&
    pathname === "/login" &&
    !hasActionParam
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard"; // Redirect to dashboard instead of testing homepage
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
