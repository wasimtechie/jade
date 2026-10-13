import { NextResponse, type NextRequest } from "next/server";

import { getToken } from "next-auth/jwt";

import { getClientIpFromHeaders, rateLimit } from "@/lib/rateLimit";

import {

  canAccess,

  defaultDashboardHome,

  resolveApiPermission,

  roleMeetsAccess,

  type Role,

} from "@/lib/auth/permissions";



const noStoreJsonHeaders = { "Cache-Control": "no-store" } as const;

function securityHeaders(res: NextResponse): NextResponse {

  res.headers.set("Cross-Origin-Resource-Policy", "same-site");

  res.headers.set("X-DNS-Prefetch-Control", "off");

  return res;

}



function authDenied(

  status: 401 | 403 | 405,

  body: Record<string, string>,

): NextResponse {

  return NextResponse.json(body, {

    status,

    headers: noStoreJsonHeaders,

  });

}



async function readToken(request: NextRequest) {

  return getToken({

    req: request,

    secret: process.env.NEXTAUTH_SECRET,

    secureCookie: process.env.NODE_ENV === "production",

  });

}



export async function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl;

  const method = request.method.toUpperCase();



  if (pathname.startsWith("/dashboard")) {

    const token = await readToken(request);

    const role = token?.role as Role | undefined;



    if (!token?.uid || token.active === false || !role) {

      const login = new URL("/login", request.url);

      if (token?.active === false) {

        login.searchParams.set("error", "suspended");

      } else {

        login.searchParams.set("next", pathname);

      }

      return NextResponse.redirect(login);

    }



    if (canAccess(pathname, role) === "none") {

      const fallback = defaultDashboardHome(role);

      const normalized = pathname.replace(/\/+$/, "") || "/dashboard";

      const fallbackNorm = fallback.replace(/\/+$/, "");

      if (fallback === "/login" || normalized === fallbackNorm) {

        const login = new URL("/login", request.url);

        login.searchParams.set("error", "forbidden");

        return NextResponse.redirect(login);

      }

      return NextResponse.redirect(new URL(fallback, request.url));

    }



    const res = NextResponse.next();

    res.headers.set("X-Robots-Tag", "noindex, nofollow");

    return securityHeaders(res);

  }



  if (pathname.startsWith("/api/")) {
    // Auth/session routes are public — handlers enforce their own rules.
    if (pathname.startsWith("/api/auth/")) {
      return securityHeaders(NextResponse.next());
    }

    if (

      !["GET", "POST", "HEAD", "OPTIONS", "PATCH", "DELETE"].includes(method)

    ) {

      return authDenied(405, { error: "Method not allowed" });

    }



    if (method === "OPTIONS") {

      return new NextResponse(null, { status: 204, headers: noStoreJsonHeaders });

    }



    const ip =

      request.ip ?? getClientIpFromHeaders(request.headers) ?? "unknown";

    const rl = rateLimit({

      key: `edge:api:${ip}`,

      limit: 600,

      windowMs: 60_000,

    });



    if (!rl.ok) {

      return NextResponse.json(

        { error: "Too many requests" },

        {

          status: 429,

          headers: {

            ...noStoreJsonHeaders,

            "Retry-After": String(rl.retryAfterSeconds),

          },

        },

      );

    }



    const apiPerm = resolveApiPermission(
      pathname,
      method,
      request.nextUrl.search,
    );

    if (apiPerm) {

      const token = await readToken(request);

      const role = token?.role as Role | undefined;



      if (!token?.uid || token.active === false || !role) {

        return authDenied(401, {

          error: "Unauthorized",

          code:

            token?.active === false ? "ACCOUNT_SUSPENDED" : "UNAUTHENTICATED",

        });

      }



      if (!roleMeetsAccess(apiPerm.permPath, role, apiPerm.min)) {

        return authDenied(403, { error: "Forbidden", code: "FORBIDDEN" });

      }

    }



    return securityHeaders(NextResponse.next());

  }

  return NextResponse.next();
}



export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};


