"use client";

import { Sidebar } from "@/components/sidebar";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-full w-full bg-black">
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <main className="flex overflow-x-hidden overflow-y-auto p-4 md:p-8 ml-0 md:ml-60">
        {children}
      </main>
    </div>
  );
}
