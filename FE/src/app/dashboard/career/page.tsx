"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Monitor, Layout, Briefcase, TrendingUp, BookOpen, Sparkles, Zap, Award } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/scroll-wrapper";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as any, stiffness: 100, damping: 15 }
  }
};

const PremiumCard = ({ children, className = "", delay = 0, hoverEffect = true }: any) => (
  <motion.div
    variants={itemVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    whileHover={hoverEffect ? { y: -5, transition: { duration: 0.2 } } : {}}
    className={`bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 shadow-2xl rounded-2xl overflow-hidden relative group ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    {children}
  </motion.div>
);

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// Helper functions (same as before)
const getProgressColorClass = (color: string) => {
  switch(color) {
    case 'green': return '[&>div]:bg-green-500';
    case 'blue': return '[&>div]:bg-blue-500';
    case 'purple': return '[&>div]:bg-purple-500';
    default: return '[&>div]:bg-gray-500';
  }
};

const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
    green: { bg: 'bg-green-500/10', text: 'text-green-500' },
  };
  return colorMap[color] || { bg: 'bg-gray-500/10', text: 'text-gray-500' };
};

const getIconForCareer = (title: string) => {
  if (title.toLowerCase().includes('developer') || title.toLowerCase().includes('engineer')) {
    return Monitor;
  } else if (title.toLowerCase().includes('design')) {
    return Layout;
  } else {
    return Briefcase;
  }
};

interface CareerGuidanceData {
  skillsMatch: {
    technicalSkills: number;
    softSkills: number;
    overallMatch: number;
  };
  recommendedPaths: Array<{
    title: string;
    match: number;
    description: string;
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [careerData, setCareerData] = useState<CareerGuidanceData | null>(null);

  useEffect(() => {
    const fetchCareerGuidance = async () => {
      try {
        const userId = localStorage.getItem("userId");
        
        if (!userId) {
          router.push("/auth");
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
      } finally {
        setLoading(false);
      }
    };

    fetchCareerGuidance();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full blur-xl bg-cyan-500/30 animate-pulse"></div>
          {/* Main spinner */}
          <div className="relative w-16 h-16 border-4 border-gray-800 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
          {/* Inner pulsating dot */}
          <div className="absolute inset-0 m-auto w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
        </div>
        <h2 className="mt-8 text-xl font-medium tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse">
          Loading Career Guidance
        </h2>
        <p className="mt-2 text-sm text-gray-500">Preparing your personalized insights...</p>
      </div>
    );
  }

  if (!careerData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 text-white p-6">
          <p>Unable to load career guidance. Please complete your assessment first.</p>
        </Card>
      </div>
    );
  }

  const { skillsMatch, recommendedPaths, industryDemand, industryInsights, jobMarketLevels, learningPath } = careerData;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ScrollReveal delay={100}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-500" />
              </div>
              <h1 className="text-4xl font-bold">Career Guidance</h1>
            </div>
            <p className="text-gray-400 text-lg">Your personalized career development insights</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Skills Match Card */}
          <ScrollReveal delay={200}>
            <PremiumCard className="text-white h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Skills Match</CardTitle>
                <span className="text-3xl text-blue-500">
                  {Math.round(skillsMatch.overallMatch)}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Technical Skills</span>
                  <span>{skillsMatch.technicalSkills}%</span>
                </div>
                <Progress 
                  value={skillsMatch.technicalSkills} 
                  className="h-2 bg-gray-800 [&>div]:bg-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Soft Skills</span>
                  <span>{skillsMatch.softSkills}%</span>
                </div>
                <Progress 
                  value={skillsMatch.softSkills} 
                  className="h-2 bg-gray-800 [&>div]:bg-pink-500" 
                />
              </div>
            </CardContent>
          </PremiumCard>
          </ScrollReveal>

          {/* Recommended Paths Card */}
          <ScrollReveal delay={300}>
            <PremiumCard className="text-white h-full">
            <CardHeader>
              <CardTitle>Recommended Careers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedPaths.slice(0, 3).map((path, index) => {
                const Icon = getIconForCareer(path.title);
                const colors = getColorClasses(index === 0 ? 'blue' : index === 1 ? 'purple' : 'green');
                return (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 ${colors.bg} rounded-lg`}>
                        <Icon className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium">{path.title}</div>
                        <div className="text-sm text-gray-400">{path.match}% match</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </div>
                )})}
            </CardContent>
          </PremiumCard>
          </ScrollReveal>

          {/* Industry Demand Card */}
          <ScrollReveal delay={400}>
            <PremiumCard className="text-white h-full">
            <CardHeader>
              <CardTitle>Industry Demand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Job Openings</span>
                <span className="text-green-500 font-semibold">↑ {industryDemand.jobOpeningsGrowth}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Salary</span>
                <span className="text-green-500 font-semibold">${industryDemand.avgSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Growth Rate</span>
                <span className="text-green-500 font-semibold">↑ {industryDemand.growthRate}%</span>
              </div>
            </CardContent>
          </PremiumCard>
          </ScrollReveal>

          {/* Industry Insights Card */}
          <ScrollReveal delay={500}>
            <PremiumCard className="text-white md:col-span-1 lg:col-span-2 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Industry Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Current Trends</h3>
                <p className="text-gray-400">
                  {industryInsights.trends}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">In-Demand Skills</h3>
                <div className="flex gap-2 flex-wrap">
                  {industryInsights.requiredSkills.map((skill, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </PremiumCard>
          </ScrollReveal>

          {/* Job Market Analysis Card */}
          <ScrollReveal delay={600}>
            <PremiumCard className="text-white h-full">
            <CardHeader>
              <CardTitle>Job Market Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobMarketLevels.map((level, index) => {
                const colors = ['green', 'blue', 'purple'][index] || 'gray';
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{level.level}</span>
                      <span className="font-semibold">{level.percentage}%</span>
                    </div>
                    <Progress 
                      value={level.percentage} 
                      className={`h-2 bg-gray-800 ${getProgressColorClass(colors)}`} 
                    />
                  </div>
                )})}
            </CardContent>
          </PremiumCard>
          </ScrollReveal>

          {/* Learning Path Card */}
          {learningPath && (
            <div className="lg:col-span-3">
              <ScrollReveal delay={700}>
                <PremiumCard className="text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] -z-10" />
                  
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CardTitle className="flex items-center gap-3 text-xl font-bold">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        Recommended Learning Path
                      </CardTitle>
                      <div className="px-4 py-1.5 bg-gray-800/80 border border-gray-700/50 rounded-full text-sm font-bold text-gray-300 backdrop-blur-md whitespace-nowrap">
                        ⏱ <span className="text-indigo-400">{learningPath.timelineMonths} Months</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 pt-4">
                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Next Skills */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-400" />
                          <h3 className="text-sm font-black text-white uppercase tracking-widest">Next Skills</h3>
                        </div>
                        <div className="space-y-2">
                          {learningPath.nextSkills.map((skill, index) => (
                            <motion.div 
                              key={index}
                              whileHover={{ x: 4 }}
                              className="group flex items-center gap-3 p-3 bg-gray-800/30 border border-gray-700/30 rounded-xl hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-default"
                            >
                              <div className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
                              <span className="text-gray-300 text-sm font-semibold group-hover:text-white transition-colors leading-tight">{skill}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-emerald-400" />
                          <h3 className="text-sm font-black text-white uppercase tracking-widest">Target Certifications</h3>
                        </div>
                        <div className="space-y-2">
                          {learningPath.certifications.map((cert, index) => (
                            <motion.div 
                              key={index}
                              whileHover={{ x: 4 }}
                              className="group flex items-center gap-3 p-3 bg-gray-800/20 border border-gray-700/40 rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-default"
                            >
                              <div className="p-1.5 bg-emerald-500/10 rounded-lg flex-shrink-0 group-hover:bg-emerald-500/20 transition-all">
                                <Sparkles className="h-3 w-3 text-emerald-500" />
                              </div>
                              <span className="text-gray-300 text-sm font-semibold group-hover:text-white transition-colors leading-tight flex-1 min-w-0">{cert}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-indigo-900/20 via-purple-900/10 to-transparent border border-indigo-500/20 rounded-2xl relative overflow-hidden group/tip">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/tip:opacity-20 transition-opacity">
                        <TrendingUp size={60} className="text-indigo-500" />
                      </div>
                      <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Pro Tip</p>
                      <p className="text-gray-300 text-sm leading-relaxed relative z-10">
                        Focusing on these certifications can increase your market value by an estimated <span className="text-white font-bold">25–30%</span> within the next year.
                      </p>
                    </div>
                  </CardContent>
                </PremiumCard>
              </ScrollReveal>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
