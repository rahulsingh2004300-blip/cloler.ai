import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marketing surface | cloler.ai",
  description:
    "Public-facing site for cloler.ai with room for positioning, pricing, and product education.",
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
