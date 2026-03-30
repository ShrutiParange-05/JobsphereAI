"use client";

import { Sidebar } from "@/components/sidebar";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden relative">
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
      
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <main 
        className={`flex-1 h-screen overflow-x-hidden overflow-y-auto p-4 md:p-8 transition-all duration-300 ease-in-out ${
          isOpen ? 'md:ml-60' : 'ml-0'
        }`}
      >
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
