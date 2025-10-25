"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Monitor, Layout, Briefcase, TrendingUp, BookOpen } from "lucide-react";

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading career guidance...</p>
        </div>
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
        <div>
          <h1 className="text-4xl font-bold mb-2">Career Guidance</h1>
          <p className="text-gray-400">Your personalized career development insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Skills Match Card */}
          <Card className="bg-gray-900 border-gray-800 text-white">
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
          </Card>

          {/* Recommended Paths Card */}
          <Card className="bg-gray-900 border-gray-800 text-white">
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
          </Card>

          {/* Industry Demand Card */}
          <Card className="bg-gray-900 border-gray-800 text-white">
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
          </Card>

          {/* Industry Insights Card */}
          <Card className="bg-gray-900 border-gray-800 text-white md:col-span-1 lg:col-span-2">
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
          </Card>

          {/* Job Market Analysis Card */}
          <Card className="bg-gray-900 border-gray-800 text-white">
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
          </Card>

          {/* Learning Path Card */}
          {learningPath && (
            <Card className="bg-gray-900 border-gray-800 text-white lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recommended Learning Path
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Next Skills to Learn</h3>
                    <ul className="space-y-2">
                      {learningPath.nextSkills.map((skill, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300">
                          <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recommended Certifications</h3>
                    <ul className="space-y-2">
                      {learningPath.certifications.map((cert, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300">
                          <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                          {cert}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-sm text-gray-400">
                      Estimated timeline: <span className="text-white font-semibold">{learningPath.timelineMonths} months</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
