"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { initializeStore } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initializeStore();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
