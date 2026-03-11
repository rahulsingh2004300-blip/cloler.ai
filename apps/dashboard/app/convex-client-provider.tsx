"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useState, type ReactNode } from "react";

function getConvexUrl() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is missing for @cloler/dashboard. Add it to apps/dashboard/.env.local.",
    );
  }

  return convexUrl;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new ConvexReactClient(getConvexUrl()));

  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
