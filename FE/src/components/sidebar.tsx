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
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "fixed md:relative min-h-screen w-60 bg-slate-950",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={() => router.push("/dashboard")}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white"
              onClick={() => router.push("/dashboard/career")}
            >
              <Zap className="mr-2 h-4 w-4" />
              Career Insights
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white"
              onClick={() => router.push("/dashboard/jobs")}
            >
              <Users2 className="mr-2 h-4 w-4" />
              Job Match AI
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white"
              onClick={() => router.push("/dashboard/skills")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Skill Analytics
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white"
              onClick={() => router.push("/dashboard/learn")}
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Learning Path
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white"
              onClick={() => router.push("http://localhost:5173/")}
            >
              <Brain className="mr-2 h-4 w-4" />
              AI Mock Interviewer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
