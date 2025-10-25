"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Github } from "lucide-react"; // Import the Github icon

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string | number;
  date?: string;
  isPercentage?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  date = "",
  isPercentage = false,
}) => (
  <Card className="bg-zinc-800/50 border-0">
    <CardContent className="p-6">
      <div className="space-y-2">
        <p className="text-zinc-400 text-sm">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-semibold text-white">
            {isPercentage ? `${value}%` : value}
          </h3>
          <span className="text-emerald-400 text-sm">↑ {change}%</span>
        </div>
        {date && <p className="text-emerald-400 text-sm">{date}</p>}
      </div>
    </CardContent>
  </Card>
);

const HeroSection = () => {
  const router = useRouter(); // Initialize Next.js router

  const handleStartAnalysis = () => {
    router.push("/auth/login"); // Navigate to the new dashboard page
  };

  const handleWatchDemo = () => {
    // Open the YouTube link in a new tab
    window.open("https://youtube.com", "_blank");
  };

  const handleOpenGitHub = () => {
    // Open the GitHub link in a new tab
    window.open("https://github.com/kmoin1309", "_blank");
  };

  return (
    <div className="relative bg-gradient-to-br from-black to-zinc-900">
      <div className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-6xl font-bold text-white leading-tight">
              Level Up Your <span className="text-purple-500">Career</span> Game
            </h1>
            <p className="text-zinc-400 text-xl mt-4">
              Get detailed insights, track growth metrics, and optimize your
              performance with powerful analytics tools built for Youth.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                className="bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 ease-in-out transform hover:scale-105"
                onClick={handleStartAnalysis}
              >
                Start Analysis
              </button>
              <button
                className="border border-purple-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-purple-600/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 ease-in-out transform hover:scale-105"
                onClick={handleWatchDemo} // Add onClick handler for Watch Demo
              >
                Watch Demo
              </button>
              <button
                className="flex items-center gap-2 border border-purple-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-purple-600/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 ease-in-out transform hover:scale-105"
                onClick={handleOpenGitHub} // Add onClick handler for GitHub
              >
                <Github size={20} /> {/* Add GitHub icon */}
              </button>
            </div>
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-zinc-400">
                  Empowering AI for Analytics
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-zinc-400">Utilising AI/ML </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              title="Engagement Rate"
              value="4.8"
              change="12"
              isPercentage={true}
            />
            <MetricCard title="growth" value="+2.4k" change="8" />
            <MetricCard title="Reach" value="85.2k" change="15" />
            <MetricCard title="Best Time" value="9 PM" date="Thu" change={""} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default HeroSection;
