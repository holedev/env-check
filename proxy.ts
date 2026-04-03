import type { NextRequest } from "next/server";

export async function proxy(_request: NextRequest) {
  // This is a placeholder for the proxy function. You can implement your proxy logic here.
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png|favicon.svg|icons|manifest).*)"]
};
