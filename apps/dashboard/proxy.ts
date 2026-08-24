import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/login", "/signup"]);

/**
 * Fast, cookie-only gate for page requests. Database validation happens in
 * protected layouts, where it is safe to use the full Prisma client.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname) || request.cookies.has("gecco_session")) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
