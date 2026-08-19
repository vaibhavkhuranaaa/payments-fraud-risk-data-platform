import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payments Fraud Risk Data Platform | Analyst triage demonstration",
  description: "Aggregate monitoring, reproducible evaluation evidence, and a safe synthetic review-stream demonstration.",
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
