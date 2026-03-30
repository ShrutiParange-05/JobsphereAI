"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MetricCard } from "@/components/metric-card";
import { BarChart } from "@/components/bar-chart";
import { Demographics } from "@/components/demographics";
import { EngagementAnalysis } from "@/components/engagement-analysis";
import CareerGuidance from "@/components/career-guidance";
import { SkillAssessmentInsights } from "@/components/optimal-posting-times";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrophyIcon, Target, Clock, RefreshCw, Zap } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-wrapper";
import { motion } from "framer-motion";

function AnimatedValue({ value, suffix = "" }: { value: number | string, suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let target = typeof value === 'number' ? value : parseInt(String(value).match(/\d+/)?.[0] || '0');
    if (isNaN(target)) target = 0;
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <>{count}{suffix}</>;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface UserData {
  testScore: number | null;
  testFeedback: string | null;
  recommendedCareer: string | null;
  recommendedCourses: string | null;
}

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userName, setUserName] = useState("User");

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const userId = localStorage.getItem("userId");
  //       const storedName = localStorage.getItem("userName");
  //       if (storedName) setUserName(storedName);

  //       if (!userId) {
  //         router.push("/auth");
  //         return;
  //       }

  //       const response = await fetch(`${backendUrl}/user/getUserData?userId=${userId}`, {
  //         headers: { Authorization: userId }
  //       });

  //       if (!response.ok) throw new Error("Failed to fetch user data");
  //       const data = await response.json();
  //       setUserData(data);
  //     } catch (error) {
  //       console.error("Error fetching user ", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserData();
  // }, [router]);
  useEffect(() => {
  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const storedName = localStorage.getItem("userName");
      if (storedName) setUserName(storedName);

      if (!userId) {
        router.push("/auth");
        return;
      }

      console.log("📊 Fetching user data for ID:", userId);

      const response = await fetch(`${backendUrl}/user/getUserData?userId=${userId}`, {
        headers: { Authorization: userId }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ API Response:", result);

      // ✅ FIX: Extract data from ApiResponse wrapper
      const data = result.data || result;
      
      console.log("📦 User Data:", data);
     setUserData(data);
      
      // ✅ Force a re-render by triggering a state update
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching user ", error);
      setLoading(false);
    }
  };

  fetchUserData();
}, [router]); // ✅ ADD backendUrl to dependencies if it changes

  const hasTestResults = userData?.testScore !== null && userData?.testScore !== undefined;

  // Calculate metrics based on real data or defaults
  const testScore = userData?.testScore || 0;
  const totalQuestions = 10;
  const correctAnswers = Math.round((testScore / 100) * totalQuestions);
  const incorrectAnswers = totalQuestions - correctAnswers;

  const metrics = [
    {
      title: "Test Score",
      value: hasTestResults ? `${testScore}%` : "Not taken",
      change: hasTestResults ? (testScore >= 70 ? 5 : -2) : 0,
    },
    {
      title: "Questions Attempted",
      value: hasTestResults ? totalQuestions : 0,
      change: hasTestResults ? 100 : 0,
    },
    {
      title: "Correct Answers",
      value: hasTestResults ? correctAnswers : 0,
      change: hasTestResults ? 3.2 : 0,
    },
    {
      title: "Accuracy Rate",
      value: hasTestResults ? `${testScore}%` : "0%",
      change: hasTestResults ? (testScore >= 70 ? 4.5 : -1.5) : 0,
    },
    {
      title: "Skill Level",
      value: hasTestResults 
        ? testScore >= 80 ? "Advanced" 
          : testScore >= 60 ? "Intermediate" 
          : "Beginner"
        : "Unknown",
      change: hasTestResults ? 2.1 : 0,
    },
  ];

  const skillData = [
    {
      label: "Correct Answers",
      value: correctAnswers,
      color: "bg-green-500",
    },
    {
      label: "Incorrect Answers",
      value: incorrectAnswers,
      color: "bg-red-500",
    },
  ];

  const getSkillLevel = (score: number) => {
    if (score >= 80) return { level: "Advanced", color: "text-green-400" };
    if (score >= 60) return { level: "Intermediate", color: "text-blue-400" };
    if (score >= 40) return { level: "Beginner", color: "text-yellow-400" };
    return { level: "Foundation", color: "text-gray-400" };
  };

  const skillLevel = getSkillLevel(testScore);

  const assessmentData = [
    {
      skillLevel: "Advanced (80-100%)",
      recommendedTime: "2-3 hours/week",
      improvementArea: "Industry Projects & Leadership",
      colorClass: "text-green-400",
    },
    {
      skillLevel: "Intermediate (60-79%)",
      recommendedTime: "4-5 hours/week",
      improvementArea: "Problem Solving & Optimization",
      colorClass: "text-blue-400",
    },
    {
      skillLevel: "Beginner (40-59%)",
      recommendedTime: "1-2 hours/day",
      improvementArea: "Core Concepts & Practice",
      colorClass: "text-yellow-400",
    },
    {
      skillLevel: "Foundation (0-39%)",
      recommendedTime: "2-3 hours/day",
      improvementArea: "Fundamentals & Basics",
      colorClass: "text-gray-400",
    },
  ];

  const proficiencyData = {
    skillLevels: {
      beginner: testScore < 40 ? 100 : testScore < 60 ? 60 : 20,
      intermediate: testScore >= 40 && testScore < 80 ? 100 : testScore >= 60 ? 50 : 30,
      advanced: testScore >= 80 ? 100 : testScore >= 60 ? 40 : 10,
    },
    topicPerformance: [
      { label: "Knowledge", percentage: testScore.toString() },
      { label: "Application", percentage: (testScore * 0.9).toFixed(0) },
      { label: "Analysis", percentage: (testScore * 0.8).toFixed(0) },
    ],
    genderData: { male: 50, female: 50 },
    ageData: [
      { label: "18-24", percentage: 30 },
      { label: "25-34", percentage: 40 },
      { label: "35-44", percentage: 20 },
      { label: "45+", percentage: 10 },
    ],
  };

  const learningTimeData = [
    {
      period: "Week 1",
      timeRange: "Initial",
      performance: String(hasTestResults ? testScore * 0.7 : 0),
      colorClass: "bg-blue-500",
    },
    {
      period: "Week 2",
      timeRange: "Progress",
      performance: String(hasTestResults ? testScore * 0.85 : 0),
      colorClass: "bg-green-500",
    },
    {
      period: "Week 3",
      timeRange: "Growth",
      performance: String(hasTestResults ? testScore * 0.95 : 0),
      colorClass: "bg-yellow-500",
    },
    {
      period: "Current",
      timeRange: "Now",
      performance: String(testScore),
      colorClass: "bg-purple-500",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-cyan-500/30 animate-pulse"></div>
          <div className="relative w-16 h-16 border-4 border-gray-800 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
          <div className="absolute inset-0 m-auto w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
        </div>
        <h2 className="mt-8 text-xl font-medium tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse">
          Initializing Dashboard
        </h2>
        <p className="mt-2 text-sm text-gray-500">Preparing your personalized insights...</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8 p-4">
        {/* Header */}
        <ScrollReveal>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-white">
              Skill Analysis Overview
            </h1>
            <div className="flex gap-4">
              <Button
                variant="ghost"
                className="bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all shadow-xl backdrop-blur-md px-6 rounded-xl hover:scale-105 active:scale-95"
                onClick={() => router.push("/assessment/resume")}
              >
                Upload Resume
              </Button>
              <Button
                variant="ghost"
                className="bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] px-6 rounded-xl hover:scale-105 active:scale-95 flex items-center gap-2"
                onClick={() => router.push("/assessment/test")}
              >
                {hasTestResults ? <RefreshCw className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-white" />}
                {hasTestResults ? "Retake Test" : "Take Assessment Test"}
              </Button>
            </div>
          </div>
          <div className="text-gray-400 mt-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            Welcome {userName}
          </div>
        </ScrollReveal>

        {/* Test Results Alert */}
        {!hasTestResults && (
          <ScrollReveal delay={100}>
            <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 flex items-start gap-3 shadow-lg shadow-yellow-500/5">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold">No Test Results Yet</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Take the skill assessment test to get personalized feedback and career recommendations.
                </p>
                <Button
                  className="mt-3 bg-yellow-600 hover:bg-yellow-700 transition-transform hover:-translate-y-0.5"
                  onClick={() => router.push("/assessment/test")}
                >
                  Start Test Now
                </Button>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Test Results Summary */}
        {hasTestResults && userData?.testFeedback && (
          <ScrollReveal delay={150}>
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 shadow-2xl rounded-2xl overflow-hidden relative group p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
                <div className="p-4 bg-yellow-500/10 rounded-2xl shrink-0">
                  <TrophyIcon className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-3 tracking-tight flex items-center gap-2">
                    AI Test Feedback
                    {hasTestResults && <span className="text-sm font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20"><AnimatedValue value={testScore} suffix="%" /> Score</span>}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed text-lg">{userData.testFeedback}</p>
                  
                  {userData.recommendedCareer && (
                  <div className="mb-4">
                    <span className="text-green-400 font-semibold flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4" />
                      Recommended Career Path:
                    </span>
                    <div className="text-white ml-6 bg-gray-900/50 p-4 rounded-xl border border-green-500/20 shadow-inner">
                      <p className="leading-relaxed">{userData.recommendedCareer}</p>
                    </div>
                  </div>
                )}

                {userData.recommendedCourses && (
                  <div className="mt-5">
                    <span className="text-blue-400 font-semibold flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-blue-400" />
                      Recommended Courses:
                    </span>
                    <div className="bg-gray-900/40 p-5 rounded-2xl border border-gray-700/50 shadow-inner space-y-3 relative overflow-hidden">
                      {userData.recommendedCourses.split(',').map((course, idx) => (
                        <div key={idx} className="text-gray-200 text-base flex items-start gap-3 transition-transform hover:translate-x-1 duration-200">
                          <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] flex-shrink-0 mt-2"></span> 
                          <span className="leading-relaxed font-medium">{course.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Metrics */}
        <ScrollReveal delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {metrics.map((metric, i) => (
              <div key={metric.title} className="hover:-translate-y-1 transition-transform duration-300 ease-out hover:shadow-lg hover:shadow-cyan-500/10 rounded-xl">
                <MetricCard {...metric} />
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Performance & Demographics */}
        <ScrollReveal delay={300}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 shadow-2xl rounded-2xl overflow-hidden relative group p-6 hover:shadow-blue-500/5 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              <h3 className="text-xl font-bold text-white mb-6 relative z-10 tracking-tight">
                Performance Breakdown
              </h3>
              {hasTestResults ? (
                <div className="space-y-4">
                  {skillData.map((data, i) => (
                    <div key={data.label} className="animate-in slide-in-from-right-4 fade-in duration-500" style={{ animationDelay: `${300 + i * 100}ms` }}>
                      <BarChart
                        {...data}
                        max={totalQuestions}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No test data available</p>
                </div>
              )}
            </div>
            <div id="proficiency" className="hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 rounded-lg">
              <Demographics {...proficiencyData} />
            </div>
          </div>
        </ScrollReveal>

        {/* Skill Assessment Insights */}
        <ScrollReveal delay={400}>
          <div id="optimal-learning">
            <SkillAssessmentInsights assessmentData={assessmentData} />
          </div>
        </ScrollReveal>

        {/* Learning Progress */}
        {hasTestResults && (
          <ScrollReveal delay={500}>
            <div className="hover:shadow-2xl hover:shadow-indigo-500/10 transition-shadow">
              <EngagementAnalysis
                timeSeriesData={learningTimeData.map((item) => ({
                  date: item.period,
                  value: Number(item.performance),
                }))}
                currentRate={`${testScore}%`}
                metrics={skillData}
              />
            </div>
          </ScrollReveal>
        )}

        {/* Career Guidance */}
        <ScrollReveal delay={600}>
          <div>
            <CareerGuidance />
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
