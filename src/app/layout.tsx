import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/layout/AuthProvider";

export const metadata: Metadata = {
  title: "CapPlan - Driver Planning Tool",
  description: "Chauffeur planning en roosterbeheer met AFAS integratie",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
