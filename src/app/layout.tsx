import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CapPlan - Chauffeurplanning",
  description: "Chauffeur planning en roosterbeheer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
