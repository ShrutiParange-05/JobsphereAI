/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  BookOpen, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BarChart3,
  Brain,
  Code2,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001/api';

interface SkillData {
  name: string;
  score: number;
  category: 'strong' | 'moderate' | 'needs-improvement';
  trend?: 'up' | 'down' | 'stable';
}

interface TestInfo {
  takenOn: string;
  score: number;
  feedback: string;
}

interface UserData {
  testScore: number;
  testFeedback: string;
  recommendedCareer: string;
  recommendedCourses: string;
  skills?: string[] | string;
  createdAt?: string;
}

const SkillsAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [skillsData, setSkillsData] = useState<SkillData[]>([]);
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      console.log("⚠️ No userId found in localStorage");
      setError("User not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    console.log("📊 Fetching user data for skills analytics:", userId);
    console.log("🔗 Backend URL:", backendUrl);

    // ✅ FIX: Use the correct endpoint that exists
    const response = await fetch(`${backendUrl}/user/getUserData?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': userId
      }
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", errorText);
      throw new Error(`Failed to fetch user data (${response.status})`);
    }

    const result = await response.json();
    console.log("✅ User data received:", result);

    // ✅ Extract data from ApiResponse wrapper
    const data = result.data || result;
    
    // Check if user has completed assessment
    if (!data.testScore || data.testScore === null) {
      console.log("⚠️ No test score found - user needs to complete assessment");
      setError("assessment_incomplete");
      setLoading(false);
      return;
    }

    setUserData(data);

    // Parse skills from user data
    let skillsArray: string[] = [];
    
    if (typeof data.skills === 'string') {
      try {
        // Skills might be JSON string
        skillsArray = JSON.parse(data.skills);
      } catch {
        // Or comma-separated string
        skillsArray = data.skills.split(',').map((s: string) => s.trim());
      }
    } else if (Array.isArray(data.skills)) {
      // Already an array
      skillsArray = data.skills;
    }

    console.log("🎯 Parsed skills:", skillsArray);

    const parsedSkills = parseSkillsData(skillsArray, data.testScore);
    setSkillsData(parsedSkills);

    // Set test information
    setTestInfo({
      takenOn: data.createdAt || new Date().toISOString(),
      score: data.testScore,
      feedback: data.testFeedback || 'Assessment completed successfully'
    });

  } catch (error: any) {
    console.error("❌ Error fetching user data:", error);
    setError(error.message || "Failed to load skills data. Please try again later.");
  } finally {
    setLoading(false);
  }
};


  const parseSkillsData = (skills: string[], testScore: number): SkillData[] => {
    if (!skills || skills.length === 0) {
      // Default skills based on test score
      console.log("📌 Using default skills");
      return [
        { name: 'JavaScript', score: testScore, category: getCategoryFromScore(testScore), trend: 'up' },
        { name: 'React', score: Math.min(100, testScore + 5), category: getCategoryFromScore(testScore + 5), trend: 'up' },
        { name: 'TypeScript', score: Math.max(0, testScore - 5), category: getCategoryFromScore(testScore - 5), trend: 'stable' },
        { name: 'Node.js', score: Math.max(0, testScore - 10), category: getCategoryFromScore(testScore - 10), trend: 'down' },
        { name: 'SQL', score: Math.max(0, testScore - 15), category: getCategoryFromScore(testScore - 15), trend: 'stable' },
        { name: 'Python', score: Math.min(100, testScore + 10), category: getCategoryFromScore(testScore + 10), trend: 'up' },
      ];
    }

    return skills.map((skill, index) => {
      // Vary scores slightly for visual interest
      const variance = (index % 3 - 1) * 10;
      const score = Math.min(100, Math.max(0, testScore + variance));
      
      return {
        name: skill,
        score,
        category: getCategoryFromScore(score),
        trend: index % 3 === 0 ? 'up' : index % 3 === 1 ? 'stable' : 'down'
      };
    });
  };

  const getCategoryFromScore = (score: number): 'strong' | 'moderate' | 'needs-improvement' => {
    if (score >= 75) return 'strong';
    if (score >= 50) return 'moderate';
    return 'needs-improvement';
  };

  const getBarColor = (score: number) => {
    if (score >= 75) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (score >= 50) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-600';
  };

  const strongSkills = skillsData.filter(s => s.category === 'strong');
  const moderateSkills = skillsData.filter(s => s.category === 'moderate');
  const needsImprovementSkills = skillsData.filter(s => s.category === 'needs-improvement');

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading skills analytics...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching your assessment data</p>
        </div>
      </div>
    );
  }

  // Error state - Assessment not completed
  if (error === 'assessment_incomplete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="bg-gray-900 border-gray-800 text-white max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/10 rounded-full mb-4">
                <AlertCircle className="h-10 w-10 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Assessment Required</h3>
              <p className="text-gray-400">
                Please complete your assessment to view detailed skills analytics.
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - Network or other error
  if (error && error !== 'assessment_incomplete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="bg-gray-900 border-gray-800 text-white max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-red-400">Error Loading Data</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <div className="flex gap-3">
              <Button 
                onClick={fetchUserData} 
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data state
  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <h1 className="text-4xl font-bold">Skills Analytics</h1>
              </div>
              <p className="text-gray-400 text-lg">Your personalized career development insights and recommendations</p>
            </div>
            <Button 
              onClick={fetchUserData}
              variant="outline"
              size="sm"
              className="border-gray-700 hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overall Score Card */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Overall Score
            </CardTitle>
            <p className="text-sm text-gray-400">Your test performance</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="text-6xl font-bold text-blue-500">
                  {userData.testScore}
                  <span className="text-3xl text-gray-500">/100</span>
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
                </div>
              </div>
              <div className="flex-1">
                <Progress 
                  value={userData.testScore} 
                  className="h-3 bg-gray-700" 
                />
                <p className="text-sm text-gray-400 mt-2">
                  {userData.testScore >= 75 ? '🎉 Excellent Performance!' : userData.testScore >= 50 ? '👍 Good Progress!' : '💪 Room for Improvement'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills Breakdown Chart */}
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Skills Analysis
              </CardTitle>
              <p className="text-sm text-gray-400">Strong vs. Needs Improvement</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {skillsData.slice(0, 6).map((skill, index) => (
                  <div 
                    key={index}
                    className="space-y-2 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{skill.name}</span>
                        {skill.trend === 'up' && (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        )}
                        {skill.trend === 'down' && (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <span className="text-gray-400 font-semibold">{skill.score}%</span>
                    </div>
                    <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getBarColor(skill.score)} transition-all duration-1000 ease-out`}
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Summary */}
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Skill Categories
              </CardTitle>
              <p className="text-sm text-gray-400">Distribution by proficiency level</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Strong Skills */}
              {strongSkills.length > 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="font-semibold text-green-400">Strong Skills</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                      {strongSkills.length}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {strongSkills.map((skill, i) => (
                      <Badge key={i} className="bg-green-500/20 text-green-200 border-green-500/30">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Moderate Skills */}
              {moderateSkills.length > 0 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold text-yellow-400">Moderate Skills</span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                      {moderateSkills.length}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {moderateSkills.map((skill, i) => (
                      <Badge key={i} className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Needs Improvement */}
              {needsImprovementSkills.length > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                      <span className="font-semibold text-red-400">Needs Improvement</span>
                    </div>
                    <Badge variant="secondary" className="bg-red-500/20 text-red-300">
                      {needsImprovementSkills.length}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {needsImprovementSkills.map((skill, i) => (
                      <Badge key={i} className="bg-red-500/20 text-red-200 border-red-500/30">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommended Careers */}
        {userData.recommendedCareer && (
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-blue-500" />
                Recommended Careers
              </CardTitle>
              <p className="text-sm text-gray-400">Based on your skills and interests</p>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-lg font-medium text-blue-300 mb-2">
                  {userData.recommendedCareer}
                </p>
                <p className="text-gray-400 text-sm">
                  This career path aligns well with your current skill set and offers strong growth potential.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommended Courses */}
        {userData.recommendedCourses && (
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                Recommended Courses
              </CardTitle>
              <p className="text-sm text-gray-400">Courses to improve your skills</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userData.recommendedCourses.split(',').map((course, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg mt-1">
                        <BookOpen className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-purple-300">{course.trim()}</p>
                        <p className="text-sm text-gray-400 mt-1">Recommended for skill enhancement</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Information */}
        {testInfo && (
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                Test Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Test taken on:</p>
                  <p className="text-lg font-medium">
                    {new Date(testInfo.takenOn).toLocaleString('en-IN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
                <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
                  Latest Result
                </Button>
              </div>
              
              {testInfo.feedback && (
                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <p className="text-sm font-medium text-gray-300 mb-2">AI Feedback:</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{testInfo.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default SkillsAnalyticsPage;
