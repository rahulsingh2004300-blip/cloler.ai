import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { WorkspaceOverview } from "./workspace-overview";

export default async function HomePage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!orgId) {
    redirect("/org-selection");
  }

  return <WorkspaceOverview />;
}
