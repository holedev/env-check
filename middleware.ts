import type { NextRequest } from "next/server";

export async function middleware(_request: NextRequest) {}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png|favicon.svg|icons|manifest).*)"]
};
