import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function requireDashboardSession() {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  if (!session.orgId) {
    redirect("/org-selection");
  }

  return session;
}
