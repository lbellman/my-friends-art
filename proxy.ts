import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { tokens } from "@/config";

const MAINTENANCE = process.env.MAINTENANCE_MODE === "true";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (MAINTENANCE) {
    if (pathname === "/maintenance") {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "Service Unavailable" }), {
        status: 503,
        headers: {
          "content-type": "application/json",
        },
      });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    tokens.supabaseUrl,
    tokens.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            response.cookies.set(name, value)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
