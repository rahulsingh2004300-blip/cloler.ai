import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isOrgSelectionRoute = createRouteMatcher(["/org-selection(.*)"]);
const isDevMonitoringRoute = createRouteMatcher([
  "/monitoring-test(.*)",
  "/api/monitoring/test-error(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  if (process.env.NODE_ENV !== "production" && isDevMonitoringRoute(req)) {
    return NextResponse.next();
  }

  await auth.protect();
  const { orgId } = await auth();

  if (!orgId && !isOrgSelectionRoute(req)) {
    const orgSelectionUrl = req.nextUrl.clone();
    orgSelectionUrl.pathname = "/org-selection";
    return NextResponse.redirect(orgSelectionUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|gif|svg|ico|ttf|woff2?|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
