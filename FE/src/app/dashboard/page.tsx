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
import { AlertCircle, TrophyIcon, Target, Clock } from "lucide-react";

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8 p-4">
        {/* Header */}
        <div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-white">
              Skill Analysis Overview
            </h1>
            <div className="flex gap-2">
              <Button
                className="bg-cyan-900 hover:bg-cyan-800"
                onClick={() => router.push("/assessment/resume")}
              >
                Upload Resume
              </Button>
              <Button
                className="bg-green-700 hover:bg-green-800"
                onClick={() => router.push("/assessment/test")}
              >
                {hasTestResults ? "Retake Test" : "Take Assessment Test"}
              </Button>
            </div>
          </div>
          <p className="text-gray-400 mt-2">Welcome {userName}</p>
        </div>

        {/* Test Results Alert */}
        {!hasTestResults && (
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold">No Test Results Yet</h3>
              <p className="text-gray-400 text-sm mt-1">
                Take the skill assessment test to get personalized feedback and career recommendations.
              </p>
              <Button
                className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                onClick={() => router.push("/assessment/test")}
              >
                Start Test Now
              </Button>
            </div>
          </div>
        )}

        {/* Test Results Summary */}
        {hasTestResults && userData?.testFeedback && (
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <TrophyIcon className="w-12 h-12 text-yellow-500" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Test Feedback</h3>
                <p className="text-gray-300 mb-4">{userData.testFeedback}</p>
                
                {userData.recommendedCareer && (
                  <div className="mb-3">
                    <span className="text-green-400 font-semibold flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Recommended Career:
                    </span>
                    <span className="text-white ml-6">{userData.recommendedCareer}</span>
                  </div>
                )}

                {userData.recommendedCourses && (
                  <div>
                    <span className="text-blue-400 font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recommended Courses:
                    </span>
                    <div className="ml-6 mt-2 space-y-1">
                      {userData.recommendedCourses.split(',').map((course, idx) => (
                        <div key={idx} className="text-gray-300 text-sm">
                          • {course.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>

        {/* Performance & Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-900 border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Performance Breakdown
            </h3>
            {hasTestResults ? (
              <div className="space-y-4">
                {skillData.map((data) => (
                  <BarChart
                    key={data.label}
                    {...data}
                    max={totalQuestions}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No test data available</p>
              </div>
            )}
          </div>
          <div id="proficiency">
            <Demographics {...proficiencyData} />
          </div>
        </div>

        {/* Skill Assessment Insights */}
        <div id="optimal-learning">
          <SkillAssessmentInsights assessmentData={assessmentData} />
        </div>

        {/* Learning Progress */}
        {hasTestResults && (
          <EngagementAnalysis
            timeSeriesData={learningTimeData.map((item) => ({
              date: item.period,
              value: Number(item.performance),
            }))}
            currentRate={`${testScore}%`}
            metrics={skillData}
          />
        )}

        {/* Career Guidance */}
        <CareerGuidance />
      </div>
    </div>
  );
}
