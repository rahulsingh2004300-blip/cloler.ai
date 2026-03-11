import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Widget preview | cloler.ai",
  description: "Embeddable experience for inbound support conversations and voice sessions.",
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
