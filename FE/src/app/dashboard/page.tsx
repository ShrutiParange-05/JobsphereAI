"use client";
import { useRouter } from "next/navigation";
import { MetricCard } from "@/components/metric-card";
import { BarChart } from "@/components/bar-chart";
import { Demographics } from "@/components/demographics";
import { EngagementAnalysis } from "@/components/engagement-analysis";
import CareerGuidance from "@/components/career-guidance";
import { SkillAssessmentInsights } from "@/components/optimal-posting-times";
import { Button } from "@/components/ui/button";

// Function to generate random data
const generateRandomData = () => {
  return {
    Total_Questions: Math.floor(Math.random() * 500 + 50),
    Accuracy: (Math.random() * 100).toFixed(2),
    Avg_Time: (Math.random() * 30 + 5).toFixed(1),
    Skill_Progress: (Math.random() * 100).toFixed(1),
    Correct_Answers: Math.floor(Math.random() * 300 + 50),
    Incorrect_Answers: Math.floor(Math.random() * 200 + 20),
    Engagement_Rate: (Math.random() * 100).toFixed(1),
    Overall_Reach: (Math.random() * 100).toFixed(1),
    CTR: (Math.random() * 10).toFixed(2),
    Study_Hours: (Math.random() * 40 + 5).toFixed(1),
    Post_Date: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000), // Random last 10 days
  };
};

const data = generateRandomData();
export default function Page() {
  const router = useRouter();

  const metrics = [
    {
      title: "Total Questions Attempted",
      value: data.Total_Questions,
      change: 15,
    },
    { title: "Accuracy Rate", value: `${data.Accuracy}%`, change: 3.2 },
    {
      title: "Average Time Per Question",
      value: `${data.Avg_Time}s`,
      change: -0.5,
    },
    {
      title: "Skill Progression Score",
      value: data.Skill_Progress,
      change: 5.8,
    },
    {
      title: "Total Study Hours",
      value: `${data.Study_Hours} hrs`,
      change: 4.2,
    },
  ];

  const skillData = [
    {
      label: "Correct Answers",
      value: data.Correct_Answers,
      color: "bg-green-500",
    },
    {
      label: "Incorrect Answers",
      value: data.Incorrect_Answers,
      color: "bg-red-500",
    },
  ];

  const assessmentData = [
    {
      skillLevel: "Beginner",
      recommendedTime: "2-3 hours/day",
      improvementArea: "Fundamentals",
      colorClass: "text-yellow-400",
    },
    {
      skillLevel: "Intermediate",
      recommendedTime: "1-2 hours/day",
      improvementArea: "Problem Solving",
      colorClass: "text-green-400",
    },
    {
      skillLevel: "Advanced",
      recommendedTime: "4-5 hours/week",
      improvementArea: "Optimization",
      colorClass: "text-blue-400",
    },
    {
      skillLevel: "Expert",
      recommendedTime: "2-3 hours/week",
      improvementArea: "Industry Projects",
      colorClass: "text-purple-400",
    },
  ];

  const proficiencyData = {
    skillLevels: { beginner: 30, intermediate: 40, advanced: 30 },
    topicPerformance: [
      { label: "Engagement", percentage: data.Engagement_Rate },
      { label: "Reach", percentage: data.Overall_Reach },
      { label: "CTR", percentage: data.CTR },
    ],
    genderData: { male: 50, female: 50 },
    ageData: [
      { label: "18-24", percentage: Math.floor(Math.random() * 40 + 10) },
      { label: "25-34", percentage: Math.floor(Math.random() * 40 + 10) },
      { label: "35-44", percentage: Math.floor(Math.random() * 30 + 5) },
      { label: "45+", percentage: Math.floor(Math.random() * 20 + 5) },
    ],
  };

  const learningTimeData = [
    {
      period: "6AM-12PM",
      timeRange: "Morning",
      performance: String(Math.floor(Math.random() * 100)),
      colorClass: "bg-blue-500",
    },
    {
      period: "12PM-6PM",
      timeRange: "Afternoon",
      performance: String(Math.floor(Math.random() * 100)),
      colorClass: "bg-green-500",
    },
    {
      period: "6PM-12AM",
      timeRange: "Evening",
      performance: String(Math.floor(Math.random() * 100)),
      colorClass: "bg-yellow-500",
    },
    {
      period: "12AM-6AM",
      timeRange: "Night",
      performance: String(Math.floor(Math.random() * 100)),
      colorClass: "bg-purple-500",
    },
  ];

  return (
    <div className=" bg-black">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-white">
              Skill Analysis Overview
            </h1>

            <div className="justify-end">
              <Button
                className="bg-cyan-900 hover:bg-cyan-1000 mr-2"
                onClick={() => router.push("/assessment/resume")}
              >
                Upload Resume
              </Button>
              <Button
                className="bg-green-700 hover:bg-green-800"
                onClick={() => router.push("/assessment/test")}
              >
                Take Assessment Test
              </Button>
            </div>
          </div>
          <p className="text-gray-400 mt-2">
            Welcome {localStorage.getItem("userName") || "User"}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-900 border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Performance Breakdown
            </h3>
            <div className="space-y-4">
              {skillData.map((data) => (
                <BarChart
                  key={data.label}
                  {...data}
                  max={Math.max(...skillData.map((d) => d.value))}
                />
              ))}
            </div>
          </div>
          <div id="proficiency">
            <Demographics {...proficiencyData} />
          </div>
        </div>
        <div id="optimal-learning">
          <SkillAssessmentInsights assessmentData={assessmentData} />
        </div>
        <EngagementAnalysis
          timeSeriesData={learningTimeData.map((item) => ({
            date: item.period,
            value: Number(item.performance),
          }))}
          currentRate={`${data.Accuracy}%`}
          metrics={skillData}
        />
        <CareerGuidance />
      </div>
    </div>
  );
}
