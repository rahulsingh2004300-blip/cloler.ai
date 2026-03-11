import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Customer dashboard | cloler.ai",
  description: "Tenant workspace for voice cloning, telephony settings, analytics, and billing.",
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
