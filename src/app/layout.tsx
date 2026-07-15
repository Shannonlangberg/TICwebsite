import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TIC | Futures Church",
  description:
    "Watch the TIC videos, submit your questions, and confirm your spot at the TIC Gathering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
