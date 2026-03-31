"use client";
import Image from "next/image";
import logo from "../../public/logo.jpg";
import {
  BarChart3,
  Users2,
  Zap,
  LayoutDashboard,
  X,
  Lightbulb,
  Brain,
  UserSearch,
  FileText,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Career Insights", icon: Zap, path: "/dashboard/career" },
  { label: "Job Match AI", icon: Users2, path: "/dashboard/jobs" },
  { label: "Skill Analytics", icon: BarChart3, path: "/dashboard/skills" },
  { label: "Learning Path", icon: Lightbulb, path: "/dashboard/learn" },
  { label: "Candidate Analyzer", icon: UserSearch, path: "/dashboard/candidates" },
  { label: "Resume Optimizer", icon: FileText, path: "/dashboard/resume-optimizer" },
  { label: "AI Mock Interviewer", icon: Brain, path: "http://localhost:5173/", external: true },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mobile overlay click in layout.tsx handles closing when clicking outside on small screens.
    // Desktop should not close when clicking main content as it is a toggleable static drawer.
  }, [isOpen, onClose]);

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "fixed top-0 left-0 z-40 h-screen w-60 bg-slate-950 transition-transform duration-300 ease-in-out border-r border-gray-900",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="space-y-4 py-4">
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 text-white hover:bg-gray-800 rounded-full"
        >
          <X size={24} />
        </button>

        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="" className="w-7 h-auto rounded-lg" />
            <h2 className="text-lg font-semibold text-white tracking-tight">
              JobSphereAI
            </h2>
          </div>
        </div>
        <div className="px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = !item.external && pathname === item.path;
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start transition-all duration-200",
                    isActive
                      ? "text-white bg-gray-800/80 shadow-lg shadow-cyan-500/5"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                  onClick={() => {
                    if (item.external) {
                      window.open(item.path, "_blank");
                    } else {
                      router.push(item.path);
                    }
                  }}
                >
                  <item.icon className={cn("mr-2 h-4 w-4", isActive && "text-cyan-400")} />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
