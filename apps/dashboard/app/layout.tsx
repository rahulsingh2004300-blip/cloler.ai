import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./convex-client-provider";
import { validateDashboardEnv } from "../env";
import "./globals.css";

validateDashboardEnv();

export const metadata: Metadata = {
  title: "Customer dashboard | cloler.ai",
  description:
    "Tenant workspace for voice cloning, telephony settings, analytics, and billing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
