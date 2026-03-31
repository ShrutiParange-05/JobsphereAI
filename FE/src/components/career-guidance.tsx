"use client";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/scroll-wrapper";
import { ChevronRight, Monitor, Layout, Briefcase, TrendingUp, BookOpen, Loader2, Award } from "lucide-react";
import { motion } from "framer-motion";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001/api";

// Helper function for progress bar colors
const getProgressColorClass = (color: string) => {
  switch(color) {
    case 'green': return '[&>div]:bg-green-500';
    case 'blue': return '[&>div]:bg-blue-500';
    case 'purple': return '[&>div]:bg-purple-500';
    default: return '[&>div]:bg-gray-500';
  }
};

// Helper function for icon colors
const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
    green: { bg: 'bg-green-500/10', text: 'text-green-500' },
  };
  return colorMap[color] || { bg: 'bg-gray-500/10', text: 'text-gray-500' };
};

// Helper function to get icon based on career title
const getIconForCareer = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('developer') || lowerTitle.includes('engineer')) {
    return Monitor;
  } else if (lowerTitle.includes('design')) {
    return Layout;
  } else {
    return Briefcase;
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const PremiumCard = ({ children, className = "", hoverEffect = true }: any) => (
  <motion.div
    variants={itemVariants}
    whileHover={hoverEffect ? { y: -5, transition: { duration: 0.2 } } : {}}
    className={`bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 shadow-2xl rounded-2xl overflow-hidden relative group ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    {children}
  </motion.div>
);

interface CareerGuidanceData {
  skillsMatch: {
    technicalSkills: number;
    softSkills: number;
    overallMatch: number;
  };
  recommendedPaths: Array<{
    title: string;
    match: number;
    description?: string;
  }>;
  industryDemand: {
    jobOpeningsGrowth: number;
    avgSalary: number;
    growthRate: number;
  };
  industryInsights: {
    trends: string;
    requiredSkills: string[];
  };
  jobMarketLevels: Array<{
    level: string;
    percentage: number;
  }>;
  learningPath?: {
    nextSkills: string[];
    certifications: string[];
    timelineMonths: number;
  };
}

export default function CareerGuidance() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [careerData, setCareerData] = useState<CareerGuidanceData | null>(null);

  useEffect(() => {
    const fetchCareerGuidance = async () => {
      try {
        const userId = localStorage.getItem("userId");
        
        if (!userId) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        console.log("🎯 Fetching career guidance for user:", userId);

        const response = await fetch(`${backendUrl}/career/guidance?userId=${userId}`, {
          headers: { Authorization: userId }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("✅ Career guidance response:", result);

        // Extract data from ApiResponse wrapper
        const data = result.data || result;
        setCareerData(data);
        
      } catch (error) {
        console.error("❌ Error fetching career guidance:", error);
        setError("Failed to load career guidance. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCareerGuidance();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading career guidance...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !careerData) {
    return (
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-400 mb-2">⚠️ {error || "Unable to load career guidance"}</p>
            <p className="text-sm text-gray-400">Please complete your assessment to get personalized recommendations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { skillsMatch, recommendedPaths, industryDemand, industryInsights, jobMarketLevels, learningPath } = careerData;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-white">Career Guidance</h2>
        <p className="text-gray-400">Your personalized career development insights</p>
      </div>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Skills Match Card */}
        <PremiumCard>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 font-bold tracking-tight">
                Skills Match
              </CardTitle>
              <motion.span 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", repeat: Infinity, repeatType: "reverse", duration: 2 }}
                className="text-4xl text-blue-400 font-extrabold drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              >
                {Math.round(skillsMatch.overallMatch)}%
              </motion.span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Technical Skills</span>
                <span className="font-semibold text-white">{skillsMatch.technicalSkills}%</span>
              </div>
              <div className="h-2.5 w-full bg-gray-800/50 rounded-full overflow-hidden shadow-inner">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${skillsMatch.technicalSkills}%` }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                 />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Soft Skills</span>
                <span className="font-semibold text-white">{skillsMatch.softSkills}%</span>
              </div>
              <div className="h-2.5 w-full bg-gray-800/50 rounded-full overflow-hidden shadow-inner">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${skillsMatch.softSkills}%` }}
                   transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                   className="h-full bg-gradient-to-r from-pink-600 to-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]"
                 />
              </div>
            </div>
          </CardContent>
        </PremiumCard>

        {/* Recommended Paths Card */}
        <PremiumCard>
          <CardHeader>
            <CardTitle className="text-white font-bold tracking-tight">Recommended Careers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedPaths.slice(0, 3).map((path, index) => {
              const Icon = getIconForCareer(path.title);
              const colors = getColorClasses(index === 0 ? 'blue' : index === 1 ? 'purple' : 'green');
              return (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-start justify-between p-3.5 rounded-xl bg-gray-800/30 border border-gray-700/30 hover:bg-gray-800/60 hover:border-gray-600/50 transition-all cursor-pointer gap-3 group"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 ${colors.bg} rounded-lg flex-shrink-0 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all`}>
                      <Icon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <div className="text-left flex-1 min-w-0 pt-0.5">
                      <div className="font-semibold text-sm leading-tight text-gray-200 group-hover:text-white transition-colors">
                        {path.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{path.match}% match compatibility</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0 mt-2 group-hover:translate-x-1 group-hover:text-white transition-all" />
                </motion.div>
              )})}
          </CardContent>
        </PremiumCard>

        {/* Industry Demand Card */}
        <PremiumCard>
          <CardHeader>
            <CardTitle className="text-white font-bold tracking-tight">Industry Demand</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex justify-between items-center group">
              <span className="text-gray-400 font-medium">Job Openings</span>
              <span className="text-green-400 font-bold bg-green-400/10 px-2.5 py-1 rounded-md">↑ {industryDemand.jobOpeningsGrowth}%</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-gray-400 font-medium">Average Salary</span>
              <span className="text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">${industryDemand.avgSalary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-gray-400 font-medium">Growth Rate</span>
              <span className="text-blue-400 font-bold bg-blue-400/10 px-2.5 py-1 rounded-md">↑ {industryDemand.growthRate}%</span>
            </div>
          </CardContent>
        </PremiumCard>

        {/* Industry Insights Card */}
        <PremiumCard className="md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-bold tracking-tight">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-indigo-400" />
              </div>
              Industry Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Current Trends</h3>
              <p className="text-gray-400 leading-relaxed bg-gray-900/40 p-4 rounded-xl border border-gray-800/50">
                {industryInsights.trends}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">In-Demand Skills</h3>
              <div className="flex gap-2 flex-wrap">
                {industryInsights.requiredSkills.map((skill, index) => (
                  <motion.div key={index} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white px-3 py-1.5 transition-all text-sm font-medium"
                    >
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </PremiumCard>

        {/* Job Market Levels */}
        <PremiumCard>
          <CardHeader>
            <CardTitle className="text-white font-bold tracking-tight">Market Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {jobMarketLevels.map((level, index) => {
              const gradients = ['from-green-500 to-emerald-400', 'from-blue-500 to-cyan-400', 'from-purple-500 to-pink-400'][index] || 'from-gray-500 to-gray-400';
              return (
                <div key={index} className="space-y-2.5 group">
                  <div className="flex justify-between">
                    <span className="text-gray-300 font-medium">{level.level}</span>
                    <span className="font-bold text-white">{level.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-800/50 rounded-full overflow-hidden shadow-inner relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${level.percentage}%` }}
                      transition={{ duration: 1.5, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${gradients}`}
                    />
                  </div>
                </div>
              )})}
          </CardContent>
        </PremiumCard>

        {/* Learning Path */}
        {learningPath && (
          <PremiumCard className="md:col-span-2 lg:col-span-3">
            <CardHeader className="border-b border-gray-800/50 pb-4">
              <CardTitle className="flex items-center gap-3 text-white font-bold tracking-tight text-xl">
                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                Recommended Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-gray-200 flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
                    Essential Skills to Acquire
                  </h3>
                  <div className="space-y-2">
                    {learningPath.nextSkills.map((skill, index) => (
                      <motion.div 
                        key={index} 
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-700/50"
                      >
                        <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <ChevronRight className="h-3 w-3 text-blue-400" />
                        </div>
                        <span className="text-gray-300 font-medium">{skill}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-gray-200 flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)] animate-pulse" />
                    Recommended Certifications
                  </h3>
                  <div className="space-y-2">
                    {learningPath.certifications.map((cert, index) => (
                      <motion.div 
                        key={index}
                        whileHover={{ x: 5 }} 
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-700/50"
                      >
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                          <Award className="h-4 w-4 text-purple-300" />
                        </div>
                        <span className="text-gray-300 text-sm font-medium leading-tight">{cert}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/10 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">Estimated Timeline</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 font-bold text-lg drop-shadow-[0_0_5px_rgba(147,197,253,0.3)]">
                        {learningPath.timelineMonths} Months
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </PremiumCard>
        )}
      </motion.div>
    </div>
  );
}
