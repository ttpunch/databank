import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Allow authentication-related routes
        if (
          pathname.includes("/api/auth") || // Allow NextAuth API routes
          pathname === "/login" || 
          pathname === "/register" ||
          pathname === "/upload"
        ) {
          return true;
        }

        // Public routes (e.g., homepage & API videos)
        if (pathname === "/" || pathname.startsWith("/api/")) {
          return true;
        }

        // Require authentication for everything else
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static/* (static files)
     * - _next/image/* (image optimization)
     * - favicon.ico (favicon)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
