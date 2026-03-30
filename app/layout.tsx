import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operation Log",
  description: "Minimal operation tracking app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}