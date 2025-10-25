/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  PlayCircle, 
  BookOpen, 
  ExternalLink, 
  TrendingUp, 
  Clock,
  Star,
  Bookmark,
  CheckCircle2,
  Target,
  Youtube,
  FileText,
  GraduationCap,
  Loader2,
  AlertCircle,
  Zap,
  Brain,
  RefreshCw
} from 'lucide-react';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface LearningResource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'course';
  platform: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  url: string;
  description: string;
  skill: string;
  rating?: number;
  views?: string;
  thumbnail?: string; 
  isBookmarked?: boolean;
  isCompleted?: boolean;
}

interface LearningPath {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  currentLevel: number;
  targetLevel: number;
  resources: LearningResource[];
}

interface LearningPathData {
  learningPaths: LearningPath[];
  stats: {
    totalSkills: number;
    totalResources: number;
    completedResources: number;
    bookmarkedResources: number;
  };
}

const LearningPathPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [learningData, setLearningData] = useState<LearningPathData | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [filter, setFilter] = useState<'all' | 'video' | 'article' | 'course'>('all');

  useEffect(() => {
    const fetchUserDataAndGenerateLearningPath = async () => {
      try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          console.error("❌ No userId found");
          router.push("/auth");
          return;
        }

        console.log("📚 Starting learning path setup for user:", userId);
        setLoading(true);

        const userResponse = await fetch(
          `${backendUrl}/user/getUserSkillsAndSummary?userId=${userId}`,
          {
            headers: { Authorization: userId }
          }
        );

        if (!userResponse.ok) {
          throw new Error(`HTTP ${userResponse.status}: Failed to fetch user data`);
        }

        const userData = await userResponse.json();
        console.log("✅ User data loaded:", {
          hasSkills: !!userData.skills,
          skillsType: typeof userData.skills,
          skillsCount: Array.isArray(userData.skills) ? userData.skills.length : 0,
          hasSummary: !!userData.resumeSummary
        });

        if (!userData.skills || userData.skills.length === 0) {
          setError("No skills found. Please upload your resume first.");
          setTimeout(() => router.push("/assessment/resume"), 2000);
          return;
        }

        if (!userData.resumeSummary) {
          setError("No resume summary found. Please upload your resume first.");
          setTimeout(() => router.push("/assessment/resume"), 2000);
          return;
        }

        console.log("🎯 Skills array:", userData.skills);
        console.log("📊 Skills count:", userData.skills.length);

        const paths = generateLearningPaths(userData.skills, 75);
        const allResources = paths.flatMap(p => p.resources);
        
        console.log("✅ Learning paths generated:", {
          pathsCount: paths.length,
          totalResources: allResources.length
        });

        setLearningData({
          learningPaths: paths,
          stats: {
            totalSkills: paths.length,
            totalResources: allResources.length,
            completedResources: allResources.filter(r => r.isCompleted).length,
            bookmarkedResources: allResources.filter(r => r.isBookmarked).length,
          }
        });

      } catch (error: any) {
        console.error("❌ Setup error:", error);
        setError(error instanceof Error ? error.message : "Failed to initialize learning path");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndGenerateLearningPath();
  }, [router]);

  const generateLearningPaths = (skills: string[], testScore: number): LearningPath[] => {
    if (!skills || skills.length === 0) {
      console.error("❌ No skills to generate paths");
      return [];
    }

    console.log("🔨 Generating paths for", skills.length, "skills");

    const needsImprovement = skills.slice(0, Math.ceil(skills.length * 0.4));
    const moderate = skills.slice(Math.ceil(skills.length * 0.4), Math.ceil(skills.length * 0.7));

    return skills.map((skill, index) => {
      const isHigh = needsImprovement.includes(skill);
      const isMedium = moderate.includes(skill);
      
      return {
        skill,
        priority: isHigh ? 'high' : isMedium ? 'medium' : 'low',
        currentLevel: Math.max(10, testScore - (index % 20)),
        targetLevel: 90,
        resources: generateResourcesForSkill(skill, index)
      };
    }).sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const generateResourcesForSkill = (skill: string, index: number): LearningResource[] => {
    const resources: LearningResource[] = [];
    
    const getYouTubeThumbnail = (videoId: string) => 
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    const videoDatabase: Record<string, Array<{
      videoId: string;
      title: string;
      channel: string;
      duration: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      views: string;
      rating: number;
    }>> = {
      'Python': [
        { videoId: '_uQrJ0TkZlc', title: 'Python Tutorial - Python Full Course for Beginners', channel: 'Programming with Mosh', duration: '6h 14m', difficulty: 'beginner', views: '25M', rating: 4.9 },
        { videoId: 'rfscVS0vtbw', title: 'Learn Python - Full Course for Beginners', channel: 'freeCodeCamp', duration: '4h 26m', difficulty: 'beginner', views: '35M', rating: 4.8 },
        { videoId: 'WGJJIrtnfpk', title: 'Python in 100 Seconds', channel: 'Fireship', duration: '2m 30s', difficulty: 'beginner', views: '2.1M', rating: 4.9 }
      ],
      'JavaScript': [
        { videoId: 'W6NZfCO5SIk', title: 'JavaScript Tutorial for Beginners', channel: 'Programming with Mosh', duration: '1h 48m', difficulty: 'beginner', views: '8M', rating: 4.9 },
        { videoId: 'PkZNo7MFNFg', title: 'Learn JavaScript - Full Course for Beginners', channel: 'freeCodeCamp', duration: '3h 26m', difficulty: 'beginner', views: '15M', rating: 4.8 },
        { videoId: 'DHjqpvDnNGE', title: 'JavaScript in 100 Seconds', channel: 'Fireship', duration: '2m 10s', difficulty: 'beginner', views: '1.8M', rating: 4.9 }
      ],
      'React': [
        { videoId: 'Tn6-PIqc4UM', title: 'React Course - Beginner\'s Tutorial', channel: 'freeCodeCamp', duration: '10h 25m', difficulty: 'intermediate', views: '12M', rating: 4.8 },
        { videoId: 'SqcY0GlETPk', title: 'React Tutorial for Beginners', channel: 'Programming with Mosh', duration: '1h 48m', difficulty: 'beginner', views: '6M', rating: 4.9 },
        { videoId: 'Tn6-PIqc4UM', title: 'React in 100 Seconds', channel: 'Fireship', duration: '2m 20s', difficulty: 'beginner', views: '1.5M', rating: 4.9 }
      ],
      'Node.js': [
        { videoId: 'TlB_eWDSMt4', title: 'Node.js Tutorial for Beginners', channel: 'Programming with Mosh', duration: '1h 1m', difficulty: 'beginner', views: '4M', rating: 4.8 },
        { videoId: 'Oe421EPjeBE', title: 'Node.js and Express.js - Full Course', channel: 'freeCodeCamp', duration: '8h 16m', difficulty: 'intermediate', views: '3.5M', rating: 4.7 },
        { videoId: 'ENrzD9HAZK4', title: 'Node.js in 100 Seconds', channel: 'Fireship', duration: '2m 15s', difficulty: 'beginner', views: '1.2M', rating: 4.9 }
      ],
      'TypeScript': [
        { videoId: 'BwuLxPH8IDs', title: 'TypeScript Course for Beginners', channel: 'freeCodeCamp', duration: '1h 55m', difficulty: 'intermediate', views: '1.8M', rating: 4.8 },
        { videoId: 'BCg4U1FzODs', title: 'TypeScript Tutorial for Beginners', channel: 'Programming with Mosh', duration: '52m', difficulty: 'beginner', views: '2.5M', rating: 4.9 },
        { videoId: 'zQnBQ4tB3ZA', title: 'TypeScript in 100 Seconds', channel: 'Fireship', duration: '2m 30s', difficulty: 'beginner', views: '1.4M', rating: 4.9 }
      ],
      'Machine Learning': [
        { videoId: 'GwIo3gDZCVQ', title: 'Machine Learning Course - Full Tutorial', channel: 'freeCodeCamp', duration: '10h 0m', difficulty: 'intermediate', views: '8M', rating: 4.8 },
        { videoId: 'Gv9_4yMHFhI', title: 'Machine Learning for Beginners', channel: 'freeCodeCamp', duration: '4h 0m', difficulty: 'beginner', views: '5M', rating: 4.7 },
        { videoId: 'ukzFI9rgwfU', title: 'Machine Learning in 100 Seconds', channel: 'Fireship', duration: '2m 40s', difficulty: 'beginner', views: '1.1M', rating: 4.9 }
      ],
      'SQL': [
        { videoId: 'HXV3zeQKqGY', title: 'SQL Tutorial - Full Course', channel: 'freeCodeCamp', duration: '4h 20m', difficulty: 'beginner', views: '12M', rating: 4.9 },
        { videoId: 'zsjvFFKOm3c', title: 'SQL for Beginners Tutorial', channel: 'Programming with Mosh', duration: '3h 10m', difficulty: 'beginner', views: '6M', rating: 4.8 },
        { videoId: 'xiUTqnI6xk8', title: 'SQL in 100 Seconds', channel: 'Fireship', duration: '2m 20s', difficulty: 'beginner', views: '900K', rating: 4.9 }
      ],
      'Docker': [
        { videoId: 'fqMOX6JJhGo', title: 'Docker Tutorial for Beginners', channel: 'freeCodeCamp', duration: '3h 10m', difficulty: 'intermediate', views: '4.5M', rating: 4.8 },
        { videoId: 'pTFZFxd4hOI', title: 'Docker Crash Course Tutorial', channel: 'TechWorld with Nana', duration: '1h 15m', difficulty: 'beginner', views: '3M', rating: 4.9 },
        { videoId: 'Gjnup-PuquQ', title: 'Docker in 100 Seconds', channel: 'Fireship', duration: '2m 30s', difficulty: 'beginner', views: '1.6M', rating: 4.9 }
      ],
      'Git': [
        { videoId: 'RGOj5yH7evk', title: 'Git and GitHub for Beginners', channel: 'freeCodeCamp', duration: '1h 8m', difficulty: 'beginner', views: '5M', rating: 4.9 },
        { videoId: 'HkdAHXoRtos', title: 'Git Tutorial for Beginners', channel: 'Programming with Mosh', duration: '1h 10m', difficulty: 'beginner', views: '4M', rating: 4.8 },
        { videoId: 'hwP7WQkmECE', title: 'Git in 100 Seconds', channel: 'Fireship', duration: '2m 15s', difficulty: 'beginner', views: '1.1M', rating: 4.9 }
      ]
    };

    const skillVideos = videoDatabase[skill] || [
      { videoId: '', title: `${skill} Complete Tutorial`, channel: 'YouTube', duration: '8h 45m', difficulty: 'beginner', views: '2.3M', rating: 4.8 },
      { videoId: '', title: `${skill} in 100 Seconds`, channel: 'Fireship', duration: '2m', difficulty: 'beginner', views: '1.5M', rating: 4.9 },
      { videoId: '', title: `Advanced ${skill} Guide`, channel: 'YouTube', duration: '3h 20m', difficulty: 'advanced', views: '890K', rating: 4.7 }
    ];

    skillVideos.forEach((video, idx) => {
      const videoUrl = video.videoId 
        ? `https://www.youtube.com/watch?v=${video.videoId}`
        : `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}`;
      
      const thumbnail = video.videoId 
        ? getYouTubeThumbnail(video.videoId)
        : undefined;

      resources.push({
        id: `yt-${skill}-${idx + 1}`,
        title: video.title,
        type: 'video',
        platform: video.channel,
        duration: video.duration,
        difficulty: video.difficulty,
        url: videoUrl,
        description: `${video.difficulty === 'beginner' ? 'Perfect starting point' : video.difficulty === 'intermediate' ? 'Take your skills to the next level' : 'Master advanced concepts'} with this ${video.duration} ${skill} tutorial from ${video.channel}.`,
        skill,
        rating: video.rating,
        views: video.views,
        thumbnail: thumbnail,
        isBookmarked: index < 2 && idx === 0,
        isCompleted: index === 0 && idx === 0
      });
    });

    resources.push(
      {
        id: `blog-${skill}-1`,
        title: `The Ultimate ${skill} Guide for 2025`,
        type: 'article',
        platform: 'Medium',
        duration: '15 min read',
        difficulty: 'intermediate',
        url: `https://medium.com/search?q=${encodeURIComponent(skill)}`,
        description: `Comprehensive written guide covering ${skill} with practical examples and code snippets.`,
        skill,
        rating: 4.6,
        views: '45K reads',
        isBookmarked: false,
        isCompleted: false
      },
      {
        id: `blog-${skill}-2`,
        title: `${skill} Best Practices in Production`,
        type: 'article',
        platform: 'Dev.to',
        duration: '12 min read',
        difficulty: 'advanced',
        url: `https://dev.to/search?q=${encodeURIComponent(skill)}`,
        description: `Learn industry best practices and real-world applications of ${skill}.`,
        skill,
        rating: 4.8,
        views: '32K reads',
        isBookmarked: index < 3,
        isCompleted: false
      }
    );

    resources.push(
      {
        id: `course-${skill}-1`,
        title: `${skill} Bootcamp 2025 - Complete Guide`,
        type: 'course',
        platform: 'Udemy',
        duration: '42 hours',
        difficulty: 'beginner',
        url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`,
        description: `Comprehensive ${skill} course with hands-on projects, quizzes, and certificate.`,
        skill,
        rating: 4.7,
        views: '125K students',
        isBookmarked: false,
        isCompleted: false
      },
      {
        id: `course-${skill}-2`,
        title: `Advanced ${skill} Masterclass`,
        type: 'course',
        platform: 'Coursera',
        duration: '6 weeks',
        difficulty: 'advanced',
        url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
        description: `University-level ${skill} course with industry projects and certification.`,
        skill,
        rating: 4.9,
        views: '89K students',
        isBookmarked: false,
        isCompleted: false
      }
    );

    return resources;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Youtube className="h-5 w-5" />;
      case 'article': return <FileText className="h-5 w-5" />;
      case 'course': return <GraduationCap className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white text-lg">Loading your personalized learning path...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching your skills and recommendations</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-red-500/10 border border-red-500 rounded-lg p-6 max-w-md text-white">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <div className="flex gap-3 w-full">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1 border-red-500 hover:bg-red-500/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button 
                onClick={() => router.push('/assessment/resume')}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Upload Resume
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!learningData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  const { learningPaths, stats } = learningData;
  
  const filteredPaths = learningPaths.filter(path => 
    (selectedSkill === 'all' || path.skill === selectedSkill)
  );

  const allResources = filteredPaths.flatMap(path => path.resources);
  const filteredResources = allResources.filter(resource => 
    filter === 'all' || resource.type === filter
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Brain className="h-6 w-6 text-purple-500" />
            </div>
            <h1 className="text-4xl font-bold">Your Learning Path</h1>
          </div>
          <p className="text-gray-400 text-lg">Personalized resources based on your skills and career goals</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Skills to Learn</p>
                  <p className="text-3xl font-bold text-purple-400">{stats.totalSkills}</p>
                </div>
                <Target className="h-10 w-10 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Resources</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.totalResources}</p>
                </div>
                <BookOpen className="h-10 w-10 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-400">{stats.completedResources}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Bookmarked</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.bookmarkedResources}</p>
                </div>
                <Bookmark className="h-10 w-10 text-yellow-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedSkill === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSkill('all')}
                  className={selectedSkill === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-600 hover:bg-gray-800'}
                >
                  All Skills
                </Button>
                {learningPaths.slice(0, 5).map(path => (
                  <Button
                    key={path.skill}
                    variant={selectedSkill === path.skill ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSkill(path.skill)}
                    className={selectedSkill === path.skill ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-600 hover:bg-gray-800'}
                  >
                    {path.skill}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-600 hover:bg-gray-800'}
                >
                  All Types
                </Button>
                <Button
                  variant={filter === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('video')}
                  className={filter === 'video' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-600 hover:bg-gray-800'}
                >
                  <Youtube className="h-4 w-4 mr-1" />
                  Videos
                </Button>
                <Button
                  variant={filter === 'article' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('article')}
                  className={filter === 'article' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-600 hover:bg-gray-800'}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Articles
                </Button>
                <Button
                  variant={filter === 'course' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('course')}
                  className={filter === 'course' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-600 hover:bg-gray-800'}
                >
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Courses
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Paths */}
        {filteredPaths.map((path, pathIndex) => (
          <Card 
            key={path.skill} 
            className="bg-gray-900/80 border-gray-700 animate-fade-in backdrop-blur-sm"
            style={{ animationDelay: `${pathIndex * 100}ms` }}
          >
            <CardHeader className="border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white">{path.skill}</CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                      Progress: {path.currentLevel}% → {path.targetLevel}%
                    </p>
                  </div>
                </div>
                <Badge className={`${getPriorityColor(path.priority)} border`}>
                  {path.priority.toUpperCase()} PRIORITY
                </Badge>
              </div>
              <Progress 
                value={path.currentLevel} 
                className="h-2 mt-3 bg-gray-800 [&>div]:bg-blue-500" 
              />
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {path.resources
                  .filter(r => filter === 'all' || r.type === filter)
                  .map((resource, resourceIndex) => (
                    <div
                      key={resource.id}
                      className="group bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500/50 hover:bg-gray-800/80 transition-all duration-300 cursor-pointer animate-slide-up backdrop-blur-sm"
                      style={{ animationDelay: `${(pathIndex * 100) + (resourceIndex * 50)}ms` }}
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      {/* YouTube Thumbnail */}
                      {resource.type === 'video' && resource.thumbnail && (
                        <div className="relative h-48 w-full overflow-hidden bg-gray-900">
                          <img
                            src={resource.thumbnail}
                            alt={resource.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = `https://img.youtube.com/vi/default/maxresdefault.jpg`;
                            }}
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircle className="h-16 w-16 text-white" />
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                            {resource.duration}
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-blue-400">
                            {getTypeIcon(resource.type)}
                            <span className="text-xs font-medium">{resource.platform}</span>
                          </div>
                          <div className="flex gap-1">
                            {resource.isBookmarked && (
                              <Bookmark className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            )}
                            {resource.isCompleted && (
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                            )}
                          </div>
                        </div>

                        <h4 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {resource.title}
                        </h4>

                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {resource.description}
                        </p>

                        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                          {!resource.thumbnail && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {resource.duration}
                            </div>
                          )}
                          {resource.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              {resource.rating}
                            </div>
                          )}
                          {resource.views && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {resource.views}
                            </div>
                          )}
                        </div>

                        <Badge className={`${getDifficultyColor(resource.difficulty)} text-xs border`}>
                          {resource.difficulty}
                        </Badge>

                        <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-blue-400">Click to view</span>
                          <ExternalLink className="h-4 w-4 text-blue-400" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No resources found</h3>
              <p className="text-gray-500">Try adjusting your filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Animations */}
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

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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

        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default LearningPathPage;
