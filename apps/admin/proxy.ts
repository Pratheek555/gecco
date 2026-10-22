import { NextRequest, NextResponse } from "next/server";

/**
 * Cookie-only gate: no HQ cookie, no console. The signature, expiry and staff allowlist are checked
 * on the server in every layout and action (lib/auth.ts); this only saves a render for strangers.
 */
export function proxy(request: NextRequest) {
  if (process.env.ADMIN_SAMPLE_DATA === "1" && process.env.NODE_ENV !== "production") return NextResponse.next();
  if (request.nextUrl.pathname === "/login" || request.cookies.has("gecco_hq")) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
