import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

// In middleware auth mode, each page is protected by default.
// Exceptions are configured via the `unauthenticatedPaths` option.
export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: [],
  },
});

// Match against pages that require authentication
// Leave this out if you want authentication on every page in your application
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - Static files (svg, png, jpg, jpeg, gif, webp, ico)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * Note: API routes are included so withAuth() works in API handlers
     */
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|favicon.ico|sitemap.xml|robots.txt|.well-known/workflow/).*)",
  ],
};
