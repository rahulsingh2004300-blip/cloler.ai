import type { Metadata } from "next";
import { validateAdminEnv } from "../env";
import "./globals.css";

validateAdminEnv();

export const metadata: Metadata = {
  title: "Admin console | cloler.ai",
  description:
    "Internal operating surface for monitoring tenants, compliance, and system health.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
